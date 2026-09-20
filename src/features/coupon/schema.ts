import { z } from "zod";
import { DiscountType, EntityStatus } from "@/generated/prisma/enums";

export const DiscountTypeEnum = z.enum(DiscountType);

export const couponSchema = z
	.object({
		code: z
			.string()
			.min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
			.max(50)
			.regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ HOA, số, - và _"),
		discountType: DiscountTypeEnum,
		discountValue: z.coerce.number().positive("Giá trị phải lớn hơn 0"),
		minimumOrderAmount: z.coerce.number().min(0).optional().nullable(),
		usageLimit: z.coerce.number().int().positive().optional().nullable(),
		startsAt: z.coerce.date(),
		expiresAt: z.coerce.date(),
		status: z.enum(EntityStatus).default(EntityStatus.Active),
	})
	.refine((data) => data.expiresAt > data.startsAt, {
		message: "Ngày hết hạn phải sau ngày bắt đầu",
		path: ["expiresAt"],
	})
	.refine((data) => data.discountType !== "Percentage" || data.discountValue <= 100, {
		message: "Giảm theo phần trăm không được vượt quá 100",
		path: ["discountValue"],
	});

export type CouponInput = z.infer<typeof couponSchema>;

export const updateCouponSchema = z.object({ id: z.coerce.number() }).and(couponSchema);

export const couponStatusSchema = z.object({
	id: z.coerce.number(),
	status: z.enum(EntityStatus),
});

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const deleteCouponSchema = z.object({
	id: z.coerce.number(),
});

export const couponQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().trim().min(1).optional(),
	status: z.enum(EntityStatus).optional(),
});

export type CouponQuery = z.infer<typeof couponQuerySchema>;
