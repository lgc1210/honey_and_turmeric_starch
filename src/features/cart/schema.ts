import { z } from "zod";

export const addToCartSchema = z.object({
	productVariantId: z.coerce.number(),
	quantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1").max(999),
});

export const updateCartItemSchema = z.object({
	cartItemId: z.coerce.number(),
	quantity: z.coerce.number().int().min(1).max(999),
});

export const removeCartItemSchema = z.object({
	cartItemId: z.coerce.number(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
