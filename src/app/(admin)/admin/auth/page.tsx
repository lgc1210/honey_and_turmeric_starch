import { LoginForm } from "@/features/admin/components/admin-forms";

export default function AdminAuthPage() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f9f1e3,#f3e3c5_35%,#efe0b8_100%)] px-4'>
			<div className='w-full max-w-md rounded-2xl border border-[#ecd8bd] bg-[#fffaf3] p-7 shadow-[0_20px_45px_rgba(110,83,48,0.12)]'>
				<div className='mb-6 text-center'>
					<div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5cb63] text-xl font-bold text-[#2d1b12]'>KB</div>
					<h1 className='mt-4 text-2xl font-semibold text-[#2d1b12]'>Đăng nhập Admin</h1>
					<p className='mt-2 text-sm text-[#6a4d32]'>Quản lý cửa hàng Kim Bac Store</p>
				</div>

				<LoginForm />
			</div>
		</div>
	);
}
