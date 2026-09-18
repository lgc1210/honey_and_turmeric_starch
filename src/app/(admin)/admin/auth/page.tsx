import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/auth/api/session";
import { LoginForm } from "@/features/auth/components/login-form";
import paths from "@/config/path";

export default async function AdminAuthPage() {
	const admin = await getCurrentAdmin();

	if (admin) redirect(paths.admin.dashboard);

	return (
		<div className='flex min-h-svh items-center justify-center p-4'>
			<div className='w-full max-w-sm border border-border bg-card p-6'>
				<h1 className='mb-1 font-serif text-xl font-semibold text-foreground'>Đăng nhập quản trị</h1>
				<p className='mb-6 text-sm text-muted-foreground'>Kim Bạc Store Admin</p>
				<LoginForm />
			</div>
		</div>
	);
}
