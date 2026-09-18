"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import { updateOrderStatusSchema } from "../schema";
import { updateOrderStatus } from "./service";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

export async function updateOrderStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateOrderStatusSchema, input, async ({ orderId, status }) => {
		await updateOrderStatus(BigInt(orderId), status);
		revalidatePath("/admin/orders");
		return undefined;
	});
}
