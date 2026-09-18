"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
		<form className="grid gap-2 border border-border p-3 md:grid-cols-5" onSubmit={form.handleSubmit(onSubmit)}>
			<Input placeholder="SKU" {...form.register("sku")} />
			<Input placeholder="Tên biến thể" {...form.register("name")} />
			<Input type="number" min={1} placeholder="Giá" {...form.register("price")} />
			<Input type="number" min={0} placeholder="Tồn kho" {...form.register("stockQuantity")} />
			<div className="flex flex-wrap items-center gap-2">
				{optionValues.map((value) => (
					<label key={value.id} className="flex items-center gap-1 text-xs">
						<input type="checkbox" value={value.id} className="accent-primary" {...form.register("optionValueIds")} />
						{value.value}
					</label>
				))}
			</div>
			<div className="md:col-span-5">
				{serverError && <p className="mb-2 text-sm text-destructive">{serverError}</p>}
				<Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang thêm..." : "Thêm biến thể"}
				</Button>
			</div>
		</form>
	);
}
