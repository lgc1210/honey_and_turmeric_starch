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
import { updateCategorySchema } from "../schema";
import { updateCategoryAction } from "../api/actions";

type EditableCategory = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	parentId: string | null;
};

type CategoryOption = { id: string; name: string };

export function CategoryEditForm({
	category,
	parentOptions,
	onDone,
}: {
	category: EditableCategory;
	parentOptions: CategoryOption[];
	onDone: () => void;
}) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof updateCategorySchema>, unknown, z.output<typeof updateCategorySchema>>({
		resolver: zodResolver(updateCategorySchema),
		defaultValues: {
			id: Number(category.id),
			name: category.name,
			slug: category.slug,
			description: category.description ?? "",
			parentId: category.parentId ? Number(category.parentId) : undefined,
		},
	});

	async function onSubmit(values: z.output<typeof updateCategorySchema>) {
		setServerError("");
		const result = await updateCategoryAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.refresh();
		onDone();
	}

	// Không cho chọn chính nó làm danh mục cha (chặn thêm ở client, service đã chặn vòng lặp sâu hơn).
	const selectableParents = parentOptions.filter((option) => option.id !== category.id);

	return (
		<form
			className='grid gap-3 border border-primary/40 bg-muted/40 p-3 md:grid-cols-4'
			onSubmit={form.handleSubmit(onSubmit)}>
			<div className='space-y-1'>
				<Label htmlFor={`edit-name-${category.id}`}>Tên danh mục</Label>
				<Input id={`edit-name-${category.id}`} {...form.register("name")} />
				{form.formState.errors.name && <p className='text-xs text-destructive'>{form.formState.errors.name.message}</p>}
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-slug-${category.id}`}>Slug</Label>
				<Input id={`edit-slug-${category.id}`} {...form.register("slug")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-parent-${category.id}`}>Danh mục cha</Label>
				<select
					id={`edit-parent-${category.id}`}
					className='h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
					{...form.register("parentId", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}>
					<option value=''>— Không có —</option>
					{selectableParents.map((option) => (
						<option key={option.id} value={option.id}>
							{option.name}
						</option>
					))}
				</select>
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-description-${category.id}`}>Mô tả</Label>
				<Textarea id={`edit-description-${category.id}`} rows={1} {...form.register("description")} />
			</div>

			<div className='flex items-center gap-2 md:col-span-4'>
				{serverError && <p className='text-sm text-destructive'>{serverError}</p>}
				<Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
				</Button>
				<Button type='button' variant='outline' size='sm' onClick={onDone}>
					Huỷ
				</Button>
			</div>
		</form>
	);
}
