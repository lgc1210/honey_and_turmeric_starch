import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/ui/pagination";
import { getAdminOrders } from "@/features/order/api/service";
import { OrderTable } from "@/features/order/components/order-table";
import type { SearchParams } from "@/types/common";
import paths from "@/config/path";

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
			<h1 className='mb-6 font-serif text-2xl font-semibold text-foreground'>Đơn hàng</h1>
			<OrderTable orders={result.items} />

			<Pagination page={result.page} totalPages={result.totalPages} basePath={paths.admin.orders} />
		</AdminShell>
	);
}
