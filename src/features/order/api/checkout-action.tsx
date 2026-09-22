"use server";

import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { checkoutSchema } from "../schema";
import { createOrder } from "./service";
import { getOrCreateCartId } from "@/features/cart/api/service";

export async function checkoutAction(input: unknown): Promise<ActionResult<{ orderNumber: string }>> {
	return handleAction(checkoutSchema, input, async (data) => {
		const cartId = await getOrCreateCartId();
		const order = await createOrder(cartId, data);
		return { orderNumber: order.orderNumber };
	});
}
