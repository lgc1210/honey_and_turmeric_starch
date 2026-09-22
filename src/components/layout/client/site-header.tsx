import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import paths from "@/config/path";
import { getCartId, getCartItemCount } from "@/features/cart/api/service";
import { NavLinks } from "./site-navbar";

const NAV_LINKS = [
	{ href: paths.client.home, label: "Trang chủ" },
	{ href: paths.client.products, label: "Cửa hàng" },
];

export async function SiteHeader() {
	// Async server-side fetching stays safe here
	const cartId = await getCartId();
	const itemCount = await getCartItemCount(cartId);

	return (
		<header className='sticky top-0 z-40 border-b border-border bg-card'>
			<div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4'>
				<Link href={paths.client.home} className='font-sans tracking-wider text-2xl font-extrabold text-foreground'>
					Kim Bạc Store
				</Link>

				{/* Pass links to the Client Component */}
				<NavLinks links={NAV_LINKS} />

				<Link
					href={paths.client.cart}
					className='relative flex items-center gap-1 text-foreground'
					aria-label='Giỏ hàng'>
					<ShoppingCart className='size-5' />
					{itemCount > 0 && (
						<span className='absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-medium text-primary-foreground rounded-full'>
							{itemCount > 99 ? "99+" : itemCount}
						</span>
					)}
				</Link>
			</div>
		</header>
	);
}
