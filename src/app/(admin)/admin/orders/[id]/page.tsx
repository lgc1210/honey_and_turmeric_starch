import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminOrderById } from "@/features/order/api/service";
import { OrderDetail } from "@/features/order/components/order-detail";
import paths from "@/config/path";
import { MoveLeft } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) notFound();

	const order = await getAdminOrderById(BigInt(id));
	if (!order) notFound();

	return (
		<AdminShell>
			<Link
				href={paths.admin.orders}
				className='mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline'>
				<MoveLeft className='size-4' />
				<span>Quay lại danh sách đơn hàng</span>
			</Link>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Chi tiết đơn hàng</h1>
			<OrderDetail order={order} />
		</AdminShell>
	);
}
