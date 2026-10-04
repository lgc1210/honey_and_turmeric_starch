import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SHIPPING } from "@/config/site";
import paths from "@/config/path";
import { getCart, getCartId } from "@/features/cart/api/service";
import { CartItemRow } from "@/features/cart/components/cart-item-row";

export default async function CartPage() {
	const cartId = await getCartId();
	const cart = await getCart(cartId);

	if (cart.items.length === 0) {
		return (
			<div className='py-16 text-center'>
				<h1 className='font-sans text-2xl font-bold text-foreground'>Giỏ hàng trống</h1>
				<p className='mt-2 text-muted-foreground'>Hãy chọn vài sản phẩm yêu thích để tiếp tục nhé.</p>
				<ButtonLink size='lg' href={paths.client.products} className='mt-6'>
					Tiếp tục mua sắm
				</ButtonLink>
			</div>
		);
	}

	const qualifiesForFreeShipping = cart.subtotal >= SHIPPING.FREE_THRESHOLD;

	return (
		<div className='max-w-6xl px-4 py-8 w-full mx-auto'>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Giỏ hàng</h1>

			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='border border-border p-4 lg:col-span-2'>
					{cart.items.map((item) => (
						<CartItemRow key={item.id} item={item} />
					))}
				</div>

				<div className='h-fit space-y-4 border border-border p-4'>
					<h2 className='font-bold text-foreground'>Tóm tắt đơn hàng</h2>
					<div className='flex justify-between text-sm'>
						<span className='text-muted-foreground'>Tạm tính ({cart.itemCount} sản phẩm)</span>
						<span className='text-foreground'>{formatCurrency(cart.subtotal)}</span>
					</div>
					<p className='text-xs text-muted-foreground'>
						{qualifiesForFreeShipping
							? "Đơn hàng của bạn được miễn phí vận chuyển."
							: `Miễn phí vận chuyển cho đơn từ ${formatCurrency(SHIPPING.FREE_THRESHOLD)}. Phí ship mặc định ${formatCurrency(SHIPPING.FLAT_FEE)}, mã giảm giá (nếu có) áp dụng ở bước thanh toán.`}
					</p>
					<ButtonLink size='lg' href={paths.client.checkout} className='w-full'>
						Tiến hành thanh toán
					</ButtonLink>
				</div>
			</div>
		</div>
	);
}
