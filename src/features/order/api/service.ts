import { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { PAGINATION } from "@/config/site";

export type AdminOrderQuery = {
	page: number;
	pageSize?: number;
	status?: OrderStatus;
	search?: string;
};

/** Trạng thái kế tiếp hợp lệ — không cho phép nhảy tuỳ ý (VD: Cancelled -> Completed). */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	Pending: ["Confirmed", "Cancelled"],
	Confirmed: ["Processing", "Cancelled"],
	Processing: ["Completed", "Cancelled"],
	Completed: [],
	Cancelled: [],
};

export async function getAdminOrders(query: AdminOrderQuery) {
	const pageSize = query.pageSize || PAGINATION.ADMIN_PAGE_SIZE;

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
