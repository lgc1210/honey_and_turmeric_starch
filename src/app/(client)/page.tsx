import Link from "next/link";

const featuredProducts = [
	{ name: "Mật ong rừng nguyên chất", price: "₫420.000" },
	{ name: "Tinh bột nghệ vàng", price: "₫290.000" },
	{ name: "Combo chăm sóc sức khỏe", price: "₫760.000" },
];

export default function HomePage() {
	return (
		<main className='mx-auto max-w-7xl px-4 py-12'>
			<section className='rounded-3xl border border-[#ecd8bd] bg-[linear-gradient(135deg,#fffaf3,#f9efdd)] p-8 shadow-[0_18px_40px_rgba(77,58,38,0.08)]'>
				<div className='grid items-center gap-8 lg:grid-cols-2'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.2em] text-[#a35f2d]'>Sản phẩm chăm sóc lành mạnh</p>
						<h1 className='mt-4 text-4xl font-semibold leading-tight text-[#2d1b12]'>Mật ong & tinh bột nghệ tự nhiên cho cuộc sống khỏe mạnh</h1>
						<p className='mt-4 max-w-lg text-base text-[#5d4534]'>Nền tảng thương mại điện tử dành cho người tiêu dùng tìm kiếm sản phẩm nguyên chất, an toàn và mang đậm giá trị gia đình.</p>
						<div className='mt-6 flex gap-3'>
							<Link href='/products' className='rounded-xl bg-[#f5cb63] px-5 py-3 text-sm font-semibold text-[#2d1b12]'>Xem sản phẩm</Link>
							<Link href='/checkout' className='rounded-xl border border-[#ecd8bd] bg-white px-5 py-3 text-sm font-semibold text-[#2d1b12]'>Đặt hàng</Link>
						</div>
					</div>
					<div className='rounded-3xl border border-[#ecd8bd] bg-[#fff] p-6'>
						<div className='grid gap-4'>
							<div className='rounded-2xl bg-[#f7efe5] p-5'>
								<p className='text-xs uppercase tracking-[0.18em] text-[#8c6a42]'>Phổ biến nhất</p>
								<h2 className='mt-2 text-2xl font-semibold text-[#2d1b12]'>Mật ong rừng nguyên chất</h2>
								<p className='mt-2 text-[#5d4534]'>Hương vị tự nhiên, giàu dưỡng chất, phù hợp cho sức khỏe gia đình.</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className='mt-10'>
				<div className='mb-5 flex items-center justify-between'>
					<h2 className='text-2xl font-semibold text-[#2d1b12]'>Sản phẩm nổi bật</h2>
					<Link href='/products' className='text-sm font-medium text-[#a35f2d]'>Xem tất cả</Link>
				</div>
				<div className='grid gap-5 md:grid-cols-3'>
					{featuredProducts.map((product) => (
						<div key={product.name} className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
							<div className='h-36 rounded-xl bg-[#f7efe5]' />
							<h3 className='mt-4 text-lg font-semibold text-[#2d1b12]'>{product.name}</h3>
							<p className='mt-2 text-[#5d4534]'>{product.price}</p>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
