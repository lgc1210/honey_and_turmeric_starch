"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import { deleteVariantAction, updateVariantStatusAction } from "../api/actions";
import { ImageManager } from "./image-manager";
import { EntityStatus } from "@/generated/prisma/enums";

type VariantDetail = {
	id: string;
	sku: string;
	name: string | null;
	price: string;
	stockQuantity: number;
	status: EntityStatus;
	optionValues: { optionValue: { value: string } }[];
	images: { id: string; url: string; isPrimary: boolean }[];
};

export function VariantCard({ variant }: { variant: VariantDetail }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState("");

	async function toggleStatus() {
		setPending(true);
		await updateVariantStatusAction({
			id: variant.id,
			status: variant.status === EntityStatus.Active ? EntityStatus.InActive : EntityStatus.Active,
		});
		setPending(false);
		router.refresh();
	}

	async function confirmDelete() {
		const result = await deleteVariantAction({ id: variant.id });
		setError(result.success ? "" : result.error);
		if (result.success) router.refresh();
	}

	return (
		<section className='space-y-2 border border-border p-4'>
			<div className='flex flex-wrap items-start justify-between gap-2'>
				<div className='space-y-1'>
					<Badge variant={variant.status === EntityStatus.Active ? "default" : "destructive"}>
						{variant.status === EntityStatus.Active ? "Đang bán" : "Ngừng bán"}
					</Badge>
					<h4 className='font-semibold text-foreground'>
						{variant.name || "Không tên"} ({variant.sku})
					</h4>
					<p className='text-sm text-muted-foreground'>
						{formatCurrency(variant.price)} · tồn {variant.stockQuantity}
					</p>
					<p className='text-xs text-muted-foreground'>
						{variant.optionValues.map((x) => x.optionValue.value).join(" / ") || "Không có thuộc tính"}
					</p>
					{error && <p className='mt-1 text-xs text-destructive'>{error}</p>}
				</div>
				<div className='flex items-center gap-1'>
					<Button variant='outline' size='sm' disabled={pending} onClick={toggleStatus}>
						{variant.status === EntityStatus.Active ? "Ngừng bán" : "Kích hoạt"}
					</Button>
					<Button variant='destructive' size='sm' onClick={() => setConfirmingDelete(true)}>
						Xoá
					</Button>
				</div>
			</div>

			<ImageManager variantId={variant.id} images={variant.images} />

			<ConfirmDialog
				open={confirmingDelete}
				onOpenChange={setConfirmingDelete}
				title={`Xoá biến thể "${variant.name || variant.sku}"?`}
				description='Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>
		</section>
	);
}
