import { z } from "zod";

export const adminLoginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
	remember: z.boolean().default(false),
});

export const categorySchema = z.object({
	name: z.string().trim().min(1).max(100),
	slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
	description: z.string().optional(),
	parentId: z.string().optional(),
});

const variantSchema = z.object({
	sku: z.string().trim().min(1).max(100),
	name: z.string().trim().max(255).optional(),
	price: z.coerce.number().nonnegative(),
	oldPrice: z.coerce.number().nonnegative().optional(),
	stockQuantity: z.coerce.number().int().nonnegative(),
	optionValues: z.array(z.string()).default([]),
});

export const productSchema = z.object({
	categoryId: z.string().regex(/^\d+$/),
	name: z.string().trim().min(1).max(255),
	slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9-]+$/),
	description: z.string().optional(),
	options: z.array(z.object({ name: z.string().trim().min(1).max(50), values: z.array(z.string().trim().min(1).max(100)) })).default([]),
	variants: z.array(variantSchema).min(1),
});

export const orderStatusSchema = z.object({
	orderId: z.string().regex(/^\d+$/),
	status: z.enum(["Pending", "Confirmed", "Processing", "Completed", "Cancelled"]),
});
