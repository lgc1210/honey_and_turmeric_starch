const lineItems = [
	{ name: "Mật ong rừng nguyên chất", qty: 2, price: "₫840.000" },
	{ name: "Tinh bột nghệ vàng", qty: 1, price: "₫290.000" },
];

export default function CartPage() {
	return (
		<main className='mx-auto max-w-5xl px-4 py-10'>
			<div className='mb-6'><h1 className='text-3xl font-semibold text-[#2d1b12]'>Giỏ hàng</h1></div>
			<div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
				<section className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
					<div className='space-y-4'>
						{lineItems.map((item) => (
							<div key={item.name} className='flex items-center justify-between rounded-xl border border-[#f1e7d9] bg-[#fffaf3] p-3'>
								<div>
									<p className='font-medium text-[#2d1b12]'>{item.name}</p>
									<p className='text-sm text-[#6a4d32]'>Số lượng: {item.qty}</p>
								</div>
								<p className='font-medium text-[#2d1b12]'>{item.price}</p>
							</div>
						))}
					</div>
				</section>
				<aside className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
					<h2 className='text-xl font-semibold text-[#2d1b12]'>Tóm tắt</h2>
					<div className='mt-4 space-y-3 text-[#5d4534]'>
						<div className='flex justify-between'><span>Tạm tính</span><span>₫1.130.000</span></div>
						<div className='flex justify-between'><span>Phí vận chuyển</span><span>₫30.000</span></div>
						<div className='flex justify-between font-semibold text-[#2d1b12]'><span>Tổng cộng</span><span>₫1.160.000</span></div>
					</div>
					<button className='mt-6 w-full rounded-xl bg-[#f5cb63] px-4 py-3 font-semibold text-[#2d1b12]'>Tiến hành thanh toán</button>
				</aside>
			</div>
		</main>
	);
}
