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

export const ORDER_STATUS_OPTIONS = [
	{
		value: "Pending",
		label: "Chờ xác nhận",
	},
	{
		value: "Confirmed",
		label: "Đã xác nhận",
	},
	{
		value: "Processing",
		label: "Đang xử lý",
	},
	{
		value: "Completed",
		label: "Hoàn thành",
	},
	{
		value: "Cancelled",
		label: "Đã hủy",
	},
] as const;
