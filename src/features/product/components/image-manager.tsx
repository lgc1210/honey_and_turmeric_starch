"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productImageSchema } from "../schema";
import { deleteImageAction, upsertImageAction } from "../api/actions";

type ImageItem = { id: string; url: string; isPrimary: boolean };

export function ImageManager({ variantId, images }: { variantId: string; images: ImageItem[] }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof productImageSchema>, unknown, z.output<typeof productImageSchema>>({
		resolver: zodResolver(productImageSchema),
		defaultValues: { productVariantId: Number(variantId), url: "", altText: "", sortOrder: 0, isPrimary: false },
	});

	async function onSubmit(values: z.infer<typeof productImageSchema>) {
		setServerError("");
		const result = await upsertImageAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		form.reset({ productVariantId: Number(variantId), url: "", altText: "", sortOrder: 0, isPrimary: false });
		router.refresh();
	}

	async function onDelete(id: string) {
		await deleteImageAction(id);
		router.refresh();
	}

	return (
		<div className="space-y-2">
			<form className="flex flex-wrap items-center gap-2" onSubmit={form.handleSubmit(onSubmit)}>
				<Input className="w-64" placeholder="URL ảnh" {...form.register("url")} />
				<Input className="w-40" placeholder="Mô tả ảnh" {...form.register("altText")} />
				<Input className="w-24" type="number" min={0} placeholder="Thứ tự" {...form.register("sortOrder")} />
				<label className="flex items-center gap-1 text-xs">
					<input type="checkbox" className="accent-primary" {...form.register("isPrimary")} /> Ảnh chính
				</label>
				<Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
					Thêm ảnh
				</Button>
			</form>
			{serverError && <p className="text-sm text-destructive">{serverError}</p>}

			<div className="flex flex-wrap gap-2">
				{images.map((image) => (
					<div key={image.id} className="flex items-center gap-2 border border-border px-2 py-1 text-sm">
						<span className="max-w-[16rem] truncate">{image.url}</span>
						{image.isPrimary && <Badge>Chính</Badge>}
						<button
							type="button"
							className="text-xs text-destructive underline-offset-4 hover:underline"
							onClick={() => onDelete(image.id)}>
							Xoá
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
