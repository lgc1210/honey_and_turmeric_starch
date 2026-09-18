"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryList } from "./category-list";
import { CategoryTree } from "./category-tree";
import { EntityStatus } from "@/generated/prisma/enums";
import { List, ListTree } from "lucide-react";

export type CategoryRow = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	status: EntityStatus;
	parentId: string | null;
	parent: { id: string; name: string } | null;
	_count: { products: number };
};

type ViewMode = "list" | "tree";

export function CategoryViewSwitcher({ categories }: { categories: CategoryRow[] }) {
	const [view, setView] = useState<ViewMode>("list");

	return (
		<div className='mt-4'>
			<div className='flex items-center gap-2'>
				<Button
					title='Hiển thị dạng danh sách'
					variant={view === "list" ? "default" : "outline"}
					size='sm'
					onClick={() => setView("list")}>
					<List className='size-4' />
				</Button>
				<Button
					title='Hiển thị dạng cây'
					variant={view === "tree" ? "default" : "outline"}
					size='sm'
					onClick={() => setView("tree")}>
					<ListTree className='size-4' />
				</Button>
			</div>

			<div className='mt-4'>
				{view === "list" ? <CategoryList categories={categories} /> : <CategoryTree categories={categories} />}
			</div>
		</div>
	);
}
