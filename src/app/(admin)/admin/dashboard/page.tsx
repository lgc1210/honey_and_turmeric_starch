import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardStats } from "@/features/dashboard/api/service";
import { RevenueChart, StatCards, StatusBreakdown } from "@/features/dashboard/components/dashboard-widgets";

export default async function DashboardPage() {
	const stats = await getDashboardStats();

	return (
		<AdminShell>
			<h1 className="mb-6 font-serif text-2xl font-semibold text-foreground">Tổng quan</h1>
			<div className="space-y-6">
				<StatCards stats={stats} />
				<div className="grid gap-6 lg:grid-cols-2">
					<RevenueChart revenueByDay={stats.revenueByDay} />
					<StatusBreakdown statusBreakdown={stats.statusBreakdown} />
				</div>
			</div>
		</AdminShell>
	);
}
