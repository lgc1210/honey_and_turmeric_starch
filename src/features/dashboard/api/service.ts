import { prisma } from "@/lib/prisma";

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Completed", "Cancelled"] as const;

export async function getDashboardStats() {
	const [totalOrders, activeProducts, activeCategories, revenue, lowStockVariants, recentOrders, activeVariants, statusCounts] =
		await Promise.all([
			prisma.order.count(),
			prisma.product.count({ where: { status: "Active" } }),
			prisma.category.count({ where: { status: "Active" } }),
			prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "Cancelled" } } }),
			prisma.productVariant.count({ where: { stockQuantity: { lte: 5 }, status: "Active" } }),
			prisma.order.findMany({
				where: { status: { not: "Cancelled" } },
				select: { createdAt: true, totalAmount: true },
				orderBy: { createdAt: "desc" },
				take: 200,
			}),
			prisma.productVariant.count({ where: { status: "Active" } }),
			Promise.all(ORDER_STATUSES.map((status) => prisma.order.count({ where: { status } }))),
		]);

	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() - (6 - index));
		return date;
	});

	const revenueByDay = days.map((date) => {
		const next = new Date(date);
		next.setDate(next.getDate() + 1);
		const amount = recentOrders
			.filter((order) => order.createdAt >= date && order.createdAt < next)
			.reduce((sum, order) => sum + Number(order.totalAmount), 0);
		return { label: date.toLocaleDateString("vi-VN", { weekday: "short" }), amount };
	});

	const statusBreakdown = ORDER_STATUSES.map((status, index) => ({ status, count: statusCounts[index] }));

	return {
		totalOrders,
		activeProducts,
		activeCategories,
		activeVariants,
		lowStockVariants,
		totalRevenue: revenue._sum.totalAmount?.toString() ?? "0",
		revenueByDay,
		statusBreakdown,
	};
}
