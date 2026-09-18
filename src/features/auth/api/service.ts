import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
	clearPendingTwoFactorChallenge,
	establishAdminSession,
	establishPendingTwoFactorChallenge,
	getPendingTwoFactorAdminId,
	hashPassword,
	verifyPassword,
} from "./session";
import { consumeBackupCode, generateBackupCodes, generateTwoFactorSecret, verifyTotpCode } from "./two-factor";
import type { LoginInput } from "../schema";

export type LoginResult = { requiresTwoFactor: true } | { requiresTwoFactor: false; email: string };

async function recordLoginDevice(adminId: bigint) {
	const h = await headers();
	const agent = h.get("user-agent") ?? "Unknown device";
	const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();

	await prisma.admin.update({
		where: { id: adminId },
		data: {
			recentlyLoginAt: new Date(),
			recentlyLoginDevice: ip ? `${agent} (${ip})` : agent,
		},
	});
}

/** Bước 1: kiểm tra email/password. Nếu 2FA đang bật, chỉ cấp pending challenge, chưa cấp session đầy đủ. */
export async function loginAdmin(input: LoginInput): Promise<LoginResult> {
	const admin = await prisma.admin.findUnique({
		where: { email: input.email },
		include: { twoFactorSettings: true },
	});

	if (!admin || !(await verifyPassword(input.password, admin.passwordHash))) {
		throw new Error("Email hoặc mật khẩu không đúng");
	}

	if (admin.twoFactorSettings?.isEnabled) {
		await establishPendingTwoFactorChallenge(admin.id);
		return { requiresTwoFactor: true };
	}

	await establishAdminSession(admin.id, input.remember);
	await recordLoginDevice(admin.id);
	return { requiresTwoFactor: false, email: admin.email };
}

async function requirePendingTwoFactorAdmin() {
	const adminId = await getPendingTwoFactorAdminId();
	if (!adminId) throw new Error("Phiên xác thực đã hết hạn, vui lòng đăng nhập lại");

	const admin = await prisma.admin.findUnique({ where: { id: adminId }, include: { twoFactorSettings: true } });
	if (!admin?.twoFactorSettings?.isEnabled) throw new Error("Phiên xác thực đã hết hạn, vui lòng đăng nhập lại");

	return admin;
}

/** Bước 2 (mã OTP): hoàn tất đăng nhập nếu mã đúng. */
export async function verifyTwoFactorLogin(code: string, remember: boolean): Promise<{ email: string }> {
	const admin = await requirePendingTwoFactorAdmin();

	const secret = admin.twoFactorSettings!.twoFactorSecret;
	if (!secret || !(await verifyTotpCode(secret, code))) {
		throw new Error("Mã xác thực không đúng");
	}

	await clearPendingTwoFactorChallenge();
	await establishAdminSession(admin.id, remember);
	await recordLoginDevice(admin.id);
	return { email: admin.email };
}

/** Bước 2 (backup code): dùng khi admin mất quyền truy cập app authenticator. */
export async function verifyBackupCodeLogin(code: string, remember: boolean): Promise<{ email: string }> {
	const admin = await requirePendingTwoFactorAdmin();

	const remainingHashedCodes = await consumeBackupCode(admin.twoFactorSettings!.backupCodes, code);
	if (!remainingHashedCodes) throw new Error("Mã dự phòng không đúng hoặc đã được sử dụng");

	await prisma.adminTwoFactorSettings.update({
		where: { adminId: admin.id },
		data: { backupCodes: JSON.stringify(remainingHashedCodes) },
	});

	await clearPendingTwoFactorChallenge();
	await establishAdminSession(admin.id, remember);
	await recordLoginDevice(admin.id);
	return { email: admin.email };
}

/** Sinh secret + otpauth URI mới, lưu tạm ở trạng thái CHƯA bật (isEnabled vẫn false) chờ xác nhận OTP. */
export async function setupTwoFactor(adminId: bigint): Promise<{ otpauthUri: string; secret: string }> {
	const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
	const { secret, otpauthUri, encryptedSecret } = await generateTwoFactorSecret(admin.email);

	await prisma.adminTwoFactorSettings.upsert({
		where: { adminId },
		update: { twoFactorSecret: encryptedSecret, isEnabled: false, backupCodes: null },
		create: { adminId, twoFactorSecret: encryptedSecret, isEnabled: false },
	});

	return { otpauthUri, secret };
}

/** Xác nhận OTP hợp lệ với secret vừa setup -> chính thức bật 2FA, sinh backup codes. */
export async function enableTwoFactor(adminId: bigint, code: string): Promise<{ backupCodes: string[] }> {
	const settings = await prisma.adminTwoFactorSettings.findUnique({ where: { adminId } });
	if (!settings?.twoFactorSecret) throw new Error("Chưa khởi tạo 2FA, vui lòng thử lại từ đầu");
	if (!(await verifyTotpCode(settings.twoFactorSecret, code))) throw new Error("Mã xác thực không đúng");

	const { plainCodes, hashedCodesJson } = await generateBackupCodes();

	await prisma.adminTwoFactorSettings.update({
		where: { adminId },
		data: { isEnabled: true, backupCodes: hashedCodesJson },
	});

	return { backupCodes: plainCodes };
}

/** Tắt 2FA — yêu cầu xác nhận lại mật khẩu (không tin session hiện tại là đủ để tự hạ cấp bảo mật). */
export async function disableTwoFactor(adminId: bigint, password: string): Promise<void> {
	const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
	if (!(await verifyPassword(password, admin.passwordHash))) throw new Error("Mật khẩu không đúng");

	await prisma.adminTwoFactorSettings.update({
		where: { adminId },
		data: { isEnabled: false, twoFactorSecret: null, backupCodes: null },
	});
}

/** Đổi mật khẩu admin — yêu cầu xác nhận mật khẩu hiện tại. */
export async function changeAdminPassword(adminId: bigint, currentPassword: string, newPassword: string): Promise<void> {
	const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
	if (!(await verifyPassword(currentPassword, admin.passwordHash))) throw new Error("Mật khẩu hiện tại không đúng");

	await prisma.admin.update({
		where: { id: adminId },
		data: { passwordHash: await hashPassword(newPassword) },
	});
}

/** Thông tin tài khoản admin hiện tại + trạng thái 2FA — dùng cho trang /admin/accounts. */
export async function getAdminAccountProfile(adminId: bigint) {
	const admin = await prisma.admin.findUniqueOrThrow({
		where: { id: adminId },
		select: {
			email: true,
			recentlyLoginAt: true,
			recentlyLoginDevice: true,
			twoFactorSettings: { select: { isEnabled: true } },
		},
	});

	return {
		email: admin.email,
		recentlyLoginAt: admin.recentlyLoginAt?.toISOString() ?? null,
		recentlyLoginDevice: admin.recentlyLoginDevice,
		isTwoFactorEnabled: admin.twoFactorSettings?.isEnabled ?? false,
	};
}
