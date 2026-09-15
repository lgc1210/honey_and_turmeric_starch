import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/features/admin/mock-data";

const iconMap = {
	Dashboard: LayoutDashboard,
	Products: Package,
	Categories: Tags,
	Orders: ShoppingCart,
	Accounts: Users,
} as const;

export function AdminShell({
	children,
	title,
	description,
	activeHref,
}: {
	children: ReactNode;
	title: string;
	description: string;
	activeHref: string;
}) {
	const activeItem = adminNavItems.find((item) => item.href === activeHref) ?? adminNavItems[0];

	return (
		<div className='min-h-screen bg-[rgba(247,239,229,0.75)] text-[#2d1b12]'>
			<div className='mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6'>
				<aside className='hidden w-72 shrink-0 rounded-2xl border border-[#ecd8bd] bg-[#fffaf3] p-4 shadow-[0_12px_32px_rgba(110,83,48,0.08)] lg:block'>
					<div className='mb-6 flex items-center gap-3 border-b border-[#f0e2c8] pb-4'>
						<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5cb63] text-sm font-bold text-[#3b2415]'>KB</div>
						<div>
							<p className='text-xs uppercase tracking-[0.18em] text-[#8c6a42]'>ADMIN</p>
							<h1 className='text-lg font-semibold'>Kim Bac Store</h1>
						</div>
					</div>

					<nav className='space-y-2'>
						{adminNavItems.map((item) => {
							const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
							const isActive = item.href === activeItem.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
										isActive ? 'bg-[#f5cb63] text-[#2d1b12]' : 'text-[#6a4d32] hover:bg-[#f9f1e3]',
									)}
								>
									<Icon className='h-4 w-4' />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>

					<div className='mt-8 rounded-xl border border-[#f0e2c8] bg-[#f9f3e9] p-3'>
						<div className='flex items-center gap-2 text-[#6a4d32]'>
							<ShieldCheck className='h-4 w-4 text-[#a35f2d]' />
							<span className='text-xs font-semibold uppercase tracking-[0.12em]'>Hệ thống</span>
						</div>
						<p className='mt-2 text-sm text-[#5d4534]'>Bảo mật 2FA và quyền truy cập được quản lý từ đây.</p>
					</div>
				</aside>

				<main className='flex-1'>
					<header className='mb-6 flex items-center justify-between rounded-2xl border border-[#ecd8bd] bg-[#fffaf3] px-5 py-4 shadow-[0_12px_32px_rgba(110,83,48,0.08)]'>
						<div>
							<p className='text-xs uppercase tracking-[0.18em] text-[#8c6a42]'>Admin panel</p>
							<h2 className='mt-1 text-2xl font-semibold text-[#2d1b12]'>{title}</h2>
						</div>
						<div className='flex items-center gap-3'>
							<div className='rounded-full bg-[#f5cb63] px-3 py-1 text-xs font-semibold text-[#2d1b12]'>ONLINE</div>
							<div className='flex items-center gap-2 rounded-full border border-[#ecd8bd] bg-[#fff] px-3 py-1.5 text-sm text-[#5d4534]'>
								<span className='h-2.5 w-2.5 rounded-full bg-[#58a06f]' />
								<span>admin@kimbacstore.vn</span>
							</div>
						</div>
					</header>

					<div className='rounded-2xl border border-[#ecd8bd] bg-[#fffaf3] p-6 shadow-[0_12px_32px_rgba(110,83,48,0.08)]'>
						<p className='mb-6 text-sm text-[#6a4d32]'>{description}</p>
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
