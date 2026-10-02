import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/features/product/components/product-skeleton";

export default function ShopLoading() {
	return (
		<div>
			<Skeleton className='mb-6 h-8 w-40' />
			<div className='mb-6 flex flex-wrap gap-3'>
				<Skeleton className='h-9 w-56' />
				<Skeleton className='h-9 w-40' />
				<Skeleton className='h-9 w-36' />
				<Skeleton className='h-9 w-16' />
			</div>
			<ProductGridSkeleton />
		</div>
	);
}
