import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/features/admin/api/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
	await requireAdmin();
	const [orders, products, categories, revenue, lowStock] = await Promise.all([
		prisma.order.count(), prisma.product.count({ where: { status: "Active" } }), prisma.category.count({ where: { status: "Active" } }),
		prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "Cancelled" } } }),
		prisma.productVariant.count({ where: { stockQuantity: { lte: 5 }, status: "Active" } }),
	]);
	return <AdminShell title="Tổng quan" description="Số liệu thực tế từ cơ sở dữ liệu." activeHref="/admin/dashboard">
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[
			["Tổng đơn hàng", orders], ["Sản phẩm đang bán", products], ["Danh mục", categories], ["Sắp hết hàng", lowStock],
		].map(([label, value]) => <div key={String(label)} className="rounded-2xl border p-4"><p className="text-sm text-[#6a4d32]">{label}</p><strong className="mt-3 block text-2xl">{String(value)}</strong></div>)}</div>
		<p className="mt-6 rounded-xl border p-4">Doanh thu ghi nhận: <strong>{revenue._sum.totalAmount?.toString() ?? "0"} ₫</strong></p>
	</AdminShell>;
}
