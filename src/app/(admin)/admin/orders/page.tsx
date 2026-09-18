import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminOrders } from "@/features/order/api/service";
import { OrderTable } from "@/features/order/components/order-table";
import type { SearchParams } from "@/types/common";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const params = await searchParams;
	const page = Number(params.page) || 1;

	const result = await getAdminOrders({
		page,
		status: typeof params.status === "string" ? (params.status as never) : undefined,
		search: typeof params.search === "string" ? params.search : undefined,
	});

	return (
		<AdminShell>
			<h1 className="mb-6 font-serif text-2xl font-semibold text-foreground">Đơn hàng</h1>
			<OrderTable orders={result.items} />

			{result.totalPages > 1 && (
				<div className="mt-4 flex gap-2">
					{Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
						<Link key={p} href={`/admin/orders?page=${p}`} className="border border-border px-3 py-1 text-sm">
							{p}
						</Link>
					))}
				</div>
			)}
		</AdminShell>
	);
}
