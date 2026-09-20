import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardStats } from "@/features/dashboard/api/service";
import { dashboardQuerySchema } from "@/features/dashboard/schema";
import { DashboardRangeForm } from "@/features/dashboard/components/dashboard-range-form";
import {
	LowStockList,
	RecentOrdersTable,
	RevenueTrendChart,
	StatCards,
	StatusBreakdown,
	TopProductsChart,
} from "@/features/dashboard/components/dashboard-widgets";
import type { SearchParams } from "@/types/common";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const rawParams = await searchParams;
	const { days } = dashboardQuerySchema.parse({ days: rawParams.days });

	const stats = await getDashboardStats(days);

	return (
		<AdminShell>
			<div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
				<h1 className='font-sans text-2xl font-bold text-foreground'>Tổng quan</h1>
				<DashboardRangeForm days={days} />
			</div>

			<div className='space-y-6'>
				<StatCards stats={stats} />

				<RevenueTrendChart revenueByDay={stats.revenueByDay} />

				<div className='grid gap-6 lg:grid-cols-2'>
					<StatusBreakdown statusBreakdown={stats.statusBreakdown} />
					<TopProductsChart topProducts={stats.topProducts} days={stats.days} />
				</div>

				<div className='grid gap-6 lg:grid-cols-2'>
					<RecentOrdersTable recentOrders={stats.recentOrders} />
					<LowStockList lowStockList={stats.lowStockList} />
				</div>
			</div>
		</AdminShell>
	);
}
