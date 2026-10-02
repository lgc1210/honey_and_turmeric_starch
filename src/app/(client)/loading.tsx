import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/features/product/components/product-skeleton";

export default function HomeLoading() {
	return (
		<div className='space-y-16'>
			<div className='space-y-4 border border-border bg-card px-6 py-20 text-center'>
				<Skeleton className='mx-auto h-4 w-40' />
				<Skeleton className='mx-auto h-10 w-3/4 max-w-md' />
				<Skeleton className='mx-auto h-4 w-full max-w-xl' />
				<Skeleton className='mx-auto mt-4 h-11 w-48' />
			</div>
			<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className='h-32' />
				))}
			</div>
			<ProductGridSkeleton />
		</div>
	);
}
