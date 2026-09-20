import { EntityStatus, OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

const ORDER_STATUSES = [
	OrderStatus.Pending,
	OrderStatus.Confirmed,
	OrderStatus.Processing,
	OrderStatus.Completed,
	OrderStatus.Cancelled,
] as const;
const LOW_STOCK_THRESHOLD = 5;
const LOW_STOCK_LIST_LIMIT = 8;
const TOP_PRODUCTS_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 8;

function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

/** @param days Số ngày thống kê doanh thu/đơn hàng trung bình — do admin tự chọn (mặc định 30). */
export async function getDashboardStats(days: number) {
	const today = startOfDay(new Date());
	const trendStart = new Date(today);
	trendStart.setDate(trendStart.getDate() - (days - 1));

	const [
		totalOrders,
		ordersToday,
		activeProducts,
		activeCategories,
		activeVariants,
		activeCoupons,
		revenueAggregate,
		lowStockCount,
		lowStockList,
		ordersForTrend,
		statusCounts,
		topProducts,
		recentOrders,
	] = await Promise.all([
		prisma.order.count(),
		prisma.order.count({ where: { createdAt: { gte: today } } }),
		prisma.product.count({ where: { status: EntityStatus.Active } }),
		prisma.category.count({ where: { status: EntityStatus.Active } }),
		prisma.productVariant.count({ where: { status: EntityStatus.Active } }),
		prisma.coupon.count({ where: { status: EntityStatus.Active } }),
		// Doanh thu/giá trị đơn TB tính trong đúng khoảng ngày admin chọn (khớp với biểu đồ xu hướng).
		prisma.order.aggregate({
			_sum: { totalAmount: true },
			_count: true,
			where: { status: { not: OrderStatus.Cancelled }, createdAt: { gte: trendStart } },
		}),
		prisma.productVariant.count({
			where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD }, status: EntityStatus.Active },
		}),
		prisma.productVariant.findMany({
			where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD }, status: EntityStatus.Active },
			select: {
				id: true,
				sku: true,
				name: true,
				stockQuantity: true,
				product: { select: { id: true, name: true } },
			},
			orderBy: { stockQuantity: "asc" },
			take: LOW_STOCK_LIST_LIMIT,
		}),
		prisma.order.findMany({
			where: { status: { not: OrderStatus.Cancelled }, createdAt: { gte: trendStart } },
			select: { createdAt: true, totalAmount: true },
		}),
		prisma.order.groupBy({ by: ["status"], _count: true }),
		prisma.orderItem.groupBy({
			by: ["sku", "productName"],
			_sum: { quantity: true, subtotal: true },
			where: { order: { status: { not: OrderStatus.Cancelled }, createdAt: { gte: trendStart } } },
			orderBy: { _sum: { subtotal: "desc" } },
			take: TOP_PRODUCTS_LIMIT,
		}),
		prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			take: RECENT_ORDERS_LIMIT,
			select: { id: true, orderNumber: true, recipientName: true, totalAmount: true, status: true, createdAt: true },
		}),
	]);

	const revenueByDay = Array.from({ length: days }, (_, index) => {
		const date = new Date(trendStart);
		date.setDate(date.getDate() + index);
		const next = new Date(date);
		next.setDate(next.getDate() + 1);

		const amount = ordersForTrend
			.filter((order) => order.createdAt >= date && order.createdAt < next)
			.reduce((sum, order) => sum + Number(order.totalAmount), 0);

		return { label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), amount };
	});

	const statusCountByStatus = new Map(statusCounts.map((row) => [row.status, row._count]));
	const statusBreakdown = ORDER_STATUSES.map((status) => ({ status, count: statusCountByStatus.get(status) ?? 0 }));

	const totalRevenue = revenueAggregate._sum.totalAmount?.toString() ?? "0";
	const averageOrderValue =
		revenueAggregate._count > 0 ? (Number(totalRevenue) / revenueAggregate._count).toFixed(0) : "0";

	return {
		days,
		totalOrders,
		ordersToday,
		activeProducts,
		activeCategories,
		activeVariants,
		activeCoupons,
		lowStockVariants: lowStockCount,
		lowStockList: serialize(lowStockList),
		totalRevenue,
		averageOrderValue,
		revenueByDay,
		statusBreakdown,
		topProducts: topProducts.map((row) => ({
			sku: row.sku,
			productName: row.productName,
			quantitySold: row._sum.quantity ?? 0,
			revenue: row._sum.subtotal?.toString() ?? "0",
		})),
		recentOrders: serialize(recentOrders),
	};
}
