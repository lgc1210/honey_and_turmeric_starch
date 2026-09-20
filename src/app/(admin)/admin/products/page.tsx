import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getActiveCategoryOptions } from "@/features/category/api/service";
import { getAdminProducts } from "@/features/product/api/service";
import { productQuerySchema } from "@/features/product/schema";
import { ProductFilters } from "@/features/product/components/product-filters";
import { ProductTable } from "@/features/product/components/product-table";
import type { SearchParams } from "@/types/common";
import paths from "@/config/path";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const rawParams = await searchParams;
	const query = productQuerySchema.parse({
		page: rawParams.page,
		search: rawParams.search,
		categoryId: rawParams.categoryId,
		status: rawParams.status,
	});

	const [categories, result] = await Promise.all([getActiveCategoryOptions(), getAdminProducts(query)]);

	return (
		<AdminShell>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='font-sans text-2xl font-bold text-foreground'>Sản phẩm</h1>
				<Button render={<Link href={paths.admin.newProduct} />}>+ Thêm sản phẩm mới</Button>
			</div>
			<ProductFilters categories={categories} />
			<ProductTable products={result.items} />
			<Pagination page={result.page} totalPages={result.totalPages} basePath={paths.admin.products} />
		</AdminShell>
	);
}
