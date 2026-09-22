"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { formatCurrency } from "@/lib/utils";
import { addToCartAction } from "@/features/cart/api/action";

type OptionValue = { id: string; value: string };
type ProductOption = { id: string; name: string; values: OptionValue[] };
type Variant = {
	id: string;
	sku: string;
	name: string | null;
	price: string;
	oldPrice: string | null;
	stockQuantity: number;
	optionValues: { optionValue: { id: string } }[];
	images: { url: string }[];
};

export function VariantPicker({ options, variants }: { options: ProductOption[]; variants: Variant[] }) {
	const router = useRouter();

	// value.id -> option.id, để biết 1 giá trị thuộc nhóm thuộc tính nào
	const optionIdByValueId = useMemo(() => {
		const map = new Map<string, string>();
		for (const option of options) for (const value of option.values) map.set(value.id, option.id);
		return map;
	}, [options]);

	const firstVariant = variants[0];
	const [selected, setSelected] = useState<Record<string, string>>(() => {
		const initial: Record<string, string> = {};
		for (const ov of firstVariant?.optionValues ?? []) {
			const optionId = optionIdByValueId.get(ov.optionValue.id);
			if (optionId) initial[optionId] = ov.optionValue.id;
		}
		return initial;
	});
	const [quantity, setQuantity] = useState(1);
	const [activeImage, setActiveImage] = useState(0);
	const [message, setMessage] = useState("");
	const [pending, setPending] = useState(false);

	const selectedValueIds = Object.values(selected);
	const activeVariant =
		variants.find((variant) => {
			const variantValueIds = variant.optionValues.map((ov) => ov.optionValue.id);
			return (
				variantValueIds.length === selectedValueIds.length &&
				variantValueIds.every((id) => selectedValueIds.includes(id))
			);
		}) ?? firstVariant;

	function selectValue(optionId: string, valueId: string) {
		setSelected((prev) => ({ ...prev, [optionId]: valueId }));
		setActiveImage(0);
		setMessage("");
	}

	async function onAddToCart() {
		if (!activeVariant) return;
		setPending(true);
		setMessage("");
		const result = await addToCartAction({ productVariantId: activeVariant.id, quantity });
		setPending(false);
		if (!result.success) {
			setMessage(result.error);
			return;
		}
		setMessage("Đã thêm vào giỏ hàng.");
		router.refresh();
	}

	if (!activeVariant) {
		return <p className='text-sm text-muted-foreground'>Sản phẩm hiện không còn biến thể nào đang bán.</p>;
	}

	const images = activeVariant.images.length ? activeVariant.images : [];
	const outOfStock = activeVariant.stockQuantity <= 0;

	return (
		<div className='space-y-6'>
			<div>
				<div className='aspect-square border border-border bg-muted'>
					{images[activeImage] ? (
						// eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ do admin upload
						<img src={images[activeImage].url} alt='' className='h-full w-full object-cover' />
					) : (
						<div className='flex h-full w-full items-center justify-center text-sm text-muted-foreground'>
							Chưa có ảnh
						</div>
					)}
				</div>
				{images.length > 1 && (
					<div className='mt-2 flex gap-2'>
						{images.map((image, index) => (
							<button
								key={image.url + index}
								type='button'
								onClick={() => setActiveImage(index)}
								className={`h-16 w-16 border ${index === activeImage ? "border-primary" : "border-border"}`}>
								{/* eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ do admin upload */}
								<img src={image.url} alt='' className='h-full w-full object-cover' />
							</button>
						))}
					</div>
				)}
			</div>

			<div className='flex items-baseline gap-3'>
				<span className='text-2xl font-semibold text-primary'>{formatCurrency(activeVariant.price)}</span>
				{activeVariant.oldPrice && Number(activeVariant.oldPrice) > Number(activeVariant.price) && (
					<span className='text-muted-foreground line-through'>{formatCurrency(activeVariant.oldPrice)}</span>
				)}
			</div>

			{options.map((option) => (
				<div key={option.id} className='space-y-2'>
					<p className='text-sm font-medium text-foreground'>{option.name}</p>
					<div className='flex flex-wrap gap-2'>
						{option.values.map((value) => (
							<button
								key={value.id}
								type='button'
								onClick={() => selectValue(option.id, value.id)}
								className={`border px-3 py-1.5 text-sm ${
									selected[option.id] === value.id
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-foreground hover:border-primary/50"
								}`}>
								{value.value}
							</button>
						))}
					</div>
				</div>
			))}

			<div>
				{outOfStock ? (
					<Badge variant='destructive'>Tạm hết hàng</Badge>
				) : (
					<p className='text-sm text-muted-foreground'>Còn {activeVariant.stockQuantity} sản phẩm</p>
				)}
			</div>

			<div className='flex flex-wrap items-center gap-3'>
				<QuantityInput
					value={quantity}
					onChange={setQuantity}
					max={activeVariant.stockQuantity}
					disabled={outOfStock}
				/>
				<Button type='button' onClick={onAddToCart} disabled={pending || outOfStock}>
					{pending ? "Đang thêm..." : "Thêm vào giỏ"}
				</Button>
			</div>

			{message && <p className='text-sm text-muted-foreground'>{message}</p>}
		</div>
	);
}
