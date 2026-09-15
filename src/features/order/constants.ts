// src/features/order/constants.ts
import { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	Pending: "Chờ xác nhận",
	Confirmed: "Đã xác nhận",
	Processing: "Đang xử lý",
	Completed: "Hoàn thành",
	Cancelled: "Đã hủy",
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
	Pending: "outline",
	Confirmed: "secondary",
	Processing: "secondary",
	Completed: "default",
	Cancelled: "destructive",
};

/** Dùng cho dropdown filter, select trong form */
export const ORDER_STATUS_OPTIONS = Object.values(OrderStatus).map((value) => ({
	value,
	label: ORDER_STATUS_LABEL[value],
}));
