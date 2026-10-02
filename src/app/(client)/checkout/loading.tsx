import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
	return (
		<div>
			<Skeleton className='mb-6 h-8 w-32' />
			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Skeleton className='h-16 w-full' />
						<Skeleton className='h-16 w-full' />
						<Skeleton className='h-16 w-full sm:col-span-2' />
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Skeleton className='h-16 w-full' />
						<Skeleton className='h-16 w-full' />
					</div>
					<Skeleton className='h-16 w-full' />
					<Skeleton className='h-11 w-full' />
				</div>
				<div className='h-fit space-y-3 border border-border p-4'>
					<Skeleton className='h-5 w-32' />
					{Array.from({ length: 2 }, (_, i) => (
						<Skeleton key={i} className='h-10 w-full' />
					))}
					<Skeleton className='h-4 w-full' />
				</div>
			</div>
		</div>
	);
}
