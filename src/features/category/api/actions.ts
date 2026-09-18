"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import { getCurrentAdmin } from "@/features/auth/api/session";
import {
	createCategorySchema,
	deleteCategorySchema,
	updateCategorySchema,
	updateCategoryStatusSchema,
} from "../schema";
import { createCategory, deleteCategory, updateCategory, updateCategoryStatus } from "./service";
import paths from "@/config/path";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

export async function createCategoryAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(createCategorySchema, input, async (data) => {
		const category = await createCategory(data);
		revalidatePath(paths.admin.categories);
		return category;
	});
}

export async function updateCategoryAction(input: unknown): Promise<ActionResult<unknown>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateCategorySchema, input, async (data) => {
		const category = await updateCategory(data);
		revalidatePath(paths.admin.categories);
		return category;
	});
}

export async function updateCategoryStatusAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(updateCategoryStatusSchema, input, async ({ id, status }) => {
		await updateCategoryStatus(BigInt(id), status);
		revalidatePath(paths.admin.categories);
		return undefined;
	});
}

export async function deleteCategoryAction(input: unknown): Promise<ActionResult<undefined>> {
	if (!(await getCurrentAdmin())) return notAuthenticatedError;

	return handleAction(deleteCategorySchema, input, async ({ id }) => {
		await deleteCategory(BigInt(id));
		revalidatePath(paths.admin.categories);
		return undefined;
	});
}
