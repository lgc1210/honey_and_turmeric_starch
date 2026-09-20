import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { getDashboardStats } from "../api/service";

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

const STATUS_LABEL: Record<string, string> = {
	Pending: "Chờ xác nhận",
	Confirmed: "Đã xác nhận",
	Processing: "Đang xử lý",
	Completed: "Hoàn thành",
	Cancelled: "Đã huỷ",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "accent" | "destructive" | "outline"> = {
	Pending: "outline",
	Confirmed: "accent",
	Processing: "accent",
	Completed: "default",
	Cancelled: "destructive",
};

export function StatCards({ stats }: { stats: Stats }) {
	const cards = [
		{ label: `Doanh thu ${stats.days} ngày qua`, value: formatCurrency(stats.totalRevenue) },
		{ label: `Giá trị đơn TB (${stats.days} ngày)`, value: formatCurrency(stats.averageOrderValue) },
		{ label: "Tổng đơn hàng", value: stats.totalOrders.toLocaleString("vi-VN") },
		{ label: "Đơn hàng hôm nay", value: stats.ordersToday.toLocaleString("vi-VN") },
		{ label: "Sản phẩm đang bán", value: stats.activeProducts.toLocaleString("vi-VN") },
		{ label: "Danh mục đang bán", value: stats.activeCategories.toLocaleString("vi-VN") },
		{ label: "Biến thể sắp hết hàng", value: stats.lowStockVariants.toLocaleString("vi-VN") },
		{ label: "Mã giảm giá đang hoạt động", value: stats.activeCoupons.toLocaleString("vi-VN") },
	];

	return (
		<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			{cards.map((card) => (
				<div key={card.label} className='border border-border p-4'>
					<p className='text-sm text-muted-foreground'>{card.label}</p>
					<p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
				</div>
			))}
		</div>
	);
}

/** Biểu đồ đường doanh thu bằng SVG thuần — không cần thêm thư viện chart. */
export function RevenueTrendChart({ revenueByDay }: { revenueByDay: Stats["revenueByDay"] }) {
	const width = 600;
	const height = 200;
	const paddingX = 8;
	const paddingY = 16;
	const max = Math.max(1, ...revenueByDay.map((d) => d.amount));
	const stepX = revenueByDay.length > 1 ? (width - paddingX * 2) / (revenueByDay.length - 1) : 0;

	const points = revenueByDay.map((day, index) => {
		const x = paddingX + index * stepX;
		const y = height - paddingY - (day.amount / max) * (height - paddingY * 2);
		return { x, y, day };
	});

	const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
	const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - paddingY} L ${points[0]?.x ?? 0} ${height - paddingY} Z`;

	// chỉ hiện nhãn ngày mỗi ~5 điểm để đỡ rối
	const labelEvery = Math.ceil(revenueByDay.length / 6);

	return (
		<div className='border border-border p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='font-semibold text-foreground'>Xu hướng doanh thu ({revenueByDay.length} ngày qua)</h3>
				<span className='text-sm text-muted-foreground'>Cao nhất: {formatCurrency(max)}</span>
			</div>
			<svg viewBox={`0 0 ${width} ${height}`} className='w-full' role='img' aria-label='Biểu đồ doanh thu theo ngày'>
				<path d={areaPath} fill='var(--color-primary)' fillOpacity={0.12} stroke='none' />
				<path d={linePath} fill='none' stroke='var(--color-primary)' strokeWidth={2} />
				{points.map((p, index) => (
					<circle key={index} cx={p.x} cy={p.y} r={2.5} fill='var(--color-primary)'>
						<title>{`${p.day.label}: ${formatCurrency(p.day.amount)}`}</title>
					</circle>
				))}
			</svg>
			<div className='mt-1 flex justify-between text-xs text-muted-foreground'>
				{revenueByDay.map((day, index) => (index % labelEvery === 0 ? <span key={index}>{day.label}</span> : null))}
			</div>
		</div>
	);
}

export function StatusBreakdown({ statusBreakdown }: { statusBreakdown: Stats["statusBreakdown"] }) {
	const max = Math.max(1, ...statusBreakdown.map((s) => s.count));

	return (
		<div className='border border-border p-4'>
			<h3 className='mb-4 font-semibold text-foreground'>Đơn hàng theo trạng thái</h3>
			<ul className='space-y-3'>
				{statusBreakdown.map((item) => (
					<li key={item.status}>
						<div className='mb-1 flex items-center justify-between text-sm'>
							<Badge variant={STATUS_BADGE_VARIANT[item.status]}>{STATUS_LABEL[item.status] ?? item.status}</Badge>
							<span className='font-medium text-foreground'>{item.count}</span>
						</div>
						<div className='h-2 w-full bg-muted'>
							<div className='h-2 bg-primary/70' style={{ width: `${(item.count / max) * 100}%` }} />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export function TopProductsChart({ topProducts, days }: { topProducts: Stats["topProducts"]; days: number }) {
	if (topProducts.length === 0) {
		return (
			<div className='border border-border p-4'>
				<h3 className='mb-2 font-semibold text-foreground'>Sản phẩm bán chạy</h3>
				<p className='text-sm text-muted-foreground'>Chưa có dữ liệu đơn hàng trong {days} ngày qua.</p>
			</div>
		);
	}

	const max = Math.max(1, ...topProducts.map((p) => Number(p.revenue)));

	return (
		<div className='border border-border p-4'>
			<h3 className='mb-4 font-semibold text-foreground'>Sản phẩm bán chạy ({days} ngày qua)</h3>
			<ul className='space-y-3'>
				{topProducts.map((product) => (
					<li key={product.sku}>
						<div className='mb-1 flex items-center justify-between gap-2 text-sm'>
							<span className='truncate text-foreground'>
								{product.productName} <span className='text-muted-foreground'>({product.sku})</span>
							</span>
							<span className='shrink-0 font-medium text-foreground'>{formatCurrency(product.revenue)}</span>
						</div>
						<div className='h-2 w-full bg-muted'>
							<div className='h-2 bg-accent' style={{ width: `${(Number(product.revenue) / max) * 100}%` }} />
						</div>
						<p className='mt-0.5 text-xs text-muted-foreground'>Đã bán {product.quantitySold} sản phẩm</p>
					</li>
				))}
			</ul>
		</div>
	);
}

export function RecentOrdersTable({ recentOrders }: { recentOrders: Stats["recentOrders"] }) {
	return (
		<div className='border border-border p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='font-semibold text-foreground'>Đơn hàng gần đây</h3>
				<Link href='/admin/orders' className='text-sm text-primary underline-offset-4 hover:underline'>
					Xem tất cả
				</Link>
			</div>
			{recentOrders.length === 0 ? (
				<p className='text-sm text-muted-foreground'>Chưa có đơn hàng nào.</p>
			) : (
				<ul className='divide-y divide-border'>
					{recentOrders.map((order) => (
						<li key={order.id} className='flex items-center justify-between gap-2 py-2 text-sm'>
							<div className='min-w-0'>
								<Link
									href={`/admin/orders?search=${order.orderNumber}`}
									className='font-medium text-foreground underline-offset-4 hover:underline'>
									{order.orderNumber}
								</Link>
								<p className='truncate text-xs text-muted-foreground'>
									{order.recipientName} · {formatDate(order.createdAt)}
								</p>
							</div>
							<div className='shrink-0 text-right'>
								<p className='font-medium text-foreground'>{formatCurrency(order.totalAmount)}</p>
								<Badge variant={STATUS_BADGE_VARIANT[order.status]}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function LowStockList({ lowStockList }: { lowStockList: Stats["lowStockList"] }) {
	return (
		<div className='border border-border p-4'>
			<h3 className='mb-4 font-semibold text-foreground'>Biến thể sắp hết hàng</h3>
			{lowStockList.length === 0 ? (
				<p className='text-sm text-muted-foreground'>Không có biến thể nào sắp hết hàng.</p>
			) : (
				<ul className='divide-y divide-border'>
					{lowStockList.map((variant) => (
						<li key={variant.id} className='flex items-center justify-between gap-2 py-2 text-sm'>
							<Link
								href={`/admin/products/${variant.product.id}`}
								className='min-w-0 truncate text-foreground underline-offset-4 hover:underline'>
								{variant.product.name} {variant.name ? `— ${variant.name}` : ""}{" "}
								<span className='text-muted-foreground'>({variant.sku})</span>
							</Link>
							<Badge variant={variant.stockQuantity === 0 ? "destructive" : "outline"} className='shrink-0'>
								Còn {variant.stockQuantity}
							</Badge>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
