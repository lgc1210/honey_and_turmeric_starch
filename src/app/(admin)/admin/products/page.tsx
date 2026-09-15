import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/features/admin/components/admin-forms";
import { requireAdmin } from "@/features/admin/api/auth";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
	await requireAdmin();
	const [products, categories] = await Promise.all([
		prisma.product.findMany({ include: { category: true, variants: { orderBy: { price: "asc" }, take: 1 } }, orderBy: { createdAt: "desc" } }),
		prisma.category.findMany({ where: { status: "Active" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
	]);
	return <AdminShell title="Quản lý sản phẩm" description="Sản phẩm và biến thể được đọc trực tiếp từ Prisma." activeHref="/admin/products">
		<ProductForm categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))} />
		<div className="mt-4 overflow-x-auto rounded-2xl border"><table className="min-w-full text-left text-sm"><thead><tr className="bg-[#fffaf3]"><th className="p-3">Sản phẩm</th><th className="p-3">Danh mục</th><th className="p-3">SKU</th><th className="p-3">Giá</th><th className="p-3">Trạng thái</th></tr></thead><tbody>{products.map((p) => <tr key={p.id.toString()} className="border-t"><td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.category.name}</td><td className="p-3">{p.variants[0]?.sku ?? "—"}</td><td className="p-3">{p.variants[0]?.price.toString() ?? "—"} ₫</td><td className="p-3">{p.status}</td></tr>)}</tbody></table></div>
	</AdminShell>;
}
