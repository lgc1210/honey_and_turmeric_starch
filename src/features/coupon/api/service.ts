import type { EntityStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { PAGINATION } from "@/config/site";
import type { CouponInput, CouponQuery } from "../schema";

export async function getAdminCoupons(query: CouponQuery) {
	const pageSize = query.pageSize || PAGINATION.ADMIN_PAGE_SIZE;

	const where: Prisma.CouponWhereInput = {
		...(query.search ? { code: { contains: query.search, mode: "insensitive" } } : {}),
		...(query.status ? { status: query.status } : {}),
	};

	const [items, total] = await Promise.all([
		prisma.coupon.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (query.page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.coupon.count({ where }),
	]);

	return {
		items: serialize(items),
		total,
		page: query.page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function createCoupon(input: CouponInput) {
	const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
	if (existing) throw new Error("Mã giảm giá đã tồn tại");

	const coupon = await prisma.coupon.create({ data: input });
	return serialize(coupon);
}

export async function updateCoupon(id: bigint, input: CouponInput) {
	const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
	if (existing && existing.id !== id) throw new Error("Mã giảm giá đã tồn tại");

	const coupon = await prisma.coupon.update({ where: { id }, data: input });
	return serialize(coupon);
}

export async function updateCouponStatus(id: bigint, status: EntityStatus) {
	const coupon = await prisma.coupon.update({ where: { id }, data: { status } });
	return serialize(coupon);
}

/** Xoá mã giảm giá — chặn nếu đã từng được áp dụng cho đơn hàng (lịch sử đơn hàng không được đụng tới). */
export async function deleteCoupon(id: bigint): Promise<void> {
	const usageCount = await prisma.couponUsage.count({ where: { couponId: id } });
	if (usageCount > 0) {
		throw new Error(
			"Không thể xoá mã giảm giá đã được sử dụng trong đơn hàng — hãy chuyển sang trạng thái Ngừng thay vì xoá",
		);
	}

	await prisma.coupon.delete({ where: { id } });
}
