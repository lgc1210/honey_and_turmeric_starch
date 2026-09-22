"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "../constants";
import { OrderStatusSelect } from "./order-status-select";
import type { OrderStatus } from "@/generated/prisma/enums";
import paths from "@/config/path";

type OrderRow = {
	id: string;
	orderNumber: string;
	recipientName: string;
	totalAmount: string;
	status: OrderStatus;
	createdAt: string;
};

export function OrderTable({ orders }: { orders: OrderRow[] }) {
	if (orders.length === 0) {
		return <p className='text-sm text-muted-foreground'>Không tìm thấy đơn hàng nào.</p>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Mã đơn</TableHead>
					<TableHead>Khách hàng</TableHead>
					<TableHead>Tổng tiền</TableHead>
					<TableHead>Ngày tạo</TableHead>
					<TableHead>Trạng thái</TableHead>
					<TableHead>Đổi trạng thái</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{orders.map((order) => (
					<TableRow key={order.id}>
						<TableCell className='font-medium'>
							<Link href={`${paths.admin.orders}/${order.id}`} className='underline-offset-4 hover:underline'>
								{order.orderNumber}
							</Link>
						</TableCell>
						<TableCell>{order.recipientName}</TableCell>
						<TableCell>{formatCurrency(order.totalAmount)}</TableCell>
						<TableCell>{formatDate(order.createdAt)}</TableCell>
						<TableCell>
							<Badge variant={ORDER_STATUS_VARIANT[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
						</TableCell>
						<TableCell>
							<OrderStatusSelect orderId={order.id} status={order.status} />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
