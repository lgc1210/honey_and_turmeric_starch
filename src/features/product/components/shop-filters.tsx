"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryOptionLabel, flattenCategoryTree } from "@/features/category/utils";
import paths from "@/config/path";

type CategoryOption = { id: string; name: string; parentId: string | null };

export function ShopFilters({ categories }: { categories: CategoryOption[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentCategoryId = searchParams.get("categoryId") ?? "";
	const currentSortBy = searchParams.get("sortBy") ?? "newest";

	const [search, setSearch] = useState(currentSearch);
	const [categoryId, setCategoryId] = useState(currentCategoryId);
	const [sortBy, setSortBy] = useState(currentSortBy);

	const categoryTree = flattenCategoryTree(categories);

	const hasActiveFilters = currentSearch !== "" || currentCategoryId !== "" || currentSortBy !== "newest";

	function applyParams(next: Record<string, string | undefined>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(next)) {
			if (value) params.set(key, value);
			else params.delete(key);
		}
		params.delete("page");
		router.push(`${paths.client.products}/?${params.toString()}`);
	}

	const handleClearFilter = () => {
		setSearch("");
		setCategoryId("");
		setSortBy("newest");
		router.push(paths.client.products);
	};

	return (
		<form
			className='mb-6 flex flex-wrap items-end gap-3'
			onSubmit={(e) => {
				e.preventDefault();
				applyParams({ search: search || undefined });
			}}>
			<div className='w-56'>
				<Input placeholder='Tìm sản phẩm...' value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>

			<select
				className='h-9 border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				value={categoryId}
				onChange={(e) => {
					const value = e.target.value;
					setCategoryId(value);
					applyParams({ categoryId: value || undefined });
				}}>
				<option value=''>Tất cả danh mục</option>
				{categoryTree.map((category) => (
					<option key={category.id} value={category.id}>
						{categoryOptionLabel(category.name, category.depth)}
					</option>
				))}
			</select>

			<select
				className='h-9 border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				value={sortBy}
				onChange={(e) => {
					const value = e.target.value;
					setSortBy(value);
					applyParams({ sortBy: value });
				}}>
				<option value='newest'>Mới nhất</option>
				<option value='priceAsc'>Giá tăng dần</option>
				<option value='priceDesc'>Giá giảm dần</option>
			</select>

			<Button type='submit' size='lg'>
				Tìm
			</Button>

			{hasActiveFilters && (
				<Button type='button' size='lg' variant='ghost' onClick={handleClearFilter}>
					Xoá bộ lọc
				</Button>
			)}
		</form>
	);
}
