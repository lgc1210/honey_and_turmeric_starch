import { cookies } from "next/headers";
import { requireAdmin } from "@/features/auth/api/session";
import { ADMIN_SIDEBAR_COLLAPSE_COOKIE } from "@/config/site";
import AdminSidebar from "../layout/admin/sidebar";

export async function AdminShell({ children }: { children: React.ReactNode }) {
	const admin = await requireAdmin();
	const initialCollapsed = (await cookies()).get(ADMIN_SIDEBAR_COLLAPSE_COOKIE)?.value === "1";

	return (
		<div className='flex min-h-svh bg-background text-foreground'>
			<AdminSidebar adminEmail={admin.email} initialCollapsed={initialCollapsed} />
			<main className='flex-1 overflow-y-auto p-4 md:p-8'>{children}</main>
		</div>
	);
}
