import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryForm } from "@/features/admin/components/admin-forms";
import { requireAdmin } from "@/features/admin/api/auth";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
	await requireAdmin();
	const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
	return <AdminShell title="Danh mục sản phẩm" description="Quản lý danh mục từ database." activeHref="/admin/categories">
		<CategoryForm /><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{categories.map((category) => <div key={category.id.toString()} className="rounded-2xl border p-4"><h3 className="font-semibold">{category.name}</h3><p className="mt-2 text-sm text-[#6a4d32]">{category.slug} · {category._count.products} sản phẩm</p><p className="mt-2 text-xs">{category.status}</p></div>)}</div>
	</AdminShell>;
}
