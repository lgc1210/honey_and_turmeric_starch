"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkItem {
	href: string;
	label: string;
}

export function NavLinks({ links }: { links: NavLinkItem[] }) {
	const pathname = usePathname();

	return (
		<nav className='hidden items-center gap-6 md:flex'>
			{links.map((link) => {
				const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
				return (
					<Link
						key={link.href}
						href={link.href}
						className={`relative py-1 text-sm transition-colors hover:text-foreground ${
							isActive ? "text-primary font-medium" : "text-muted-foreground"
						}`}>
						{link.label}
						<span
							className={`absolute inset-x-0 -bottom-1 h-0.5 bg-primary transition-transform duration-200 ${
								isActive ? "scale-x-100" : "scale-x-0"
							}`}
						/>
					</Link>
				);
			})}
		</nav>
	);
}
