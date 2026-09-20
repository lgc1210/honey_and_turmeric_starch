import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getActiveCategoryOptions } from "@/features/category/api/service";
import { getAdminProductById } from "@/features/product/api/service";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import { VariantCard } from "@/features/product/components/variant-card";
import { VariantForm } from "@/features/product/components/variant-form";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) notFound();

	const [product, categories] = await Promise.all([getAdminProductById(BigInt(id)), getActiveCategoryOptions()]);
	if (!product) notFound();

	const optionValues = product.options.flatMap((option) =>
		option.values.map((value) => ({ id: value.id, value: `${option.name}: ${value.value}` })),
	);

	return (
		<AdminShell>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>{product.name}</h1>

			<ProductEditForm
				product={{
					id: product.id,
					name: product.name,
					slug: product.slug,
					description: product.description,
					categoryId: product.categoryId,
				}}
				categories={categories}
			/>

			<section className='mt-6 space-y-4'>
				<h2 className='font-semibold text-foreground'>Biến thể</h2>
				<VariantForm productId={product.id} optionValues={optionValues} />
				<div className='space-y-4'>
					{product.variants.map((variant) => (
						<VariantCard key={variant.id} variant={variant} />
					))}
				</div>
			</section>
		</AdminShell>
	);
}
