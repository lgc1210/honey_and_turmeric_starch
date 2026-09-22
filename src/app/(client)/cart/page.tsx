import Link from "next/link";
import { Button } from "@/components/ui/button";
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
				<h1 className='font-serif text-2xl font-semibold text-foreground'>Giỏ hàng trống</h1>
				<p className='mt-2 text-muted-foreground'>Hãy chọn vài sản phẩm yêu thích để tiếp tục nhé.</p>
				<Button className='mt-6 cursor-pointer'>
					<Link href={paths.client.products}>Tiếp tục mua sắm</Link>
				</Button>
			</div>
		);
	}

	const qualifiesForFreeShipping = cart.subtotal >= SHIPPING.FREE_THRESHOLD;

	return (
		<div>
			<h1 className='mb-6 font-serif text-2xl font-semibold text-foreground'>Giỏ hàng</h1>

			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='border border-border p-4 lg:col-span-2'>
					{cart.items.map((item) => (
						<CartItemRow key={item.id} item={item} />
					))}
				</div>

				<div className='h-fit space-y-4 border border-border p-4'>
					<h2 className='font-semibold text-foreground'>Tóm tắt đơn hàng</h2>
					<div className='flex justify-between text-sm'>
						<span className='text-muted-foreground'>Tạm tính ({cart.itemCount} sản phẩm)</span>
						<span className='text-foreground'>{formatCurrency(cart.subtotal)}</span>
					</div>
					<p className='text-xs text-muted-foreground'>
						{qualifiesForFreeShipping
							? "Đơn hàng của bạn được miễn phí vận chuyển."
							: `Miễn phí vận chuyển cho đơn từ ${formatCurrency(SHIPPING.FREE_THRESHOLD)}. Phí ship mặc định ${formatCurrency(SHIPPING.FLAT_FEE)}, mã giảm giá (nếu có) áp dụng ở bước thanh toán.`}
					</p>
					<Button size='lg' className='w-full cursor-pointer'>
						<Link href={paths.client.checkout}>Tiến hành thanh toán</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
