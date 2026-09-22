import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/ui/pagination";
import { getAdminOrders } from "@/features/order/api/service";
import { OrderTable } from "@/features/order/components/order-table";
import type { SearchParams } from "@/types/common";
import paths from "@/config/path";
import { OrdersFilters } from "@/features/order/components/orders-filters";
import { orderQuerySchema } from "@/features/order/schema";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const rawParams = await searchParams;
	const query = orderQuerySchema.parse({
		page: rawParams.page,
		search: rawParams.search,
		status: rawParams.status,
		fromDate: rawParams.fromDate,
		toDate: rawParams.toDate,
	});

	const result = await getAdminOrders(query);

	return (
		<AdminShell>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Đơn hàng</h1>
			<OrdersFilters />
			<OrderTable orders={result.items} />
			<Pagination page={result.page} totalPages={result.totalPages} basePath={paths.admin.orders} />
		</AdminShell>
	);
}
