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
		<div className='space-y-12 max-w-6xl px-4 py-8 w-full mx-auto'>
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

			<VariantPicker
				name={product.name}
				categoryName={product.category.name}
				options={product.options}
				variants={product.variants}
			/>

			{product.description && (
				<section className='animate-in fade-in duration-500'>
					<h2 className='mb-4 border-t border-border pt-8 font-sans text-2xl font-bold text-foreground'>
						Mô tả sản phẩm
					</h2>
					<p className='max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground'>{product.description}</p>
				</section>
			)}

			{relatedProducts.length > 0 && (
				<section>
					<h2 className='mb-6 font-sans text-2xl font-bold text-foreground'>Sản phẩm liên quan</h2>
					<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
						{relatedProducts.map((related, index) => (
							<div
								key={related.id}
								className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500'
								style={{ animationDelay: `${index * 60}ms` }}>
								<ProductCard product={related} />
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
