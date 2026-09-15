export default function CheckoutPage() {
	return (
		<main className='mx-auto max-w-5xl px-4 py-10'>
			<h1 className='mb-6 text-3xl font-semibold text-[#2d1b12]'>Thanh toán</h1>
			<div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
				<section className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
					<div className='space-y-4'>
						<div>
							<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Họ tên</label>
							<input className='w-full rounded-xl border border-[#ecd8bd] bg-[#fffaf3] px-3 py-2.5' defaultValue='Nguyễn Thị Lan' />
						</div>
						<div>
							<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Số điện thoại</label>
							<input className='w-full rounded-xl border border-[#ecd8bd] bg-[#fffaf3] px-3 py-2.5' defaultValue='0901234567' />
						</div>
						<div>
							<label className='mb-2 block text-sm font-medium text-[#2d1b12]'>Địa chỉ</label>
							<textarea className='min-h-24 w-full rounded-xl border border-[#ecd8bd] bg-[#fffaf3] px-3 py-2.5' defaultValue='12 Lê Lợi, Quận 1, TP.HCM' />
						</div>
					</div>
				</section>

				<aside className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
					<h2 className='text-xl font-semibold text-[#2d1b12]'>Đơn hàng</h2>
					<div className='mt-4 space-y-3 text-[#5d4534]'>
						<div className='flex justify-between'><span>Mật ong rừng</span><span>₫840.000</span></div>
						<div className='flex justify-between'><span>Tinh bột nghệ</span><span>₫290.000</span></div>
						<div className='flex justify-between font-semibold text-[#2d1b12]'><span>Tổng</span><span>₫1.160.000</span></div>
					</div>
					<button className='mt-6 w-full rounded-xl bg-[#f5cb63] px-4 py-3 font-semibold text-[#2d1b12]'>Xác nhận đặt hàng</button>
				</aside>
			</div>
		</main>
	);
}
