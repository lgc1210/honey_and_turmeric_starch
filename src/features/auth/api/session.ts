import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { env, requireSecret } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import paths from "@/config/path";

const SESSION_COOKIE_NAME = "admin_session";
const PENDING_TWO_FACTOR_COOKIE_NAME = "admin_2fa_pending";
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PENDING_TWO_FACTOR_MAX_AGE_SECONDS = 60 * 5;

function sessionSecret(): string {
	return requireSecret(env.ADMIN_SESSION_SECRET, "ADMIN_SESSION_SECRET", "development-admin-session-secret");
}

function sign(value: string): string {
	return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
	const bufferA = Buffer.from(a, "hex");
	const bufferB = Buffer.from(b, "hex");
	return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

function buildToken(purpose: string, adminId: bigint): string {
	const value = `${purpose}:${adminId.toString()}`; // session:1
	return `${value}.${sign(value)}`; // session:1.
}

function parseToken(purpose: string, token: string): bigint | null {
	const separatorIndex = token.lastIndexOf(".");
	if (separatorIndex === -1) return null;

	const value = token.slice(0, separatorIndex);
	const signature = token.slice(separatorIndex + 1);
	if (!signature || !timingSafeStringEqual(sign(value), signature)) return null;

	const [tokenPurpose, id] = value.split(":");
	if (tokenPurpose !== purpose || !id || !/^\d+$/.test(id)) return null;
	return BigInt(id);
}

// ===== Password hashing (Argon2id — xem AGENTS.md mục 11.1) =====

export async function hashPassword(password: string): Promise<string> {
	return argon2Hash(password);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	try {
		return await argon2Verify(passwordHash, password);
	} catch {
		return false;
	}
}

// ===== Session cookie =====

export async function establishAdminSession(adminId: bigint, remember = false): Promise<void> {
	const jar = await cookies();
	jar.set(SESSION_COOKIE_NAME, buildToken("session", adminId), {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		...(remember ? { maxAge: REMEMBER_MAX_AGE_SECONDS } : {}),
	});
}

export async function clearAdminSession(): Promise<void> {
	(await cookies()).delete(SESSION_COOKIE_NAME);
}

/** Trả về admin hiện tại (đã đăng nhập đầy đủ, kể cả xác thực 2FA nếu bật) hoặc null. */
export async function getCurrentAdmin() {
	const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
	if (!value) return null;

	const adminId = parseToken("session", value);
	if (!adminId) return null;

	return prisma.admin.findUnique({
		where: { id: adminId },
		select: { id: true, email: true },
	});
}

/** Dùng ở đầu mọi Server Component/Server Action thuộc domain admin — redirect nếu chưa đăng nhập. */
export async function requireAdmin() {
	const admin = await getCurrentAdmin();
	if (!admin) redirect(paths.admin.auth);
	return admin;
}

// ===== Pending 2FA challenge =====
// Sau khi email/password đúng nhưng admin đã bật 2FA, chưa cấp admin_session
// đầy đủ ngay — chỉ cấp một cookie tạm, hết hạn nhanh, chỉ dùng để hoàn tất
// bước xác thực OTP/backup code (verifyTwoFactorAction / verifyBackupCodeAction).

export async function establishPendingTwoFactorChallenge(adminId: bigint): Promise<void> {
	const jar = await cookies();
	jar.set(PENDING_TWO_FACTOR_COOKIE_NAME, buildToken("2fa-pending", adminId), {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: PENDING_TWO_FACTOR_MAX_AGE_SECONDS,
	});
}

export async function getPendingTwoFactorAdminId(): Promise<bigint | null> {
	const value = (await cookies()).get(PENDING_TWO_FACTOR_COOKIE_NAME)?.value;
	if (!value) return null;
	return parseToken("2fa-pending", value);
}

export async function clearPendingTwoFactorChallenge(): Promise<void> {
	(await cookies()).delete(PENDING_TWO_FACTOR_COOKIE_NAME);
}
