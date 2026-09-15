import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Kim Bac Store",
	description: "Mật ong & tinh bột nghệ nguyên chất",
};

export default function ClientLayout({ children }: { children: ReactNode }) {
	return (
		<div className='min-h-screen bg-[#fffaf3] text-[#2d1b12]'>
			<header className='border-b border-[#f0e2c8] bg-[#fffaf3]'>
				<div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
					<Link href='/' className='text-lg font-semibold'>Kim Bac Store</Link>
					<nav className='flex items-center gap-6 text-sm text-[#5d4534]'>
						<Link href='/products'>Sản phẩm</Link>
						<Link href='/cart'>Giỏ hàng</Link>
						<Link href='/checkout'>Thanh toán</Link>
					</nav>
				</div>
			</header>
			{children}
		</div>
	);
}
