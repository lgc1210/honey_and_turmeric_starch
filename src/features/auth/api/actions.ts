"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/action";
import type { ActionResult } from "@/types/common";
import {
	backupCodeSchema,
	changePasswordSchema,
	disableTwoFactorSchema,
	enableTwoFactorSchema,
	loginSchema,
	twoFactorVerifySchema,
} from "../schema";
import { clearAdminSession, getCurrentAdmin } from "./session";
import {
	changeAdminPassword,
	disableTwoFactor,
	enableTwoFactor,
	loginAdmin,
	setupTwoFactor,
	verifyBackupCodeLogin,
	verifyTwoFactorLogin,
	type LoginResult,
} from "./service";
import paths from "@/config/path";

const notAuthenticatedError = { success: false, error: "Bạn chưa đăng nhập" } as const;

async function requireCurrentAdminId() {
	const admin = await getCurrentAdmin();
	if (!admin) return null;
	return admin.id;
}

export async function loginAction(input: unknown): Promise<ActionResult<LoginResult>> {
	return handleAction(loginSchema, input, (data) => loginAdmin(data));
}

export async function verifyTwoFactorAction(input: unknown): Promise<ActionResult<{ email: string }>> {
	return handleAction(twoFactorVerifySchema, input, ({ code, remember }) => verifyTwoFactorLogin(code, remember));
}

export async function verifyBackupCodeAction(input: unknown): Promise<ActionResult<{ email: string }>> {
	return handleAction(backupCodeSchema, input, ({ code, remember }) => verifyBackupCodeLogin(code, remember));
}

export async function logoutAction(): Promise<void> {
	await clearAdminSession();
	revalidatePath("/admin");
}

export async function setupTwoFactorAction(): Promise<ActionResult<{ otpauthUri: string; secret: string }>> {
	const adminId = await requireCurrentAdminId();
	if (!adminId) return notAuthenticatedError;

	try {
		const result = await setupTwoFactor(adminId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "Đã có lỗi xảy ra" };
	}
}

export async function enableTwoFactorAction(input: unknown): Promise<ActionResult<{ backupCodes: string[] }>> {
	const adminId = await requireCurrentAdminId();
	if (!adminId) return notAuthenticatedError;

	return handleAction(enableTwoFactorSchema, input, async ({ code }) => {
		const result = await enableTwoFactor(adminId, code);
		revalidatePath(paths.admin.accounts);
		return result;
	});
}

export async function disableTwoFactorAction(input: unknown): Promise<ActionResult<undefined>> {
	const adminId = await requireCurrentAdminId();
	if (!adminId) return notAuthenticatedError;

	return handleAction(disableTwoFactorSchema, input, async ({ password }) => {
		await disableTwoFactor(adminId, password);
		revalidatePath(paths.admin.accounts);
		return undefined;
	});
}

export async function changePasswordAction(input: unknown): Promise<ActionResult<undefined>> {
	const adminId = await requireCurrentAdminId();
	if (!adminId) return notAuthenticatedError;

	return handleAction(changePasswordSchema, input, async ({ currentPassword, newPassword }) => {
		await changeAdminPassword(adminId, currentPassword, newPassword);
		return undefined;
	});
}
