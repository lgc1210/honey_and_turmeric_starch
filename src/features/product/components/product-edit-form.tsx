"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProductSchema } from "../schema";
import { updateProductAction } from "../api/actions";
import { categoryOptionLabel, flattenCategoryTree } from "@/features/category/utils";

type CategoryOption = { id: string; name: string; parentId: string | null };
type ProductDetail = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	categoryId: string;
};

export function ProductEditForm({ product, categories }: { product: ProductDetail; categories: CategoryOption[] }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");
	const categoryTree = flattenCategoryTree(categories);

	const form = useForm<z.input<typeof updateProductSchema>, unknown, z.output<typeof updateProductSchema>>({
		resolver: zodResolver(updateProductSchema),
		defaultValues: {
			id: Number(product.id),
			categoryId: Number(product.categoryId),
			name: product.name,
			slug: product.slug,
			description: product.description ?? "",
		},
	});

	async function onSubmit(values: z.infer<typeof updateProductSchema>) {
		setServerError("");
		const result = await updateProductAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.refresh();
	}

	return (
		<form className='grid gap-4 border-b border-border pb-6 md:grid-cols-4' onSubmit={form.handleSubmit(onSubmit)}>
			<div className='space-y-2'>
				<Label htmlFor='edit-name'>Tên sản phẩm</Label>
				<Input id='edit-name' {...form.register("name")} />
			</div>
			<div className='space-y-2'>
				<Label htmlFor='edit-slug'>Slug</Label>
				<Input id='edit-slug' {...form.register("slug")} />
			</div>
			<div className='space-y-2'>
				<Label htmlFor='edit-category'>Danh mục</Label>
				<select
					id='edit-category'
					className='h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
					{...form.register("categoryId")}>
					{categoryTree.map((category) => (
						<option key={category.id} value={category.id}>
							{categoryOptionLabel(category.name, category.depth)}
						</option>
					))}
				</select>
			</div>
			<div className='space-y-2 md:col-span-4'>
				<Label htmlFor='edit-description'>Mô tả</Label>
				<Textarea id='edit-description' {...form.register("description")} />
			</div>
			<div className='md:col-span-4'>
				{serverError && <p className='mb-2 text-sm text-destructive'>{serverError}</p>}
				<Button type='submit' size='lg' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
				</Button>
			</div>
		</form>
	);
}
