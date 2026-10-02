import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getActiveCategoryOptions } from "../api/service";

export async function CategoryShowcase() {
	const categories = await getActiveCategoryOptions();
	const topLevel = categories.filter((c) => !c.parentId).slice(0, 6);

	if (topLevel.length === 0) return null;

	return (
		<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
			{topLevel.map((category, index) => (
				<Link
					key={category.id}
					href={`/products?categoryId=${category.id}`}
					className='group flex animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex-col items-center gap-2 border border-border bg-card p-4 text-center transition-colors duration-200 hover:border-primary/50'
					style={{ animationDelay: `${index * 60}ms` }}>
					<span className='flex size-12 items-center justify-center bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110'>
						<Sparkles className='size-5' />
					</span>
					<span className='text-sm font-medium text-foreground'>{category.name}</span>
				</Link>
			))}
		</div>
	);
}
