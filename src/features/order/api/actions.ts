"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import { updateOrderStatusSchema, updatePaymentStatusSchema } from "../schema";
import { updateOrderStatus, updatePaymentStatus } from "./service";
import paths from "@/config/path";
import { notAuthenticatedError } from "@/config/common-errors";

export async function updateOrderStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateOrderStatusSchema, input, async ({ orderId, status }) => {
		await updateOrderStatus(BigInt(orderId), status);
		revalidatePath(paths.admin.orders);
		return undefined;
	});
}

export async function updatePaymentStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updatePaymentStatusSchema, input, async ({ paymentId, status }) => {
		await updatePaymentStatus(BigInt(paymentId), status);
		revalidatePath(paths.admin.orders);
		return undefined;
	});
}
