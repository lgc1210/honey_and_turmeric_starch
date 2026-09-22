import { Prisma } from "@/generated/prisma/client";
import { DiscountType, EntityStatus, OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { PAGINATION, SHIPPING } from "@/config/site";
import type { CheckoutInput } from "../schema";

export type AdminOrderQuery = {
	page: number;
	pageSize?: number;
	status?: OrderStatus;
	search?: string;
	fromDate?: string;
	toDate?: string;
};

/** Trạng thái kế tiếp hợp lệ — không cho phép nhảy tuỳ ý (VD: Cancelled -> Completed). */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	Pending: [OrderStatus.Confirmed, OrderStatus.Cancelled],
	Confirmed: [OrderStatus.Processing, OrderStatus.Cancelled],
	Processing: [OrderStatus.Completed, OrderStatus.Cancelled],
	Completed: [],
	Cancelled: [],
};

/** Trạng thái thanh toán kế tiếp hợp lệ — Refunded/Failed là trạng thái cuối, không đổi tiếp được nữa. */
const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
	Pending: [PaymentStatus.Paid, PaymentStatus.Failed],
	Paid: [PaymentStatus.Refunded],
	Failed: [PaymentStatus.Pending],
	Refunded: [],
};

export async function getAdminOrders(query: AdminOrderQuery) {
	const pageSize = query.pageSize || PAGINATION.ADMIN_PAGE_SIZE;

	const dateFilter: Prisma.DateTimeFilter = {};

	if (query.fromDate) {
		// Đặt thời gian về 00:00:00 của ngày bắt đầu để không sót đơn hàng
		dateFilter.gte = new Date(new Date(query.fromDate).setHours(0, 0, 0, 0));
	}

	if (query.toDate) {
		// Đặt thời gian về 23:59:59 của ngày kết thúc để lấy hết đơn trong ngày đó
		dateFilter.lte = new Date(new Date(query.toDate).setHours(23, 59, 59, 999));
	}

	const where: Prisma.OrderWhereInput = {
		...(query.status ? { status: query.status } : {}),
		...(query.search
			? {
					OR: [
						{ orderNumber: { contains: query.search, mode: "insensitive" } },
						{ recipientName: { contains: query.search, mode: "insensitive" } },
						{ recipientPhone: { contains: query.search, mode: "insensitive" } },
					],
				}
			: {}),
		// Nếu có bộ lọc từ ngày hoặc đến ngày thì thêm vào câu lệnh where của Prisma
		...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
	};

	const [items, total] = await Promise.all([
		prisma.order.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (query.page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				orderNumber: true,
				recipientName: true,
				recipientPhone: true,
				totalAmount: true,
				status: true,
				createdAt: true,
			},
		}),
		prisma.order.count({ where }),
	]);

	return {
		items: serialize(items),
		total,
		page: query.page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function getAdminOrderById(id: bigint) {
	const order = await prisma.order.findUnique({
		where: { id },
		include: { items: true, payments: true, couponUsages: { include: { coupon: true } } },
	});
	return order ? serialize(order) : null;
}

export async function updateOrderStatus(orderId: bigint, nextStatus: OrderStatus): Promise<void> {
	const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
	if (!order) throw new Error("Đơn hàng không tồn tại");

	if (order.status === nextStatus) return;

	const allowed = ALLOWED_TRANSITIONS[order.status];
	if (!allowed.includes(nextStatus)) {
		throw new Error(`Không thể chuyển đơn hàng từ "${order.status}" sang "${nextStatus}"`);
	}

	await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } });
}

export async function updatePaymentStatus(paymentId: bigint, nextStatus: PaymentStatus): Promise<void> {
	const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { status: true } });
	if (!payment) throw new Error("Không tìm thấy giao dịch thanh toán");

	if (payment.status === nextStatus) return;

	const allowed = ALLOWED_PAYMENT_TRANSITIONS[payment.status];
	if (!allowed.includes(nextStatus)) {
		throw new Error(`Không thể chuyển thanh toán từ "${payment.status}" sang "${nextStatus}"`);
	}

	await prisma.payment.update({
		where: { id: paymentId },
		data: { status: nextStatus, paidAt: nextStatus === PaymentStatus.Paid ? new Date() : undefined },
	});
}

// ===================================================================
// Public (customer-facing) — tạo đơn hàng từ giỏ hàng lúc checkout
// ===================================================================

