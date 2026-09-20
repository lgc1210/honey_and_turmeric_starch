import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminCategories } from "@/features/category/api/service";
import { CategoryForm } from "@/features/category/components/category-form";
import { CategoryViewSwitcher } from "@/features/category/components/category-view-switcher";

export default async function CategoriesPage() {
	const categories = await getAdminCategories();

	return (
		<AdminShell>
			<h1 className='mb-4 font-sans text-2xl font-bold text-foreground'>Danh mục</h1>
			<CategoryForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
			<CategoryViewSwitcher categories={categories} />
		</AdminShell>
	);
}
