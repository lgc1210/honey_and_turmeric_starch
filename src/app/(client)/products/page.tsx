import Link from "next/link";

const products = [
	{ slug: "mat-ong-rung-nguyen-chat", name: "Mật ong rừng nguyên chất", price: "₫420.000" },
	{ slug: "tinh-bot-nghe-vang", name: "Tinh bột nghệ vàng", price: "₫290.000" },
	{ slug: "combo-cham-soc-da", name: "Combo chăm sóc da", price: "₫560.000" },
	{ slug: "hop-qua-suc-khoe", name: "Hộp quà sức khỏe", price: "₫760.000" },
];

export default function ProductsPage() {
	return (
		<main className='mx-auto max-w-7xl px-4 py-10'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-3xl font-semibold text-[#2d1b12]'>Sản phẩm</h1>
				<p className='text-sm text-[#6a4d32]'>Tổng cộng 4 sản phẩm</p>
			</div>
			<div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
				{products.map((product) => (
					<div key={product.slug} className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-4'>
						<div className='h-40 rounded-xl bg-[#f7efe5]' />
						<h2 className='mt-4 text-lg font-semibold text-[#2d1b12]'>{product.name}</h2>
						<p className='mt-2 text-[#5d4534]'>{product.price}</p>
						<Link href={`/products/${product.slug}`} className='mt-4 inline-block text-sm font-medium text-[#a35f2d]'>Xem chi tiết</Link>
					</div>
				))}
			</div>
		</main>
	);
}
