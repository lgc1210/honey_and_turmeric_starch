import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getCart, getCartId } from "@/features/cart/api/service";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export default async function CheckoutPage() {
	const cartId = await getCartId();
	const cart = await getCart(cartId);
	if (cart.items.length === 0) redirect("/cart");

	return (
		<div>
			<h1 className='mb-6 font-serif text-2xl font-semibold text-foreground'>Thanh toán</h1>

			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					<CheckoutForm />
				</div>

				<div className='h-fit space-y-3 border border-border p-4'>
					<h2 className='font-semibold text-foreground'>Đơn hàng của bạn</h2>
					<ul className='divide-y divide-border'>
						{cart.items.map((item) => (
							<li key={item.id} className='flex justify-between gap-2 py-2 text-sm'>
								<span className='text-muted-foreground'>
									{item.variant.product.name}
									{item.variant.name ? ` — ${item.variant.name}` : ""} × {item.quantity}
								</span>
								<span className='shrink-0 text-foreground'>
									{formatCurrency(Number(item.variant.price) * item.quantity)}
								</span>
							</li>
						))}
					</ul>
					<div className='flex justify-between border-t border-border pt-2 text-sm font-medium'>
						<span>Tạm tính</span>
						<span>{formatCurrency(cart.subtotal)}</span>
					</div>
					<p className='text-xs text-muted-foreground'>
						Phí vận chuyển và mã giảm giá (nếu có) sẽ được tính khi đặt hàng.
					</p>
				</div>
			</div>
		</div>
	);
}
