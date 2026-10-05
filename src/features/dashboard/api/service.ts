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
const TIME_ZONE = "Asia/Ho_Chi_Minh";

type CountsRow = {
	ordersToday: number;
	activeProducts: number;
	activeCategories: number;
	activeVariants: number;
	activeCoupons: number;
	lowStockVariants: number;
};

type DailyRow = { day: string; amount: number; orders: number };

/** Trả về "YYYY-MM-DD" theo giờ Việt Nam. */
function toDayKey(date: Date): string {
	return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

/** 00:00 của ngày (giờ Việt Nam, UTC+7 cố định, không có DST). */
function startOfDayVN(date: Date): Date {
	return new Date(`${toDayKey(date)}T00:00:00+07:00`);
}

/** @param days Số ngày thống kê doanh thu/đơn hàng trung bình — do admin tự chọn (mặc định 30). */
export async function getDashboardStats(days: number) {
	const today = startOfDayVN(new Date());
	const trendStart = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

	const [countsRows, dailyRows, statusCounts, topProducts, lowStockList, recentOrders] = await Promise.all([
		// 1) Toàn bộ các số đếm gộp trong 1 truy vấn, trả về 1 dòng.
		prisma.$queryRaw<CountsRow[]>`
			SELECT
				(SELECT COUNT(*) FROM orders WHERE created_at >= ${today})::int AS "ordersToday",
				(SELECT COUNT(*) FROM products WHERE status = ${EntityStatus.Active}::"EntityStatus")::int AS "activeProducts",
				(SELECT COUNT(*) FROM categories WHERE status = ${EntityStatus.Active}::"EntityStatus")::int AS "activeCategories",
				(SELECT COUNT(*) FROM product_variants WHERE status = ${EntityStatus.Active}::"EntityStatus")::int AS "activeVariants",
				(SELECT COUNT(*) FROM coupons WHERE status = ${EntityStatus.Active}::"EntityStatus")::int AS "activeCoupons",
				(SELECT COUNT(*) FROM product_variants
					WHERE stock_quantity <= ${LOW_STOCK_THRESHOLD}
					AND status = ${EntityStatus.Active}::"EntityStatus")::int AS "lowStockVariants"
		`,

		// 2) Doanh thu + số đơn theo từng ngày, do database tự gom nhóm.
		prisma.$queryRaw<DailyRow[]>`
			SELECT
				to_char((created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS day,
				SUM(total_amount)::float8 AS amount,
				COUNT(*)::int AS orders
			FROM orders
			WHERE status <> ${OrderStatus.Cancelled}::"OrderStatus"
				AND created_at >= ${trendStart}
			GROUP BY 1
		`,

		// 3) Đếm theo trạng thái (toàn thời gian) — cũng dùng để suy ra totalOrders.
		prisma.order.groupBy({ by: ["status"], _count: true }),

		// 4) Top sản phẩm bán chạy trong khoảng ngày đã chọn.
		prisma.orderItem.groupBy({
			by: ["sku", "productName"],
			_sum: { quantity: true, subtotal: true },
			where: { order: { status: { not: OrderStatus.Cancelled }, createdAt: { gte: trendStart } } },
			orderBy: { _sum: { subtotal: "desc" } },
			take: TOP_PRODUCTS_LIMIT,
		}),

		// 5) Danh sách biến thể sắp hết hàng.
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

		// 6) Đơn hàng gần đây.
		prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			take: RECENT_ORDERS_LIMIT,
			select: { id: true, orderNumber: true, recipientName: true, totalAmount: true, status: true, createdAt: true },
		}),
	]);

	const counts = countsRows[0];

	// Điền đủ các ngày (ngày không có đơn => 0) để biểu đồ liền mạch.
	const dailyByKey = new Map(dailyRows.map((row) => [row.day, row]));
	let revenueSum = 0;
	let orderCount = 0;

	const revenueByDay = Array.from({ length: days }, (_, index) => {
		const date = new Date(trendStart.getTime() + index * 24 * 60 * 60 * 1000);
		const key = toDayKey(date);
		const row = dailyByKey.get(key);
		const amount = row?.amount ?? 0;
		revenueSum += amount;
		orderCount += row?.orders ?? 0;

		const [, month, day] = key.split("-");
		return { label: `${day}/${month}`, amount };
	});

	const statusCountByStatus = new Map(statusCounts.map((row) => [row.status, row._count]));
	const statusBreakdown = ORDER_STATUSES.map((status) => ({ status, count: statusCountByStatus.get(status) ?? 0 }));
	const totalOrders = statusBreakdown.reduce((sum, item) => sum + item.count, 0);

	const totalRevenue = String(Math.round(revenueSum));
	const averageOrderValue = orderCount > 0 ? String(Math.round(revenueSum / orderCount)) : "0";

	return {
		days,
		totalOrders,
		ordersToday: counts.ordersToday,
		activeProducts: counts.activeProducts,
		activeCategories: counts.activeCategories,
		activeVariants: counts.activeVariants,
		activeCoupons: counts.activeCoupons,
		lowStockVariants: counts.lowStockVariants,
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
