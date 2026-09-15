import { z } from "zod";
import { DiscountType } from "@/generated/prisma/enums";

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
		status: z.enum(["Active", "InActive"]).default("Active"),
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
