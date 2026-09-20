"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSkuFromName } from "@/lib/utils";
import { createVariantSchema } from "../schema";
import { createVariantAction } from "../api/actions";

type OptionValue = { id: string; value: string };

export function VariantForm({ productId, optionValues }: { productId: string; optionValues: OptionValue[] }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof createVariantSchema>, unknown, z.output<typeof createVariantSchema>>({
		resolver: zodResolver(createVariantSchema),
		defaultValues: {
			productId: Number(productId),
			sku: "",
			name: "",
			price: 0,
			stockQuantity: 0,
			optionValueIds: [],
		},
	});

	const variantName = useWatch({ control: form.control, name: "name" });
	const currentSku = useWatch({ control: form.control, name: "sku" });

	useEffect(() => {
		if (!variantName || currentSku) return; // chỉ tự sinh khi ô SKU đang trống
		form.setValue("sku", generateSkuFromName(variantName), { shouldValidate: false });
	}, [variantName, currentSku, form]);

	async function onSubmit(values: z.infer<typeof createVariantSchema>) {
		setServerError("");
		const result = await createVariantAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		form.reset({ productId: Number(productId), sku: "", name: "", price: 0, stockQuantity: 0, optionValueIds: [] });
		router.refresh();
	}

	return (
		<form className='grid gap-2 border border-border p-3 md:grid-cols-5' onSubmit={form.handleSubmit(onSubmit)}>
			<div className='space-y-1'>
				<Label htmlFor='new-variant-name'>Tên biến thể</Label>
				<Input id='new-variant-name' placeholder='VD: Đỏ / Size M' {...form.register("name")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor='new-variant-sku'>SKU (tự sinh, có thể sửa)</Label>
				<Input id='new-variant-sku' placeholder='SKU' {...form.register("sku")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor='new-variant-price'>Giá bán</Label>
				<Input id='new-variant-price' type='number' min={1} placeholder='VD: 150000' {...form.register("price")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor='new-variant-stock'>Tồn kho</Label>
				<Input id='new-variant-stock' type='number' min={0} placeholder='VD: 100' {...form.register("stockQuantity")} />
			</div>
			<div className='space-y-1'>
				<Label>Thuộc tính</Label>
				<div className='flex flex-wrap items-center gap-2'>
					{optionValues.map((value) => (
						<label key={value.id} className='flex items-center gap-1 text-xs'>
							<input type='checkbox' value={value.id} className='accent-primary' {...form.register("optionValueIds")} />
							{value.value}
						</label>
					))}
				</div>
			</div>
			<div className='md:col-span-5'>
				{serverError && <p className='mb-2 text-sm text-destructive'>{serverError}</p>}
				<Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang thêm..." : "Thêm biến thể"}
				</Button>
			</div>
		</form>
	);
}
