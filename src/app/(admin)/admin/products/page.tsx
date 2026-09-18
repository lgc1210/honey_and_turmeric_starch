import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getActiveCategoryOptions } from "@/features/category/api/service";
import { getAdminProducts } from "@/features/product/api/service";
import { productQuerySchema } from "@/features/product/schema";
import { ProductCreateForm } from "@/features/product/components/product-create-form";
import { ProductTable } from "@/features/product/components/product-table";
import type { SearchParams } from "@/types/common";

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
				<h1 className='font-serif text-2xl font-semibold text-foreground'>Sản phẩm</h1>
			</div>

			<details className='mb-6 border border-border p-4'>
				<summary className='cursor-pointer font-medium text-foreground'>+ Thêm sản phẩm mới</summary>
				<div className='mt-4'>
					<ProductCreateForm categories={categories} />
				</div>
			</details>

			<ProductTable products={result.items} />

			{result.totalPages > 1 && (
				<div className='mt-4 flex gap-2'>
					{Array.from({ length: result.totalPages }, (_, i) => i + 1).map((page) => (
						<Link key={page} href={`/admin/products?page=${page}`} className='border border-border px-3 py-1 text-sm'>
							{page}
						</Link>
					))}
				</div>
			)}
		</AdminShell>
	);
}
