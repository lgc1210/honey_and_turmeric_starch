"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
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

type VariantPickerProps = {
	name: string;
	categoryName: string;
	options: ProductOption[];
	variants: Variant[];
};

export function VariantPicker({ name, categoryName, options, variants }: VariantPickerProps) {
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
	const [added, setAdded] = useState(false);
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
		setAdded(false);
	}

	async function onAddToCart() {
		if (!activeVariant) return;
		setPending(true);
		setMessage("");
		setAdded(false);
		const result = await addToCartAction({ productVariantId: activeVariant.id, quantity });
		setPending(false);
		if (!result.success) {
			setMessage(result.error);
			return;
		}
		setAdded(true);
		router.refresh();
	}

	if (!activeVariant) {
		return <p className='text-sm text-muted-foreground'>Sản phẩm hiện không còn biến thể nào đang bán.</p>;
	}

	const images = activeVariant.images.length ? activeVariant.images : [];
	const outOfStock = activeVariant.stockQuantity <= 0;
	const hasDiscount = activeVariant.oldPrice && Number(activeVariant.oldPrice) > Number(activeVariant.price);

	return (
		<div className='grid items-start gap-8 lg:grid-cols-2 lg:gap-12'>
			{/* Thông tin + mua hàng: bên phải */}
			<div className='animate-in fade-in slide-in-from-left-4 space-y-6 duration-500 lg:col-start-2 lg:row-start-2'>
				<div>
					<p className='text-sm text-muted-foreground'>
						<span className='font-semibold'>{categoryName}</span> / Mã: {activeVariant.sku}
					</p>
					<h1 className='mt-2 font-sans text-2xl font-bold text-foreground lg:text-3xl'>{name}</h1>
				</div>

				<div>
					<div className='flex items-baseline gap-3'>
						<span className='text-3xl font-semibold text-primary'>{formatCurrency(activeVariant.price)}</span>
						{hasDiscount && (
							<span className='text-muted-foreground line-through'>{formatCurrency(activeVariant.oldPrice!)}</span>
						)}
					</div>
					<div className='mt-2'>
						{outOfStock ? (
							<Badge variant='destructive'>Tạm hết hàng</Badge>
						) : (
							<p className='text-sm text-muted-foreground'>Còn {activeVariant.stockQuantity} sản phẩm</p>
						)}
					</div>
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

				<div className='space-y-3 border-t border-border pt-6'>
					<div className='flex items-stretch gap-3'>
						<QuantityInput
							value={quantity}
							onChange={setQuantity}
							max={activeVariant.stockQuantity}
							disabled={outOfStock}
						/>
						<Button
							type='button'
							size='lg'
							onClick={onAddToCart}
							disabled={pending || outOfStock}
							className={`flex-1 ${added ? "bg-primary" : ""}`}>
							{pending ? (
								"Đang thêm..."
							) : added ? (
								<span className='flex animate-in fade-in zoom-in-95 items-center gap-2 duration-300'>
									<Check className='size-4' /> Đã thêm
								</span>
							) : (
								"Thêm vào giỏ"
							)}
						</Button>
					</div>

					{message && <p className='animate-in fade-in text-sm text-destructive duration-300'>{message}</p>}
				</div>
			</div>

			{/* Ảnh: đặt trước trong DOM để mobile hiện ảnh trên cùng, desktop nằm bên trái */}
			<div className='animate-in fade-in slide-in-from-right-4 duration-500 lg:col-start-1 lg:row-start-2'>
				<div className='aspect-4/3 overflow-hidden rounded-2xl bg-muted'>
					{images[activeImage] ? (
						// eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ do admin upload
						<img src={images[activeImage].url} alt={name} className='h-full w-full object-cover' />
					) : (
						<div className='flex h-full w-full items-center justify-center text-sm text-muted-foreground'>
							Chưa có ảnh
						</div>
					)}
				</div>

				{images.length > 1 && (
					<div className='mt-3 grid grid-cols-4 gap-3'>
						{images.map((image, index) => (
							<button
								key={image.url + index}
								type='button'
								onClick={() => setActiveImage(index)}
								aria-label={`Xem ảnh ${index + 1}`}
								className={`aspect-4/3 overflow-hidden rounded-xl border-2 bg-muted transition-colors ${
									index === activeImage ? "border-primary" : "border-transparent hover:border-primary/50"
								}`}>
								{/* eslint-disable-next-line @next/next/no-img-element -- ảnh nội bộ do admin upload */}
								<img src={image.url} alt='' className='h-full w-full object-cover' />
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
