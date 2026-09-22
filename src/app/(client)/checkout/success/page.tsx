import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import paths from "@/config/path";
import { readCartIdCookie } from "@/lib/cart-cookie";
import { getOrderForConfirmation } from "@/features/order/api/service";
import type { SearchParams } from "@/types/common";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const params = await searchParams;
	const orderNumber = typeof params.order === "string" ? params.order : "";
	const cartId = await readCartIdCookie();

	const order = orderNumber && cartId ? await getOrderForConfirmation(orderNumber, cartId) : null;
	if (!order) notFound();

	return (
		<div className='mx-auto max-w-xl space-y-6 py-8 text-center'>
			<h1 className='font-sans text-3xl font-bold text-foreground'>Đặt hàng thành công!</h1>
			<p className='text-muted-foreground'>Cảm ơn bạn đã đặt hàng tại Kim Bạc Store. Mã đơn hàng của bạn là:</p>
			<p className='font-mono text-lg font-semibold text-primary'>{order.orderNumber}</p>

			<div className='space-y-2 border border-border p-4 text-left'>
				<ul className='divide-y divide-border'>
					{order.items.map((item) => (
						<li key={item.id} className='flex justify-between gap-2 py-2 text-sm'>
							<span className='text-muted-foreground'>
								{item.productName}
								{item.variantName ? ` — ${item.variantName}` : ""} × {item.quantity}
							</span>
							<span className='text-foreground'>{formatCurrency(item.subtotal)}</span>
						</li>
					))}
				</ul>
				<div className='space-y-1 border-t border-border pt-2 text-sm'>
					<div className='flex justify-between text-muted-foreground'>
						<span>Tạm tính</span>
						<span>{formatCurrency(order.subtotal)}</span>
					</div>
					{Number(order.discountAmount) > 0 && (
						<div className='flex justify-between text-muted-foreground'>
							<span>Giảm giá</span>
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
				<p className='text-xs text-muted-foreground'>
					Giao đến: {order.shippingAddress}, {order.shippingWard}, {order.shippingProvince}
				</p>
				<p className='text-xs text-muted-foreground'>
					Đặt lúc {formatDate(order.createdAt)} · Thanh toán khi nhận hàng (COD)
				</p>
			</div>

			<Button size='lg' className='cursor-pointer'>
				<Link href={paths.client.products}>Tiếp tục mua sắm</Link>
			</Button>
		</div>
	);
}
