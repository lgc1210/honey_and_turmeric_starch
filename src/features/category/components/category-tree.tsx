"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCategoryAction, updateCategoryStatusAction } from "../api/actions";
import { CategoryEditForm } from "./category-edit-form";
import { CategoryRow } from "./category-view-switcher";
import { EntityStatus } from "@/generated/prisma/enums";
import { ChevronDown, ChevronRight } from "lucide-react";

type TreeNode = CategoryRow & { children: TreeNode[] };

/** Gom danh sách phẳng thành cây theo parent.id. Danh mục có parent không tồn tại
 * trong danh sách (dữ liệu mồ côi) vẫn được xếp ở gốc thay vì bị ẩn mất. */
function buildTree(categories: CategoryRow[]): TreeNode[] {
	const nodeById = new Map<string, TreeNode>(
		categories.map((category) => [category.id, { ...category, children: [] }]),
	);
	const roots: TreeNode[] = [];

	for (const category of categories) {
		const node = nodeById.get(category.id)!;
		const parentNode = category.parent ? nodeById.get(category.parent.id) : undefined;

		if (parentNode) {
			parentNode.children.push(node);
		} else {
			roots.push(node);
		}
	}

	return roots;
}

export function CategoryTree({ categories }: { categories: CategoryRow[] }) {
	const tree = useMemo(() => buildTree(categories), [categories]);

	if (tree.length === 0) {
		return <p className='text-sm text-muted-foreground'>Chưa có danh mục nào.</p>;
	}

	return (
		<ul className='space-y-1'>
			{tree.map((node) => (
				<TreeItem key={node.id} node={node} depth={0} allCategories={categories} />
			))}
		</ul>
	);
}

function TreeItem({ node, depth, allCategories }: { node: TreeNode; depth: number; allCategories: CategoryRow[] }) {
	const router = useRouter();
	const [expanded, setExpanded] = useState(true);
	const [editing, setEditing] = useState(false);
	const [pending, setPending] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState("");
	const hasChildren = node.children.length > 0;

	async function toggleStatus(e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		setPending(true);
		const result = await updateCategoryStatusAction({
			id: node.id,
			status: node.status === EntityStatus.Active ? EntityStatus.InActive : EntityStatus.Active,
		});
		setPending(false);
		setError(result.success ? "" : result.error);
		router.refresh();
	}

	async function confirmDelete() {
		const result = await deleteCategoryAction({ id: node.id });
		setError(result.success ? "" : result.error);
		if (result.success) router.refresh();
	}

	if (editing) {
		return (
			<li style={{ marginLeft: depth * 20 }}>
				<CategoryEditForm category={node} parentOptions={allCategories} onDone={() => setEditing(false)} />
			</li>
		);
	}

	return (
		<li>
			<div
				className='flex flex-wrap items-center gap-1 border border-border px-3 py-2 select-none hover:bg-gray-200/50'
				style={{ marginLeft: depth * 20 }}
				onClick={() => setExpanded((v) => !v)}>
				<button
					type='button'
					disabled={!hasChildren}
					className='w-4 shrink-0 text-xs text-muted-foreground disabled:opacity-0'
					aria-label={expanded ? "Thu gọn" : "Mở rộng"}>
					{hasChildren ? expanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' /> : ""}
				</button>

				<span className='flex-1 truncate text-sm font-medium text-foreground'>{node.name}</span>
				<span className='text-xs text-muted-foreground'>{node._count.products} sản phẩm</span>
				<Badge variant={node.status === EntityStatus.Active ? "default" : "destructive"}>
					{node.status === EntityStatus.Active ? "Đang bán" : "Ngừng bán"}
				</Badge>
				<Button variant='outline' size='sm' disabled={pending} onClick={toggleStatus}>
					{node.status === EntityStatus.Active ? "Ngừng bán" : "Kích hoạt"}
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
						e.stopPropagation();
						setEditing(true);
					}}>
					Sửa
				</Button>
				<Button
					variant='destructive'
					size='sm'
					disabled={pending}
					onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
						e.stopPropagation();
						setConfirmingDelete(true);
					}}>
					Xoá
				</Button>
				{error && <p className='w-full text-xs text-destructive'>{error}</p>}
			</div>

			<ConfirmDialog
				open={confirmingDelete}
				onOpenChange={setConfirmingDelete}
				title={`Xoá danh mục "${node.name}"?`}
				description='Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>

			{hasChildren && expanded && (
				<ul className='mt-1 space-y-1'>
					{node.children.map((child) => (
						<TreeItem key={child.id} node={child} depth={depth + 1} allCategories={allCategories} />
					))}
				</ul>
			)}
		</li>
	);
}

export default CategoryTree;
