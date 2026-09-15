"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { EntityStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { handleAction } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/common";
import { establishAdminSession, getCurrentAdmin, verifyPassword, clearAdminSession } from "./auth";
import { adminLoginSchema, categorySchema, orderStatusSchema, productSchema } from "../schema";

const serialize = (value: unknown): unknown => {
	if (typeof value === "bigint") return value.toString();
	if (value instanceof Prisma.Decimal) return value.toString();
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(serialize);
	if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
	return value;
};

export async function loginAction(input: unknown): Promise<ActionResult<{ email: string }>> {
	return handleAction(adminLoginSchema, input, async ({ email, password, remember }) => {
		const admin = await prisma.admin.findUnique({ where: { email } });
		if (!admin || !verifyPassword(password, admin.passwordHash)) throw new Error("Email hoặc mật khẩu không đúng");
		await establishAdminSession(admin.id, remember);
		await prisma.admin.update({ where: { id: admin.id }, data: { recentlyLoginAt: new Date() } });
		return { email: admin.email };
	});
}

export async function logoutAction() {
	await clearAdminSession();
	revalidatePath("/admin");
}

export async function createCategoryAction(input: unknown) {
	const admin = await getCurrentAdmin();
	if (!admin) return { success: false, error: "Bạn chưa đăng nhập" } as const;
	return handleAction(categorySchema, input, async (data) => {
		const category = await prisma.category.create({ data: { name: data.name, slug: data.slug, description: data.description, parentId: data.parentId ? BigInt(data.parentId) : null } });
		revalidatePath("/admin/categories");
		return serialize(category) as { id: string };
	});
}

export async function updateCategoryStatusAction(input: unknown) {
	const admin = await getCurrentAdmin();
	if (!admin) return { success: false, error: "Bạn chưa đăng nhập" } as const;
	const parsed = zStatus.safeParse(input);
	if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ" } as const;
	await prisma.category.update({ where: { id: BigInt(parsed.data.id) }, data: { status: parsed.data.status } });
	revalidatePath("/admin/categories");
	return { success: true, data: undefined } as const;
}

const zId = z.string().regex(/^\d+$/);
const zStatus = z.object({ id: zId, status: z.enum([EntityStatus.Active, EntityStatus.InActive]) });

export async function createProductAction(input: unknown) {
	const admin = await getCurrentAdmin();
	if (!admin) return { success: false, error: "Bạn chưa đăng nhập" } as const;
	return handleAction(productSchema, input, async (data) => {
		const product = await prisma.$transaction(async (tx) => {
			const created = await tx.product.create({ data: { categoryId: BigInt(data.categoryId), name: data.name, slug: data.slug, description: data.description } });
			const optionIds = new Map<string, bigint>();
			for (const option of data.options) {
				const createdOption = await tx.productOption.create({ data: { productId: created.id, name: option.name } });
				for (const value of option.values) {
					const createdValue = await tx.productOptionValue.create({ data: { optionId: createdOption.id, value, normalizedValue: value.trim().toLowerCase() } });
					optionIds.set(value, createdValue.id);
				}
			}
			for (const variant of data.variants) {
				const createdVariant = await tx.productVariant.create({ data: { productId: created.id, sku: variant.sku, name: variant.name, price: variant.price, oldPrice: variant.oldPrice, stockQuantity: variant.stockQuantity } });
				const ids = variant.optionValues.map((value) => optionIds.get(value)).filter((id): id is bigint => id !== undefined);
				if (ids.length) await tx.variantOptionValue.createMany({ data: ids.map((optionValueId) => ({ variantId: createdVariant.id, optionValueId })) });
			}
			return created;
		});
		revalidatePath("/admin/products");
		return serialize(product);
	});
}

export async function updateProductStatusAction(input: unknown) {
	const admin = await getCurrentAdmin();
	if (!admin) return { success: false, error: "Bạn chưa đăng nhập" } as const;
	const parsed = zStatus.safeParse(input);
	if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ" } as const;
	await prisma.product.update({ where: { id: BigInt(parsed.data.id) }, data: { status: parsed.data.status } });
	revalidatePath("/admin/products");
	return { success: true, data: undefined } as const;
}

export async function updateOrderStatusAction(input: unknown) {
	const admin = await getCurrentAdmin();
	if (!admin) return { success: false, error: "Bạn chưa đăng nhập" } as const;
	return handleAction(orderStatusSchema, input, async ({ orderId, status }) => {
		await prisma.order.update({ where: { id: BigInt(orderId) }, data: { status } });
		revalidatePath("/admin/orders");
		return undefined;
	});
}
