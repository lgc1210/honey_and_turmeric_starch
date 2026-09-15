import { vietnamPhoneRegex } from "@/config/site";
import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";

export const OrderStatusEnum = z.enum(OrderStatus);

export const checkoutSchema = z.object({
	recipientName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(150),
	recipientEmail: z.email("Email không hợp lệ").max(150),
	recipientPhone: z.string().regex(vietnamPhoneRegex, "Số điện thoại không hợp lệ"),

	shippingProvince: z.string().min(1, "Vui lòng chọn tỉnh/thành").max(100),
	shippingDistrict: z.string().min(1, "Vui lòng chọn quận/huyện").max(100),
	shippingWard: z.string().min(1, "Vui lòng chọn phường/xã").max(100),
	shippingAddress: z.string().min(1, "Vui lòng nhập địa chỉ").max(255),

	note: z.string().max(1000).optional(),
	couponCode: z.string().max(50).optional(),
});

export const updateOrderStatusSchema = z.object({
	orderId: z.coerce.number(),
	status: OrderStatusEnum,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
