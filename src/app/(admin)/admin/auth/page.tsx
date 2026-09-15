import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminAuthPage() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f9f1e3,#f3e3c5_35%,#efe0b8_100%)] px-4'>
			<div className='w-full max-w-md rounded-2xl border border-[#ecd8bd] bg-[#fffaf3] p-7 shadow-[0_20px_45px_rgba(110,83,48,0.12)]'>
				<div className='mb-6 text-center'>
					<div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5cb63] text-xl font-bold text-[#2d1b12]'>KB</div>
					<h1 className='mt-4 text-2xl font-semibold text-[#2d1b12]'>Đăng nhập Admin</h1>
					<p className='mt-2 text-sm text-[#6a4d32]'>Quản lý cửa hàng Kim Bac Store</p>
				</div>

				<form className='space-y-4'>
					<div>
						<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Email</label>
						<input type='email' defaultValue='admin@kimbacstore.vn' className='w-full rounded-xl border border-[#ecd8bd] bg-[#fff] px-3 py-2.5 text-[#2d1b12] outline-none ring-0' />
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Mật khẩu</label>
						<input type='password' defaultValue='••••••••' className='w-full rounded-xl border border-[#ecd8bd] bg-[#fff] px-3 py-2.5 text-[#2d1b12] outline-none ring-0' />
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Mã xác thực 2FA</label>
						<input type='text' inputMode='numeric' maxLength={6} placeholder='123456' className='w-full rounded-xl border border-[#ecd8bd] bg-[#fff] px-3 py-2.5 text-[#2d1b12] outline-none ring-0' />
					</div>

					<div className='flex items-center justify-between text-sm text-[#6a4d32]'>
						<label className='flex items-center gap-2'><input type='checkbox' defaultChecked className='h-4 w-4 accent-[#f5cb63]' />Ghi nhớ đăng nhập</label>
						<Link href='#' className='text-[#a35f2d]'>Quên mật khẩu?</Link>
					</div>

					<Button type='submit' className='w-full'>Đăng nhập</Button>
				</form>
			</div>
		</div>
	);
}
