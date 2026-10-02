import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
	return (
		<div className='border border-border bg-card'>
			<Skeleton className='aspect-square w-full' />
			<div className='space-y-2 p-3'>
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-4 w-1/3' />
			</div>
		</div>
	);
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
			{Array.from({ length: count }, (_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}
