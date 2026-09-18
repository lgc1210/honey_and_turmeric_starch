import AdminSidebar from "../layout/admin/sidebar";
import { requireAdmin } from "@/features/auth/api/session";

export async function AdminShell({ children }: { children: React.ReactNode }) {
	const admin = await requireAdmin();

	return (
		<div className='flex min-h-svh bg-background text-foreground'>
			<AdminSidebar adminEmail={admin.email} />
			<main className='flex-1 overflow-y-auto p-4 md:p-8'>{children}</main>
		</div>
	);
}
