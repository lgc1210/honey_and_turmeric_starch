import { AdminShell } from "@/components/admin/admin-shell";
import { getActiveCategoryOptions } from "@/features/category/api/service";
import { ProductCreateForm } from "@/features/product/components/product-create-form";

export default async function NewProductPage() {
	const categories = await getActiveCategoryOptions();

	return (
		<AdminShell>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Thêm sản phẩm mới</h1>
			<ProductCreateForm categories={categories} />
		</AdminShell>
	);
}
