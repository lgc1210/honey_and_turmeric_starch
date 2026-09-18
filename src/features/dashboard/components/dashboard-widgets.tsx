import { formatCurrency } from "@/lib/utils";
import type { getDashboardStats } from "../api/service";

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

const STATUS_LABEL: Record<string, string> = {
	Pending: "Chờ xác nhận",
	Confirmed: "Đã xác nhận",
	Processing: "Đang xử lý",
	Completed: "Hoàn thành",
	Cancelled: "Đã huỷ",
};

export function StatCards({ stats }: { stats: Stats }) {
	const cards = [
		{ label: "Tổng đơn hàng", value: stats.totalOrders.toLocaleString("vi-VN") },
		{ label: "Doanh thu (chưa gồm đơn huỷ)", value: formatCurrency(stats.totalRevenue) },
		{ label: "Sản phẩm đang bán", value: stats.activeProducts.toLocaleString("vi-VN") },
		{ label: "Biến thể sắp hết hàng (≤5)", value: stats.lowStockVariants.toLocaleString("vi-VN") },
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<div key={card.label} className="border border-border p-4">
					<p className="text-sm text-muted-foreground">{card.label}</p>
					<p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
				</div>
			))}
		</div>
	);
}

export function RevenueChart({ revenueByDay }: { revenueByDay: Stats["revenueByDay"] }) {
	const max = Math.max(1, ...revenueByDay.map((d) => d.amount));

	return (
		<div className="border border-border p-4">
			<h3 className="mb-4 font-semibold text-foreground">Doanh thu 7 ngày gần nhất</h3>
			<div className="flex h-40 items-end gap-3">
				{revenueByDay.map((day) => (
					<div key={day.label} className="flex flex-1 flex-col items-center gap-2">
						<div
							className="w-full bg-primary/70"
							style={{ height: `${Math.max(4, (day.amount / max) * 100)}%` }}
							title={formatCurrency(day.amount)}
						/>
						<span className="text-xs text-muted-foreground">{day.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function StatusBreakdown({ statusBreakdown }: { statusBreakdown: Stats["statusBreakdown"] }) {
	return (
		<div className="border border-border p-4">
			<h3 className="mb-4 font-semibold text-foreground">Đơn hàng theo trạng thái</h3>
			<ul className="space-y-2 text-sm">
				{statusBreakdown.map((item) => (
					<li key={item.status} className="flex items-center justify-between">
						<span className="text-muted-foreground">{STATUS_LABEL[item.status] ?? item.status}</span>
						<span className="font-medium text-foreground">{item.count}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
