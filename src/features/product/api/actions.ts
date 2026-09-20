"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import {
	createProductSchema,
	createVariantSchema,
	deleteImageSchema,
	deleteProductSchema,
	deleteVariantSchema,
	productStatusSchema,
	setPrimaryImageSchema,
	updateProductSchema,
	updateVariantSchema,
	uploadProductImageSchema,
	variantStatusSchema,
} from "../schema";
import {
	createProduct,
	createVariant,
	deleteImage,
	deleteProduct,
	deleteVariant,
	setPrimaryImage,
	updateProduct,
	updateProductStatus,
	updateVariant,
	updateVariantStatus,
	uploadProductImage,
} from "./service";
import paths from "@/config/path";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

export async function createProductAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(createProductSchema, input, async (data) => {
		const product = await createProduct(data);
		revalidatePath(paths.admin.products);
		return product;
	});
}

export async function updateProductAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateProductSchema, input, async (data) => {
		const product = await updateProduct(data);
		revalidatePath(paths.admin.products);
		revalidatePath(`/admin/products/${data.id}`);
		return product;
	});
}

export async function updateProductStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(productStatusSchema, input, async ({ id, status }) => {
		await updateProductStatus(BigInt(id), status);
		revalidatePath(paths.admin.products);
		return undefined;
	});
}

export async function deleteProductAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(deleteProductSchema, input, async ({ id }) => {
		await deleteProduct(BigInt(id));
		revalidatePath(paths.admin.products);
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
		revalidatePath(paths.admin.products);
		return undefined;
	});
}

export async function deleteVariantAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(deleteVariantSchema, input, async ({ id }) => {
		await deleteVariant(BigInt(id));
		revalidatePath(paths.admin.products);
		return undefined;
	});
}

export async function uploadProductImageAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(uploadProductImageSchema, input, async (data) => {
		const image = await uploadProductImage(data);
		revalidatePath(paths.admin.products);
		return image;
	});
}

export async function setPrimaryImageAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(setPrimaryImageSchema, input, async ({ id }) => {
		await setPrimaryImage(BigInt(id));
		revalidatePath(paths.admin.products);
		return undefined;
	});
}

export async function deleteImageAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(deleteImageSchema, input, async ({ id }) => {
		await deleteImage(BigInt(id));
		revalidatePath(paths.admin.products);
		return undefined;
	});
}
