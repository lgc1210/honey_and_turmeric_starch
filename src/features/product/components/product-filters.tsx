"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryOptionLabel, flattenCategoryTree } from "@/features/category/utils";
import paths from "@/config/path";
import { EntityStatus } from "@/generated/prisma/enums";

type CategoryOption = { id: string; name: string; parentId: string | null };

export function ProductFilters({ categories }: { categories: CategoryOption[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentStatus = searchParams.get("status") ?? "";
	const currentCategoryId = searchParams.get("categoryId") ?? "";

	const [search, setSearch] = useState(currentSearch);
	const [status, setStatus] = useState(currentStatus);
	const [categoryId, setCategoryId] = useState(currentCategoryId);

	const categoryTree = flattenCategoryTree(categories);

	const hasActiveFilters = currentSearch !== "" || currentStatus !== "" || currentCategoryId !== "";

	function applyParams(next: Record<string, string | undefined>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(next)) {
			if (value) params.set(key, value);
			else params.delete(key);
		}
		params.delete("page"); // đổi filter thì quay lại trang 1
		router.push(`${paths.admin.products}?${params.toString()}`);
	}

	const handleClear = () => {
		setSearch("");
		setStatus("");
		setCategoryId("");
		router.push(paths.admin.products);
	};

	return (
		<form
			className='mb-4 flex flex-wrap items-end gap-3'
			onSubmit={(e) => {
				e.preventDefault();
				applyParams({ search: search || undefined });
			}}>
			<div className='w-56'>
				<Input placeholder='Tìm theo tên sản phẩm...' value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>

			<select
				className='h-9 border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				value={categoryId}
				onChange={(e) => {
					setCategoryId(e.target.value);
					applyParams({ categoryId: e.target.value || undefined });
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
				value={status}
				onChange={(e) => {
					setStatus(e.target.value);
					applyParams({ status: e.target.value || undefined });
				}}>
				<option value=''>Tất cả trạng thái</option>
				<option value={EntityStatus.Active}>Đang bán</option>
				<option value={EntityStatus.InActive}>Ngừng bán</option>
			</select>

			<Button type='submit' variant='outline' size='lg'>
				Tìm
			</Button>
			{hasActiveFilters && (
				<Button type='button' variant='ghost' size='lg' onClick={handleClear}>
					Xóa bộ lọc
				</Button>
			)}
		</form>
	);
}
