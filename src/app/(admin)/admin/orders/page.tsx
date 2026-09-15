import { AdminShell } from "@/components/admin/admin-shell";
import { OrderStatusForm } from "@/features/admin/components/admin-forms";
import { requireAdmin } from "@/features/admin/api/auth";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
	await requireAdmin();
	const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, orderNumber: true, recipientName: true, totalAmount: true, status: true, createdAt: true } });
	return <AdminShell title="Đơn hàng" description="Theo dõi và cập nhật trạng thái đơn hàng." activeHref="/admin/orders"><div className="overflow-x-auto rounded-2xl border"><table className="min-w-full text-left text-sm"><thead><tr className="bg-[#fffaf3]"><th className="p-3">Mã đơn</th><th className="p-3">Khách hàng</th><th className="p-3">Tổng tiền</th><th className="p-3">Ngày tạo</th><th className="p-3">Trạng thái</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id.toString()} className="border-t"><td className="p-3 font-medium">{o.orderNumber}</td><td className="p-3">{o.recipientName}</td><td className="p-3">{o.totalAmount.toString()} ₫</td><td className="p-3">{o.createdAt.toLocaleDateString("vi-VN")}</td><td className="p-3"><OrderStatusForm orderId={o.id.toString()} status={o.status} /></td></tr>)}</tbody></table></div></AdminShell>;
}
