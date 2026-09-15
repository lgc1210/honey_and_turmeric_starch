type ProductDetailPageProps = {
	params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { slug } = await params;

	return (
		<main className='mx-auto max-w-4xl px-4 py-10'>
			<div className='rounded-3xl border border-[#ecd8bd] bg-[#fffaf3] p-6'>
				<p className='text-xs uppercase tracking-[0.18em] text-[#a35f2d]'>Sản phẩm</p>
				<h1 className='mt-3 text-3xl font-semibold text-[#2d1b12]'>{slug.replace(/-/g, " ")}</h1>
				<p className='mt-3 max-w-xl text-[#5d4534]'>Sản phẩm được lên lịch và quản lý theo tiêu chuẩn chất lượng của Kim Bac Store, với nguyên liệu được chọn lọc kỹ càng và đóng gói an toàn.</p>
				<div className='mt-6 h-64 rounded-2xl bg-[#f7efe5]' />
				<div className='mt-6 flex items-center gap-4'>
					<span className='text-2xl font-semibold text-[#2d1b12]'>₫420.000</span>
					<button className='rounded-xl bg-[#f5cb63] px-5 py-3 font-medium text-[#2d1b12]'>Thêm vào giỏ</button>
				</div>
			</div>
		</main>
	);
}
