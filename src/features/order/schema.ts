import { vietnamPhoneRegex } from "@/config/site";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const OrderStatusEnum = z.enum([
	OrderStatus.Pending,
	OrderStatus.Confirmed,
	OrderStatus.Processing,
	OrderStatus.Completed,
	OrderStatus.Cancelled,
]);

export const checkoutSchema = z.object({
	recipientName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(150),
	recipientEmail: z.email("Email không hợp lệ").max(150),
	recipientPhone: z.string().regex(vietnamPhoneRegex, "Số điện thoại không hợp lệ"),

	shippingProvince: z.string().min(1, "Vui lòng chọn tỉnh/thành").max(100),
	shippingWard: z.string().min(1, "Vui lòng chọn phường/xã").max(100),
	shippingAddress: z.string().min(1, "Vui lòng nhập địa chỉ").max(255),

	note: z.string().max(1000).optional(),
	couponCode: z.string().max(50).optional(),
});

export const updateOrderStatusSchema = z.object({
	orderId: z.coerce.number(),
	status: OrderStatusEnum,
});

export const orderQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	search: z.string().trim().max(150).optional(),
	status: OrderStatusEnum.optional(),
	fromDate: z.string().optional(),
	toDate: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;

export const updatePaymentStatusSchema = z.object({
	paymentId: z.coerce.number(),
	status: z.enum([PaymentStatus.Pending, PaymentStatus.Paid, PaymentStatus.Failed, PaymentStatus.Refunded]),
});
