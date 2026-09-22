import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "../constants";
import { OrderStatusSelect } from "./order-status-select";
import { PaymentStatusSelect } from "./payment-status-select";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

type OrderDetailData = {
	id: string;
	orderNumber: string;
	status: OrderStatus;
	createdAt: string;
	recipientName: string;
	recipientEmail: string;
	recipientPhone: string;
	shippingProvince: string;
	shippingWard: string;
	shippingAddress: string;
	note: string | null;
	subtotal: string;
	discountAmount: string;
	shippingFee: string;
	totalAmount: string;
	items: {
		id: string;
		productName: string;
		variantName: string | null;
		sku: string;
		unitPrice: string;
		quantity: number;
		subtotal: string;
	}[];
	payments: { id: string; provider: string; status: PaymentStatus; amount: string; paidAt: string | null }[];
	couponUsages: { id: string; discountAmount: string; coupon: { code: string } }[];
};

export function OrderDetail({ order }: { order: OrderDetailData }) {
	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3 border border-border p-4'>
				<div className='space-y-2'>
					<Badge variant={ORDER_STATUS_VARIANT[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
					<p className='font-mono text-lg font-semibold text-foreground'>{order.orderNumber}</p>
					<p className='text-sm text-muted-foreground'>Đặt lúc {formatDate(order.createdAt)}</p>
				</div>
				<div className='flex items-center gap-3'>
					<OrderStatusSelect orderId={order.id} status={order.status} />
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<section className='border border-border p-4'>
					<h2 className='mb-3 font-semibold text-foreground'>Người nhận</h2>
					<dl className='space-y-1 text-sm'>
						<div className='flex justify-between gap-4'>
							<dt className='text-muted-foreground'>Họ tên</dt>
							<dd className='text-foreground'>{order.recipientName}</dd>
						</div>
						<div className='flex justify-between gap-4'>
							<dt className='text-muted-foreground'>Email</dt>
							<dd className='text-foreground'>{order.recipientEmail}</dd>
						</div>
						<div className='flex justify-between gap-4'>
							<dt className='text-muted-foreground'>Điện thoại</dt>
							<dd className='text-foreground'>{order.recipientPhone}</dd>
						</div>
					</dl>
				</section>

				<section className='border border-border p-4'>
					<h2 className='mb-3 font-semibold text-foreground'>Địa chỉ giao hàng</h2>
					<p className='text-sm text-foreground'>
						{order.shippingAddress}, {order.shippingWard}, {order.shippingProvince}
					</p>
					{order.note && (
						<p className='mt-2 text-sm text-muted-foreground'>
							<span className='font-medium text-foreground'>Ghi chú: </span>
							{order.note}
						</p>
					)}
				</section>
			</div>

			<section className='border border-border p-4'>
				<h2 className='mb-3 font-semibold text-foreground'>Sản phẩm</h2>
				<div className='divide-y divide-border'>
					{order.items.map((item) => (
						<div key={item.id} className='flex items-center justify-between gap-2 py-2 text-sm'>
							<div>
								<p className='text-foreground'>
									{item.productName}
									{item.variantName ? ` — ${item.variantName}` : ""}
								</p>
								<p className='text-xs text-muted-foreground'>
									SKU: {item.sku} · {formatCurrency(item.unitPrice)} × {item.quantity}
								</p>
							</div>
							<p className='shrink-0 font-medium text-foreground'>{formatCurrency(item.subtotal)}</p>
						</div>
					))}
				</div>

				<div className='mt-3 space-y-1 border-t border-border pt-3 text-sm'>
					<div className='flex justify-between text-muted-foreground'>
						<span>Tạm tính</span>
						<span>{formatCurrency(order.subtotal)}</span>
					</div>
					{Number(order.discountAmount) > 0 && (
						<div className='flex justify-between text-muted-foreground'>
							<span>Giảm giá{order.couponUsages[0] ? ` (${order.couponUsages[0].coupon.code})` : ""}</span>
							<span>-{formatCurrency(order.discountAmount)}</span>
						</div>
					)}
					<div className='flex justify-between text-muted-foreground'>
						<span>Phí vận chuyển</span>
						<span>{formatCurrency(order.shippingFee)}</span>
					</div>
					<div className='flex justify-between font-semibold text-foreground'>
						<span>Tổng cộng</span>
						<span>{formatCurrency(order.totalAmount)}</span>
					</div>
				</div>
			</section>

			<section className='border border-border p-4'>
				<h2 className='mb-3 font-semibold text-foreground'>Thanh toán</h2>
				{order.payments.length === 0 ? (
					<p className='text-sm text-muted-foreground'>Chưa có giao dịch thanh toán.</p>
				) : (
					<div className='space-y-3'>
						{order.payments.map((payment) => (
							<div key={payment.id} className='flex flex-wrap items-center justify-between gap-3 text-sm'>
								<div>
									<p className='text-foreground'>
										{payment.provider} · {formatCurrency(payment.amount)}
									</p>
									{payment.paidAt && (
										<p className='text-xs text-muted-foreground'>Đã thanh toán lúc {formatDate(payment.paidAt)}</p>
									)}
								</div>
								<PaymentStatusSelect paymentId={payment.id} status={payment.status} />
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
