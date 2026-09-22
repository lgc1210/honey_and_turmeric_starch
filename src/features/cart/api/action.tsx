"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from "../schema";
import { addToCart, getOrCreateCartId, removeCartItem, updateCartItemQuantity } from "./service";

export async function addToCartAction(input: unknown): Promise<ActionResult<undefined>> {
	return handleAction(addToCartSchema, input, async (data) => {
		const cartId = await getOrCreateCartId();
		await addToCart(cartId, data);
		revalidatePath("/cart");
		revalidatePath("/", "layout");
		return undefined;
	});
}

export async function updateCartItemAction(input: unknown): Promise<ActionResult<undefined>> {
	return handleAction(updateCartItemSchema, input, async ({ cartItemId, quantity }) => {
		const cartId = await getOrCreateCartId();
		await updateCartItemQuantity(cartId, BigInt(cartItemId), quantity);
		revalidatePath("/cart");
		revalidatePath("/", "layout");
		return undefined;
	});
}

export async function removeCartItemAction(input: unknown): Promise<ActionResult<undefined>> {
	return handleAction(removeCartItemSchema, input, async ({ cartItemId }) => {
		const cartId = await getOrCreateCartId();
		await removeCartItem(cartId, BigInt(cartItemId));
		revalidatePath("/cart");
		revalidatePath("/", "layout");
		return undefined;
	});
}
