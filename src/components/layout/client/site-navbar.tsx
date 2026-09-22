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
						className={`text-sm transition-colors hover:text-foreground ${
							isActive ? "text-primary font-medium" : "text-muted-foreground"
						}`}>
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
}
