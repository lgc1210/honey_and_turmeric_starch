"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCategoryAction, updateCategoryStatusAction } from "../api/actions";
import { CategoryEditForm } from "./category-edit-form";
import { CategoryRow } from "./category-view-switcher";
import { EntityStatus } from "@/generated/prisma/enums";

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);
	const [errorById, setErrorById] = useState<Record<string, string>>({});

	async function toggleStatus(category: CategoryRow) {
		setPendingId(category.id);
		const result = await updateCategoryStatusAction({
			id: category.id,
			status: category.status === EntityStatus.Active ? EntityStatus.InActive : EntityStatus.Active,
		});
		setPendingId(null);
		setErrorById((prev) => ({ ...prev, [category.id]: result.success ? "" : result.error }));
		router.refresh();
	}

	async function confirmDelete() {
		if (!deletingCategory) return;

		const result = await deleteCategoryAction({ id: deletingCategory.id });
		setErrorById((prev) => ({ ...prev, [deletingCategory.id]: result.success ? "" : result.error }));
		if (result.success) router.refresh();
	}

	return (
		<div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
			{categories.map((category) =>
				editingId === category.id ? (
					<div key={category.id} className='md:col-span-2 xl:col-span-2'>
						<CategoryEditForm category={category} parentOptions={categories} onDone={() => setEditingId(null)} />
					</div>
				) : (
					<div key={category.id} className='border border-border p-4 flex flex-col min-h-24'>
						<div className='flex-1'>
							<div className='flex items-start justify-between gap-2'>
								<h3 className='font-semibold text-foreground'>{category.name}</h3>
								<Badge variant={category.status === EntityStatus.Active ? "default" : "destructive"}>
									{category.status === EntityStatus.Active ? "Đang bán" : "Ngừng bán"}
								</Badge>
							</div>
							<p className='mt-2 text-sm text-muted-foreground'>
								{category.slug} · {category._count.products} sản phẩm
							</p>
							{category.parent && <p className='mt-1 text-xs text-muted-foreground'>Thuộc: {category.parent.name}</p>}

							{errorById[category.id] && <p className='mt-2 text-xs text-destructive'>{errorById[category.id]}</p>}
						</div>

						<div className='shink-0 mt-3 flex justify-between gap-1'>
							<Button
								variant='outline'
								size='sm'
								disabled={pendingId === category.id}
								onClick={() => toggleStatus(category)}
								className='flex-1'>
								{category.status === EntityStatus.Active ? "Ngừng bán" : "Kích hoạt lại"}
							</Button>
							<Button variant='outline' size='sm' onClick={() => setEditingId(category.id)} className='flex-1'>
								Sửa
							</Button>
							<Button variant='destructive' size='sm' onClick={() => setDeletingCategory(category)} className='flex-1'>
								Xoá
							</Button>
						</div>
					</div>
				),
			)}

			<ConfirmDialog
				open={deletingCategory !== null}
				onOpenChange={(open) => !open && setDeletingCategory(null)}
				title={`Xoá danh mục "${deletingCategory?.name}"?`}
				description='Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
