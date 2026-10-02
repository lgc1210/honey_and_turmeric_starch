import { getFeaturedProducts } from "../api/service";
import { ProductCard } from "./product-card";

export async function FeaturedProducts({ limit = 8 }: { limit?: number }) {
	const featuredProducts = await getFeaturedProducts(limit);

	if (featuredProducts.length === 0) {
		return <p className='text-sm text-muted-foreground'>Chưa có sản phẩm nào.</p>;
	}

	return (
		<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
			{featuredProducts.map((product, index) => (
				<div
					key={product.id}
					className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500'
					style={{ animationDelay: `${index * 60}ms` }}>
					<ProductCard product={product} />
				</div>
			))}
		</div>
	);
}
