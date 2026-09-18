import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import type { CouponInput } from "../schema";

export async function getAdminCoupons() {
	const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
	return serialize(coupons);
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

export async function updateCouponStatus(id: bigint, status: "Active" | "InActive") {
	const coupon = await prisma.coupon.update({ where: { id }, data: { status } });
	return serialize(coupon);
}
