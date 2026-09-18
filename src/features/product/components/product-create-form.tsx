"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductSchema } from "../schema";
import { createProductAction } from "../api/actions";

type CategoryOption = { id: string; name: string };
type FormInput = z.input<typeof createProductSchema>;
type FormOutput = z.output<typeof createProductSchema>;

const emptyVariant = { sku: "", name: "", price: 0, stockQuantity: 0, optionValueIds: [] as number[] };

export function ProductCreateForm({ categories }: { categories: CategoryOption[] }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<FormInput, unknown, FormOutput>({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			categoryId: categories[0] ? Number(categories[0].id) : undefined,
			name: "",
			slug: "",
			description: "",
			options: [],
			variants: [emptyVariant],
		},
	});

	const optionsArray = useFieldArray({ control: form.control, name: "options" });
	const variantsArray = useFieldArray({ control: form.control, name: "variants" });
	const watchedOptions = form.watch("options");

	// Danh sách phẳng "Tên option: giá trị" theo đúng thứ tự sẽ được tạo ở service
	// (dùng flat index làm optionValueIds tạm thời cho variant khi tạo mới).
	const flatOptionValues = useMemo(() => {
		const flat: { label: string; index: number }[] = [];
		let index = 0;
		for (const option of watchedOptions ?? []) {
			for (const value of option.values ?? []) {
				if (value?.value) flat.push({ label: `${option.name || "?"}: ${value.value}`, index });
				index++;
			}
		}
		return flat;
	}, [watchedOptions]);

	async function onSubmit(values: FormOutput) {
		setServerError("");
		const result = await createProductAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.push("/admin/products");
		router.refresh();
	}

	return (
		<form className="space-y-6 border-b border-border pb-8" onSubmit={form.handleSubmit(onSubmit)}>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="product-name">Tên sản phẩm</Label>
					<Input id="product-name" {...form.register("name")} />
					{form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
				</div>
				<div className="space-y-2">
					<Label htmlFor="product-slug">Slug (tự sinh nếu trống)</Label>
					<Input id="product-slug" {...form.register("slug")} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="product-category">Danh mục</Label>
					<select
						id="product-category"
						className="h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						{...form.register("categoryId")}>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
					{form.formState.errors.categoryId && (
						<p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="product-description">Mô tả</Label>
				<Textarea id="product-description" {...form.register("description")} />
			</div>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-foreground">Thuộc tính (option)</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => optionsArray.append({ name: "", values: [{ value: "" }] })}>
						+ Thêm thuộc tính
					</Button>
				</div>

				{optionsArray.fields.map((field, optionIndex) => (
					<OptionRow key={field.id} form={form} optionIndex={optionIndex} onRemove={() => optionsArray.remove(optionIndex)} />
				))}
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-foreground">Biến thể (variant)</h3>
					<Button type="button" variant="outline" size="sm" onClick={() => variantsArray.append(emptyVariant)}>
						+ Thêm biến thể
					</Button>
				</div>
				{form.formState.errors.variants?.message && (
					<p className="text-sm text-destructive">{form.formState.errors.variants.message}</p>
				)}

				{variantsArray.fields.map((field, variantIndex) => (
					<div key={field.id} className="grid gap-2 border border-border p-3 md:grid-cols-5">
						<Input placeholder="SKU" {...form.register(`variants.${variantIndex}.sku` as const)} />
						<Input placeholder="Tên biến thể" {...form.register(`variants.${variantIndex}.name` as const)} />
						<Input type="number" min={1} placeholder="Giá" {...form.register(`variants.${variantIndex}.price` as const)} />
						<Input
							type="number"
							min={0}
							placeholder="Tồn kho"
							{...form.register(`variants.${variantIndex}.stockQuantity` as const)}
						/>
						<div className="flex flex-wrap items-center gap-2">
							{flatOptionValues.length === 0 && (
								<span className="text-xs text-muted-foreground">Chưa có thuộc tính</span>
							)}
							{flatOptionValues.map((option) => (
								<label key={option.index} className="flex items-center gap-1 text-xs">
									<input
										type="checkbox"
										value={option.index}
										className="accent-primary"
										{...form.register(`variants.${variantIndex}.optionValueIds` as const)}
									/>
									{option.label}
								</label>
							))}
							{variantsArray.fields.length > 1 && (
								<button
									type="button"
									className="ml-auto text-xs text-destructive underline-offset-4 hover:underline"
									onClick={() => variantsArray.remove(variantIndex)}>
									Xoá
								</button>
							)}
						</div>
					</div>
				))}
			</section>

			{serverError && <p className="text-sm text-destructive">{serverError}</p>}
			<Button type="submit" disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting ? "Đang tạo..." : "Tạo sản phẩm"}
			</Button>
		</form>
	);
}

function OptionRow({
	form,
	optionIndex,
	onRemove,
}: {
	form: UseFormReturn<FormInput, unknown, FormOutput>;
	optionIndex: number;
	onRemove: () => void;
}) {
	const valuesArray = useFieldArray({ control: form.control, name: `options.${optionIndex}.values` as const });

	return (
		<div className="space-y-2 border border-border p-3">
			<div className="flex items-center gap-2">
				<Input placeholder="Tên thuộc tính (VD: Dung tích)" {...form.register(`options.${optionIndex}.name` as const)} />
				<button type="button" className="text-xs text-destructive underline-offset-4 hover:underline" onClick={onRemove}>
					Xoá thuộc tính
				</button>
			</div>
			<div className="flex flex-wrap gap-2">
				{valuesArray.fields.map((field, valueIndex) => (
					<div key={field.id} className="flex items-center gap-1">
						<Input
							className="w-32"
							placeholder="Giá trị"
							{...form.register(`options.${optionIndex}.values.${valueIndex}.value` as const)}
						/>
						{valuesArray.fields.length > 1 && (
							<button type="button" onClick={() => valuesArray.remove(valueIndex)} className="text-xs text-destructive">
								×
							</button>
						)}
					</div>
				))}
				<Button type="button" variant="outline" size="xs" onClick={() => valuesArray.append({ value: "" })}>
					+ Giá trị
				</Button>
			</div>
		</div>
	);
}
