"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/api/actions";
import { Button } from "@/components/ui/button";
import paths from "@/config/path";
import { House, ChartBarStacked, Package, Ticket, ShoppingBasket, Users, LogOut } from "lucide-react";

const NAV_ITEMS = [
	{ href: paths.admin.dashboard, label: "Tổng quan", icon: House },
	{ href: paths.admin.categories, label: "Danh mục", icon: ChartBarStacked },
	{ href: paths.admin.products, label: "Sản phẩm", icon: Package },
	{ href: paths.admin.coupons, label: "Mã giảm giá", icon: Ticket },
	{ href: paths.admin.orders, label: "Đơn hàng", icon: ShoppingBasket },
	{ href: paths.admin.accounts, label: "Tài khoản", icon: Users },
];

interface AdminSidebarProps {
	adminEmail: string;
}

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
	const pathname = usePathname();

	return (
		<aside className='hidden w-56 shrink-0 border-r border-border bg-card md:flex md:flex-col'>
			<div className='border-b border-border px-4 py-4'>
				<span className='font-serif text-lg font-semibold text-foreground'>Kim Bạc Store</span>
				<p className='text-xs text-muted-foreground'>Quản trị</p>
			</div>

			<nav className='flex-1 space-y-1 px-2 py-4'>
				{NAV_ITEMS.map((item) => {
					const isActive = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${
								isActive
									? "bg-accent text-foreground font-medium"
									: "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
							}`}>
							<item.icon className='h-4 w-4' />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className='border-t border-border p-3'>
				<p className='truncate px-1 text-xs text-muted-foreground'>{adminEmail}</p>
				<form action={logoutAction}>
					<Button type='submit' variant='outline' size='sm' className='mt-2 w-full flex items-center gap-2'>
						<span>Đăng xuất</span>
						<LogOut className='size-3' />
					</Button>
				</form>
			</div>
		</aside>
	);
}
