import Link from "next/link";
import { Button } from "@/components/ui/button";
import paths from "@/config/path";
import { getFeaturedProducts } from "@/features/product/api/service";
import { ProductCard } from "@/features/product/components/product-card";

export default async function HomePage() {
	const featuredProducts = await getFeaturedProducts(8);

	return (
		<div className='space-y-12'>
			<section className='border border-border bg-card px-6 py-16 text-center'>
				<h1 className='font-serif text-3xl font-semibold text-foreground sm:text-4xl'>
					Mật ong &amp; tinh bột nghệ nguyên chất
				</h1>
				<p className='mx-auto mt-4 max-w-xl text-muted-foreground'>
					Tự tay chọn lọc nguyên liệu, chế biến thủ công — mang đến sản phẩm tự nhiên, an toàn cho sức khoẻ cả gia đình.
				</p>
				<Button className='mt-6 cursor-pointer'>
					<Link href={paths.client.products}>Khám phá cửa hàng</Link>
				</Button>
			</section>

			<section>
				<div className='mb-6 flex items-center justify-between'>
					<h2 className='font-serif text-2xl font-semibold text-foreground'>Sản phẩm nổi bật</h2>
					<Link href={paths.client.products} className='text-sm text-primary underline-offset-4 hover:underline'>
						Xem tất cả
					</Link>
				</div>

				{featuredProducts.length === 0 ? (
					<p className='text-sm text-muted-foreground'>Chưa có sản phẩm nào.</p>
				) : (
					<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
						{featuredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
