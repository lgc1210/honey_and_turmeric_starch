import Link from "next/link";
import { notFound } from "next/navigation";
import paths from "@/config/path";
import { getProductBySlug, getRelatedProducts } from "@/features/product/api/service";
import { ProductCard } from "@/features/product/components/product-card";
import { VariantPicker } from "@/features/product/components/variant-picker";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = await getProductBySlug(slug);
	if (!product) notFound();

	const relatedProducts = await getRelatedProducts(BigInt(product.categoryId), BigInt(product.id));

	return (
		<div className='space-y-12'>
			<nav className='text-sm text-muted-foreground'>
				<Link href={paths.client.home} className='hover:text-foreground'>
					Trang chủ
				</Link>{" "}
				/{" "}
				<Link href={paths.client.products} className='hover:text-foreground'>
					Cửa hàng
				</Link>{" "}
				/ <span className='text-foreground'>{product.name}</span>
			</nav>

			<div className='grid gap-8 lg:grid-cols-2'>
				<VariantPicker options={product.options} variants={product.variants} />

				<div>
					<p className='text-sm text-muted-foreground'>{product.category.name}</p>
					<h1 className='mt-1 font-serif text-2xl font-semibold text-foreground'>{product.name}</h1>
					{product.description && (
						<p className='mt-4 whitespace-pre-line text-muted-foreground'>{product.description}</p>
					)}
				</div>
			</div>

			{relatedProducts.length > 0 && (
				<section>
					<h2 className='mb-6 font-serif text-2xl font-semibold text-foreground'>Sản phẩm liên quan</h2>
					<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
						{relatedProducts.map((related) => (
							<ProductCard key={related.id} product={related} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
