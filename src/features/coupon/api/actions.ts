"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import { couponSchema, couponStatusSchema, deleteCouponSchema, updateCouponSchema } from "../schema";
import { createCoupon, deleteCoupon, updateCoupon, updateCouponStatus } from "./service";
import paths from "@/config/path";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

export async function createCouponAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(couponSchema, input, async (data) => {
		const coupon = await createCoupon(data);
		revalidatePath(paths.admin.coupons);
		return coupon;
	});
}

export async function updateCouponAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateCouponSchema, input, async ({ id, ...data }) => {
		const coupon = await updateCoupon(BigInt(id), data);
		revalidatePath(paths.admin.coupons);
		return coupon;
	});
}

export async function updateCouponStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(couponStatusSchema, input, async ({ id, status }) => {
		await updateCouponStatus(BigInt(id), status);
		revalidatePath(paths.admin.coupons);
		return undefined;
	});
}

export async function deleteCouponAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(deleteCouponSchema, input, async ({ id }) => {
		await deleteCoupon(BigInt(id));
		revalidatePath(paths.admin.coupons);
		return undefined;
	});
}
