import { SiteFooter } from "@/components/layout/client/site-footer";
import { SiteHeader } from "@/components/layout/client/site-header";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex min-h-svh flex-col bg-background text-foreground'>
			<SiteHeader />
			<main className='mx-auto w-full max-w-6xl flex-1 px-4 py-8'>{children}</main>
			<SiteFooter />
		</div>
	);
}
