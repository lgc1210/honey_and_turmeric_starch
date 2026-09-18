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
import { createCategorySchema } from "../schema";
import { createCategoryAction } from "../api/actions";

type CategoryOption = { id: string; name: string };

export function CategoryForm({ categories }: { categories: CategoryOption[] }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof createCategorySchema>, unknown, z.output<typeof createCategorySchema>>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: { name: "", slug: "", description: "" },
	});

	async function onSubmit(values: z.infer<typeof createCategorySchema>) {
		setServerError("");
		const result = await createCategoryAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		form.reset({ name: "", slug: "", description: "", parentId: undefined });
		router.refresh();
	}

	return (
		<form className='grid gap-4 border-b border-border pb-6 md:grid-cols-4' onSubmit={form.handleSubmit(onSubmit)}>
			<div className='space-y-2'>
				<Label htmlFor='category-name'>Tên danh mục</Label>
				<Input id='category-name' {...form.register("name")} />
				{form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category-slug'>Slug (tự sinh nếu trống)</Label>
				<Input id='category-slug' {...form.register("slug")} />
				{form.formState.errors.slug && <p className='text-sm text-destructive'>{form.formState.errors.slug.message}</p>}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category-parent'>Danh mục cha (tuỳ chọn)</Label>
				<select
					id='category-parent'
					className='h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
					{...form.register("parentId", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}>
					<option value=''>— Không có —</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category-description'>Mô tả</Label>
				<Textarea id='category-description' rows={1} {...form.register("description")} />
			</div>

			<div className='md:col-span-4'>
				{serverError && <p className='mb-2 text-sm text-destructive'>{serverError}</p>}
				<Button type='submit' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang lưu..." : "Thêm danh mục"}
				</Button>
			</div>
		</form>
	);
}
