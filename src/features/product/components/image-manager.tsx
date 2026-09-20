"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteImageAction, setPrimaryImageAction, uploadProductImageAction } from "../api/actions";

type ImageItem = { id: string; url: string; isPrimary: boolean };

export function ImageManager({ variantId, images }: { variantId: string; images: ImageItem[] }) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [deletingImage, setDeletingImage] = useState<ImageItem | null>(null);

	async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		setError("");
		setUploading(true);
		const result = await uploadProductImageAction({
			productVariantId: variantId,
			file,
			isPrimary: images.length === 0, // ảnh đầu tiên của variant mặc định là ảnh chính
		});
		setUploading(false);
		if (fileInputRef.current) fileInputRef.current.value = "";

		if (!result.success) {
			setError(result.error);
			return;
		}
		router.refresh();
	}

	async function onSetPrimary(image: ImageItem) {
		setPendingId(image.id);
		const result = await setPrimaryImageAction({ id: image.id });
		setPendingId(null);
		if (!result.success) setError(result.error);
		router.refresh();
	}

	async function confirmDelete() {
		if (!deletingImage) return;
		const result = await deleteImageAction({ id: deletingImage.id });
		if (!result.success) setError(result.error);
		router.refresh();
	}

	return (
		<div className='space-y-2'>
			<div className='flex flex-wrap items-center gap-2'>
				<Input
					ref={fileInputRef}
					type='file'
					accept='image/jpeg,image/png,image/webp,image/gif'
					onChange={onFileSelected}
					disabled={uploading}
					className='max-w-xs cursor-pointer hover:bg-card'
				/>
				{uploading && <span className='text-xs text-muted-foreground'>Đang tải ảnh lên...</span>}
			</div>
			{error && <p className='text-sm text-destructive'>{error}</p>}

			<div className='flex flex-wrap gap-3'>
				{images.map((image) => (
					<div key={image.id} className='w-28 space-y-1'>
						<div className='relative border border-border'>
							{/* eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ, không cần tối ưu qua next/image */}
							<img src={image.url} alt='' className='aspect-square w-full object-cover' />
							{image.isPrimary && (
								<Badge className='absolute top-1 left-1' variant='default'>
									Chính
								</Badge>
							)}
						</div>
						<div className='flex gap-1'>
							{!image.isPrimary && (
								<button
									type='button'
									disabled={pendingId === image.id}
									className='flex-1 text-xs text-primary underline-offset-4 hover:underline'
									onClick={() => onSetPrimary(image)}>
									Đặt chính
								</button>
							)}
							<button
								type='button'
								className='text-xs text-destructive underline-offset-4 hover:underline'
								onClick={() => setDeletingImage(image)}>
								Xoá
							</button>
						</div>
					</div>
				))}
			</div>

			<ConfirmDialog
				open={deletingImage !== null}
				onOpenChange={(open) => !open && setDeletingImage(null)}
				title='Xoá ảnh này?'
				description='Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
