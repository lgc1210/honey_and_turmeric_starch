import { z } from "zod";
import { EntityStatus } from "@/generated/prisma/enums";

export const EntityStatusEnum = z.enum(EntityStatus);

export const createCategorySchema = z.object({
	name: z.string().trim().min(1, "Tên danh mục không được để trống").max(100),
	slug: z
		.string()
		.trim()
		.max(120)
		.regex(/^[a-z0-9-]*$/, "Slug chỉ gồm chữ thường, số và dấu -")
		.optional(),
	description: z.string().max(2000).optional(),
	parentId: z.coerce.number().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.extend({
	id: z.coerce.number(),
});

export const updateCategoryStatusSchema = z.object({
	id: z.coerce.number(),
	status: EntityStatusEnum,
});

export const deleteCategorySchema = z.object({
	id: z.coerce.number(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
