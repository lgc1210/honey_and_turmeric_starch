"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/features/auth/api/actions";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import paths from "@/config/path";
import { ADMIN_SIDEBAR_COLLAPSE_COOKIE } from "@/config/site";
import {
	House,
	ChartBarStacked,
	Package,
	Ticket,
	ShoppingBasket,
	Users,
	LogOut,
	ChevronRight,
	ChevronLeft,
} from "lucide-react";

const NAV_ITEMS = [
	{ href: paths.admin.dashboard, label: "Tổng quan", icon: House },
	{ href: paths.admin.categories, label: "Danh mục", icon: ChartBarStacked },
	{ href: paths.admin.products, label: "Sản phẩm", icon: Package },
	{ href: paths.admin.coupons, label: "Mã giảm giá", icon: Ticket },
	{ href: paths.admin.orders, label: "Đơn hàng", icon: ShoppingBasket },
	{ href: paths.admin.accounts, label: "Tài khoản", icon: Users },
];

// Chỉ là tuỳ chọn hiển thị (collapsed hay không), không phải dữ liệu nhạy cảm.
// Lưu bằng COOKIE (không phải localStorage): AdminShell (Server Component) đọc được
// cookie ngay trong lúc render HTML đầu tiên, nên server và client luôn khớp nhau
// ngay từ đầu — không còn hiện tượng "mở rộng rồi mới co lại" (FOUC) như khi phải chờ
// client đọc localStorage sau khi mount. Tên cookie dùng chung 1 hằng số duy nhất ở
// config/site.ts để tránh lệch tên giữa nơi ghi (component này) và nơi đọc (AdminShell).
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function persistCollapsed(next: boolean): void {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${ADMIN_SIDEBAR_COLLAPSE_COOKIE}=${next ? "1" : "0"}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

interface AdminSidebarProps {
	adminEmail: string;
	initialCollapsed: boolean;
}

export default function AdminSidebar({ adminEmail, initialCollapsed }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [collapsed, setCollapsed] = useState(initialCollapsed);

	function toggleSidebar() {
		setCollapsed((prev) => {
			const next = !prev;
			persistCollapsed(next);
			return next;
		});
		// Next.js có thể đã cache sẵn RSC payload của các trang khác (prefetch) từ
		// trước khi cookie đổi — refresh để lần điều hướng tiếp theo lấy đúng giá trị
		// initialCollapsed mới, không bị "trả về trạng thái cũ" khi bấm sang trang khác.
		router.refresh();
	}

	return (
		<aside
			className={cn(
				"flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
				collapsed ? "w-16" : "w-56",
			)}>
			<div
				className={cn(
					"flex items-center border-b border-border px-4 py-4",
					collapsed ? "justify-center" : "justify-between",
				)}>
				{!collapsed && (
					<div>
						<span className='font-sans text-lg font-bold text-foreground'>Kim Bạc Store</span>
						<p className='text-xs text-muted-foreground'>Quản trị</p>
					</div>
				)}
				<Button
					type='button'
					variant='outline'
					size='icon-sm'
					onClick={toggleSidebar}
					aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}>
					{collapsed ? <ChevronRight className='size-4' /> : <ChevronLeft className='size-4' />}
				</Button>
			</div>

			<nav className='flex-1 space-y-1 px-2 py-4'>
				{NAV_ITEMS.map((item) => {
					const isActive = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							title={collapsed ? item.label : undefined}
							className={cn(
								"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
								collapsed && "justify-center",
								isActive
									? "bg-accent font-medium text-foreground"
									: "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
							)}>
							<item.icon className='h-4 w-4 shrink-0' />
							{!collapsed && <span>{item.label}</span>}
						</Link>
					);
				})}
			</nav>

			<div className='border-t border-border p-3'>
				{!collapsed && <p className='truncate px-1 text-xs text-muted-foreground'>{adminEmail}</p>}
				<form action={logoutAction} className={collapsed ? "mt-2 flex justify-center" : "mt-2"}>
					<Button
						type='submit'
						variant='outline'
						size={collapsed ? "icon-lg" : "lg"}
						className={collapsed ? "" : "flex w-full items-center gap-2"}
						title={collapsed ? "Đăng xuất" : undefined}
						aria-label={collapsed ? "Đăng xuất" : undefined}>
						{!collapsed && <span>Đăng xuất</span>}
						<LogOut />
					</Button>
				</form>
			</div>
		</aside>
	);
}
