"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateOrderStatusAction } from "../api/actions";

const STATUSES = ["Pending", "Confirmed", "Processing", "Completed", "Cancelled"] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
	Pending: "Chờ xác nhận",
	Confirmed: "Đã xác nhận",
	Processing: "Đang xử lý",
	Completed: "Hoàn thành",
	Cancelled: "Đã huỷ",
};

type OrderRow = {
	id: string;
	orderNumber: string;
	recipientName: string;
	totalAmount: string;
	status: (typeof STATUSES)[number];
	createdAt: string;
};

function OrderStatusSelect({ orderId, status }: { orderId: string; status: (typeof STATUSES)[number] }) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function onChange(next: string) {
		setError("");
		setPending(true);
		const result = await updateOrderStatusAction({ orderId, status: next });
		setPending(false);
		if (!result.success) {
			setError(result.error);
			return;
		}
		router.refresh();
	}

	return (
		<div>
			<select
				defaultValue={status}
				disabled={pending}
				className="h-8 border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				onChange={(e) => onChange(e.target.value)}>
				{STATUSES.map((value) => (
					<option key={value} value={value}>
						{STATUS_LABEL[value]}
					</option>
				))}
			</select>
			{error && <p className="mt-1 text-xs text-destructive">{error}</p>}
		</div>
	);
}

export function OrderTable({ orders }: { orders: OrderRow[] }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Mã đơn</TableHead>
					<TableHead>Khách hàng</TableHead>
					<TableHead>Tổng tiền</TableHead>
					<TableHead>Ngày tạo</TableHead>
					<TableHead>Trạng thái</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{orders.map((order) => (
					<TableRow key={order.id}>
						<TableCell className="font-medium">{order.orderNumber}</TableCell>
						<TableCell>{order.recipientName}</TableCell>
						<TableCell>{formatCurrency(order.totalAmount)}</TableCell>
						<TableCell>{formatDate(order.createdAt)}</TableCell>
						<TableCell>
							<OrderStatusSelect orderId={order.id} status={order.status} />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
