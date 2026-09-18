"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import {
	createProductSchema,
	createVariantSchema,
	productImageSchema,
	productStatusSchema,
	updateProductSchema,
	updateVariantSchema,
	variantStatusSchema,
} from "../schema";
import {
	createProduct,
	createVariant,
	deleteImage,
	updateProduct,
	updateProductStatus,
	updateVariant,
	updateVariantStatus,
	upsertImage,
} from "./service";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

export async function createProductAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(createProductSchema, input, async (data) => {
		const product = await createProduct(data);
		revalidatePath("/admin/products");
		return product;
	});
}

export async function updateProductAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateProductSchema, input, async (data) => {
		const product = await updateProduct(data);
		revalidatePath("/admin/products");
		revalidatePath(`/admin/products/${data.id}`);
		return product;
	});
}

export async function updateProductStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(productStatusSchema, input, async ({ id, status }) => {
		await updateProductStatus(BigInt(id), status);
		revalidatePath("/admin/products");
		return undefined;
	});
}

export async function createVariantAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(createVariantSchema, input, async (data) => {
		const variant = await createVariant(data);
		revalidatePath(`/admin/products/${data.productId}`);
		return variant;
	});
}

export async function updateVariantAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateVariantSchema, input, async (data) => {
		const variant = await updateVariant(data);
		revalidatePath(`/admin/products/${data.productId}`);
		return variant;
	});
}

export async function updateVariantStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(variantStatusSchema, input, async ({ id, status }) => {
		await updateVariantStatus(BigInt(id), status);
		revalidatePath("/admin/products");
		return undefined;
	});
}

export async function upsertImageAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(productImageSchema, input, async (data) => {
		const image = await upsertImage(data);
		revalidatePath("/admin/products");
		return image;
	});
}

export async function deleteImageAction(id: string): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;
	if (!/^\d+$/.test(id)) return { success: false, error: "Dữ liệu không hợp lệ" };

	await deleteImage(BigInt(id));
	revalidatePath("/admin/products");
	return { success: true, data: undefined };
}
