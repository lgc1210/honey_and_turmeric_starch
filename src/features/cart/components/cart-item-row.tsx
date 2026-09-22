"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuantityInput } from "@/components/ui/quantity-input";
import { formatCurrency } from "@/lib/utils";
import { removeCartItemAction, updateCartItemAction } from "../api/action";

type CartItemRowData = {
	id: string;
	quantity: number;
	variant: {
		id: string;
		sku: string;
		name: string | null;
		price: string;
		stockQuantity: number;
		product: { id: string; name: string; slug: string; status: "Active" | "InActive" };
		images: { url: string }[];
	};
};

export function CartItemRow({ item }: { item: CartItemRowData }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [confirmingRemove, setConfirmingRemove] = useState(false);
	const [error, setError] = useState("");

	async function onQuantityChange(next: number) {
		setPending(true);
		const result = await updateCartItemAction({ cartItemId: item.id, quantity: next });
		setPending(false);
		setError(result.success ? "" : result.error);
		router.refresh();
	}

	async function confirmRemove() {
		await removeCartItemAction({ cartItemId: item.id });
		router.refresh();
	}

	const image = item.variant.images[0]?.url;
	const unavailable = item.variant.product.status !== "Active";

	return (
		<div className='flex gap-4 border-b border-border py-4 last:border-0'>
			<Link
				href={`/products/${item.variant.product.slug}`}
				className='h-20 w-20 shrink-0 border border-border bg-muted'>
				{image ? (
					// eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ do admin upload
					<img src={image} alt='' className='h-full w-full object-cover' />
				) : null}
			</Link>

			<div className='flex flex-1 flex-col gap-1'>
				<Link href={`/products/${item.variant.product.slug}`} className='font-medium text-foreground hover:underline'>
					{item.variant.product.name}
				</Link>
				{item.variant.name && <p className='text-sm text-muted-foreground'>{item.variant.name}</p>}
				{unavailable && <p className='text-xs text-destructive'>Sản phẩm này hiện đã ngừng bán</p>}
				{error && <p className='text-xs text-destructive'>{error}</p>}

				<div className='mt-2 flex flex-wrap items-center justify-between gap-3'>
					<QuantityInput
						value={item.quantity}
						onChange={onQuantityChange}
						max={item.variant.stockQuantity}
						disabled={pending || unavailable}
					/>
					<div className='flex items-center gap-3'>
						<span className='font-medium text-foreground'>
							{formatCurrency(Number(item.variant.price) * item.quantity)}
						</span>
						<button
							type='button'
							className='text-xs text-destructive underline-offset-4 hover:underline'
							onClick={() => setConfirmingRemove(true)}>
							Xoá
						</button>
					</div>
				</div>
			</div>

			<ConfirmDialog
				open={confirmingRemove}
				onOpenChange={setConfirmingRemove}
				title='Xoá sản phẩm khỏi giỏ hàng?'
				confirmLabel='Xoá'
				onConfirm={confirmRemove}
			/>
		</div>
	);
}