/**
 * Tạo đơn hàng từ giỏ hàng hiện tại (khách vãng lai, không cần đăng nhập).
 * Giá/tồn kho luôn lấy lại từ DB tại thời điểm đặt hàng — không tin dữ liệu giá
 * client gửi lên. Toàn bộ nằm trong 1 transaction: kiểm tra tồn kho, áp mã giảm
 * giá, trừ kho, tạo Order + OrderItem (snapshot) + Payment, rồi xoá giỏ hàng.
 */
export async function createOrder(cartId: string, input: CheckoutInput) {
	return prisma.$transaction(async (tx) => {
		const cartItems = await tx.cartItem.findMany({
			where: { cartId },
			include: { variant: { include: { product: true } } },
		});

		if (cartItems.length === 0) throw new Error("Giỏ hàng đang trống");

		for (const item of cartItems) {
			const label = item.variant.name ?? item.variant.sku;
			if (item.variant.status !== EntityStatus.Active)
				throw new Error(`"${label}" đã ngừng bán, vui lòng xoá khỏi giỏ hàng`);
			if (item.quantity > item.variant.stockQuantity) {
				throw new Error(`"${label}" chỉ còn ${item.variant.stockQuantity} sản phẩm trong kho`);
			}
		}

		const subtotal = cartItems.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

		let discountAmount = 0;
		let appliedCoupon: { id: bigint } | null = null;

		if (input.couponCode) {
			const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
			const now = new Date();

			if (!coupon) throw new Error("Mã giảm giá không tồn tại");
			if (coupon.status !== EntityStatus.Active) throw new Error("Mã giảm giá đã ngừng hoạt động");
			if (now < coupon.startsAt || now > coupon.expiresAt)
				throw new Error("Mã giảm giá chưa có hiệu lực hoặc đã hết hạn");
			if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
				throw new Error("Mã giảm giá đã hết lượt sử dụng");
			}
			if (coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount)) {
				throw new Error(`Đơn hàng cần tối thiểu ${formatCurrency(coupon.minimumOrderAmount)} để dùng mã này`);
			}

			discountAmount =
				coupon.discountType === DiscountType.Percentage
					? subtotal * (Number(coupon.discountValue) / 100)
					: Number(coupon.discountValue);
			discountAmount = Math.min(discountAmount, subtotal);
			appliedCoupon = coupon;
		}

		const amountAfterDiscount = subtotal - discountAmount;
		const shippingFee = amountAfterDiscount >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.FLAT_FEE;
		const totalAmount = amountAfterDiscount + shippingFee;

		const order = await tx.order.create({
			data: {
				cartId,
				orderNumber: generateOrderNumber(),
				recipientName: input.recipientName,
				recipientEmail: input.recipientEmail,
				recipientPhone: input.recipientPhone,
				shippingProvince: input.shippingProvince,
				shippingWard: input.shippingWard,
				shippingAddress: input.shippingAddress,
				note: input.note,
				subtotal,
				discountAmount,
				shippingFee,
				totalAmount,
				items: {
					create: cartItems.map((item) => ({
						productVariantId: item.variant.id,
						productName: item.variant.product.name,
						sku: item.variant.sku,
						variantName: item.variant.name,
						unitPrice: item.variant.price,
						quantity: item.quantity,
						subtotal: Number(item.variant.price) * item.quantity,
					})),
				},
			},
			include: { items: true },
		});

		if (appliedCoupon) {
			await tx.couponUsage.create({ data: { couponId: appliedCoupon.id, orderId: order.id, discountAmount } });
			await tx.coupon.update({ where: { id: appliedCoupon.id }, data: { usedCount: { increment: 1 } } });
		}

		for (const item of cartItems) {
			await tx.productVariant.update({
				where: { id: item.variant.id },
				data: { stockQuantity: { decrement: item.quantity } },
			});
		}

		// Chưa tích hợp cổng thanh toán thật — mặc định COD (thanh toán khi nhận hàng).
		await tx.payment.create({
			data: { orderId: order.id, provider: "COD", amount: totalAmount, status: PaymentStatus.Pending },
		});

		await tx.cartItem.deleteMany({ where: { cartId } });

		return serialize(order);
	});
}

/** Chỉ trả về đơn hàng nếu đúng giỏ hàng (cartId) đã tạo ra nó — khách vãng lai không có tài khoản
 * để xác thực, nên dùng cartId (đã ký/mã hoá trong cookie) làm bằng chứng sở hữu tạm thời. */
export async function getOrderForConfirmation(orderNumber: string, cartId: string) {
	const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
	if (!order || order.cartId !== cartId) return null;
	return serialize(order);
}
