import { Pagination } from "@/components/ui/pagination";
import { getActiveCategoryOptions } from "@/features/category/api/service";
import { getPublishedProducts } from "@/features/product/api/service";
import { publicProductQuerySchema } from "@/features/product/schema";
import { ProductCard } from "@/features/product/components/product-card";
import { ShopFilters } from "@/features/product/components/shop-filters";
import type { SearchParams } from "@/types/common";
import paths from "@/config/path";

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const rawParams = await searchParams;
	const query = publicProductQuerySchema.parse({
		page: rawParams.page,
		search: rawParams.search,
		categoryId: rawParams.categoryId,
		sortBy: rawParams.sortBy,
	});

	const [categories, result] = await Promise.all([getActiveCategoryOptions(), getPublishedProducts(query)]);

	return (
		<div>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Cửa hàng</h1>
			<ShopFilters categories={categories} />
			{result.items?.length === 0 ? (
				<p className='text-sm text-muted-foreground'>Không tìm thấy sản phẩm nào.</p>
			) : (
				<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
					{result.items?.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			)}
			<div className='flex items-center justify-center mt-10'>
				<Pagination page={result.page} totalPages={result.totalPages} basePath={paths.client.products} />
			</div>
		</div>
	);
}
