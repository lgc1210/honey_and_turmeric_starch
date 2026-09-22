import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export type ProductCardData = {
	id: string;
	name: string;
	slug: string;
	minPrice: number;
	variants: { price: string; oldPrice: string | null; images: { url: string }[] }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
	const primaryVariant = product.variants[0];
	const image = primaryVariant?.images[0]?.url;
	const oldPrice = primaryVariant?.oldPrice;

	return (
		<Link href={`/products/${product.slug}`} className='group block border border-border bg-card'>
			<div className='aspect-square overflow-hidden bg-muted'>
				{image ? (
					// eslint-disable-next-line @next/next/no-img-element -- ảnh do admin upload lên server nội bộ
					<img
						src={image}
						alt={product.name}
						className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center text-xs text-muted-foreground'>
						Chưa có ảnh
					</div>
				)}
			</div>
			<div className='p-3'>
				<h3 className='truncate text-sm font-medium text-foreground'>{product.name}</h3>
				<div className='mt-1 flex items-baseline gap-2'>
					<span className='font-semibold text-primary'>{formatCurrency(product.minPrice)}</span>
					{oldPrice && Number(oldPrice) > product.minPrice && (
						<span className='text-xs text-muted-foreground line-through'>{formatCurrency(oldPrice)}</span>
					)}
				</div>
			</div>
		</Link>
	);
}
