import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
	return (
		<div className='space-y-12'>
			<Skeleton className='h-4 w-64' />

			<div className='grid gap-8 lg:grid-cols-2'>
				<div className='space-y-2'>
					<Skeleton className='aspect-square w-full' />
					<div className='flex gap-2'>
						{Array.from({ length: 3 }, (_, i) => (
							<Skeleton key={i} className='h-16 w-16' />
						))}
					</div>
				</div>

				<div className='space-y-4'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-8 w-3/4' />
					<Skeleton className='h-7 w-32' />
					<Skeleton className='h-20 w-full' />
					<Skeleton className='h-10 w-40' />
				</div>
			</div>
		</div>
	);
}
