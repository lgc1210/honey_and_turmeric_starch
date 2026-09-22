import { z } from "zod";
import { EntityStatus } from "@/generated/prisma/enums";

export const EntityStatusEnum = z.enum(EntityStatus);

export const productOptionValueSchema = z.object({
	value: z.string().min(1, "Giá trị không được để trống").max(100),
});

export const productOptionSchema = z.object({
	name: z.string().min(1, "Tên thuộc tính không được để trống").max(50),
	values: z.array(productOptionValueSchema).min(1, "Cần ít nhất một giá trị"),
});

export const productVariantSchema = z.object({
	sku: z
		.string()
		.min(1, "SKU không được để trống")
		.max(100)
		.regex(/^[A-Z0-9-_]+$/i, "SKU chỉ gồm chữ, số, dấu - và _"),
	name: z.string().max(255).optional(),
	price: z.coerce.number().positive("Giá phải lớn hơn 0").max(999_999_999_999_9),
	oldPrice: z.coerce.number().positive().optional().nullable(),
	stockQuantity: z.coerce.number().int("Số lượng phải là số nguyên").min(0, "Số lượng không được âm").default(0),
	status: EntityStatusEnum.default("Active"),
	optionValueIds: z.array(z.coerce.number()).default([]),
});

export const createProductSchema = z.object({
	categoryId: z.coerce.number({ message: "Vui lòng chọn danh mục" }),
	name: z.string().min(1, "Tên sản phẩm không được để trống").max(255),
	slug: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	status: EntityStatusEnum.default("Active"),
	options: z.array(productOptionSchema).default([]),
	variants: z.array(productVariantSchema).min(1, "Cần ít nhất một biến thể"),
});

export const updateProductSchema = createProductSchema.partial().extend({
	id: z.coerce.number(),
});

export const productQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(12),
	search: z.string().optional(),
	categoryId: z.coerce.number().optional(),
	status: EntityStatusEnum.optional(),
	sortBy: z.enum(["createdAt", "name", "price"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const productStatusSchema = z.object({
	id: z.coerce.number(),
	status: EntityStatusEnum,
});

export const deleteProductSchema = z.object({
	id: z.coerce.number(),
});

export const createVariantSchema = z.object({
	productId: z.coerce.number(),
	sku: productVariantSchema.shape.sku,
	name: productVariantSchema.shape.name,
	price: productVariantSchema.shape.price,
	oldPrice: productVariantSchema.shape.oldPrice,
	stockQuantity: productVariantSchema.shape.stockQuantity,
	optionValueIds: productVariantSchema.shape.optionValueIds,
});

export const updateVariantSchema = createVariantSchema.extend({
	id: z.coerce.number(),
});

export const variantStatusSchema = z.object({
	id: z.coerce.number(),
	status: EntityStatusEnum,
});

export const deleteVariantSchema = z.object({
	id: z.coerce.number(),
});

export const productImageSchema = z.object({
	id: z.coerce.number().optional(),
	productVariantId: z.coerce.number(),
	url: z.string().min(1).max(500),
	altText: z.string().max(255).optional(),
	sortOrder: z.coerce.number().int().min(0).default(0),
	isPrimary: z.boolean().default(false),
});

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadProductImageSchema = z.object({
	productVariantId: z.coerce.number(),
	file: z
		.instanceof(File, { message: "Vui lòng chọn ảnh" })
		.refine((file) => file.size > 0, "Vui lòng chọn ảnh")
		.refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, "Ảnh tối đa 5MB")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF"),
	altText: z.string().max(255).optional(),
	sortOrder: z.coerce.number().int().min(0).default(0),
	isPrimary: z.boolean().default(false),
});

export const setPrimaryImageSchema = z.object({
	id: z.coerce.number(),
});

export const deleteImageSchema = z.object({
	id: z.coerce.number(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type UploadProductImageInput = z.infer<typeof uploadProductImageSchema>;

// ===== Public (customer-facing) =====

export const publicProductQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(12),
	search: z.string().trim().min(1).optional(),
	categoryId: z.coerce.number().optional(),
	sortBy: z.enum(["newest", "priceAsc", "priceDesc"]).default("newest"),
});

export type PublicProductQuery = z.infer<typeof publicProductQuerySchema>;
