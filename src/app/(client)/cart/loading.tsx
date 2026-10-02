import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
	return (
		<div>
			<Skeleton className='mb-6 h-8 w-32' />
			<div className='grid gap-8 lg:grid-cols-3'>
				<div className='space-y-4 border border-border p-4 lg:col-span-2'>
					{Array.from({ length: 3 }, (_, i) => (
						<div key={i} className='flex gap-4'>
							<Skeleton className='h-20 w-20 shrink-0' />
							<div className='flex-1 space-y-2'>
								<Skeleton className='h-4 w-1/2' />
								<Skeleton className='h-4 w-1/4' />
								<Skeleton className='h-8 w-24' />
							</div>
						</div>
					))}
				</div>
				<div className='h-fit space-y-3 border border-border p-4'>
					<Skeleton className='h-5 w-32' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-10 w-full' />
				</div>
			</div>
		</div>
	);
}
