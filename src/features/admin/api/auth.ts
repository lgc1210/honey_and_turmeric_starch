import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "admin_session";
function secret() {
	const configuredSecret = process.env.ADMIN_SESSION_SECRET;
	if (configuredSecret) return configuredSecret;
	if (process.env.NODE_ENV === "production") {
		throw new Error("ADMIN_SESSION_SECRET must be configured in production");
	}
	return "development-admin-session-secret";
}

export function hashPassword(password: string) {
	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(password, salt, 64).toString("hex");
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
	const [salt, expected] = encoded.split(":");
	if (!salt || !expected) return false;
	const actual = scryptSync(password, salt, 64);
	const expectedBuffer = Buffer.from(expected, "hex");
	return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

function sign(value: string) {
	return createHmac("sha256", secret()).update(value).digest("hex");
}

function signaturesMatch(actual: string, expected: string) {
	const actualBuffer = Buffer.from(actual, "hex");
	const expectedBuffer = Buffer.from(expected, "hex");
	return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function token(adminId: bigint) {
	const value = adminId.toString();
	return `${value}.${sign(value)}`;
}

export async function establishAdminSession(adminId: bigint, remember = false) {
	const jar = await cookies();
	jar.set(COOKIE_NAME, token(adminId), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
	});
}

export async function clearAdminSession() {
	(await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentAdmin() {
	const value = (await cookies()).get(COOKIE_NAME)?.value;
	if (!value) return null;
	const [id, signature] = value.split(".");
	if (!id || !signature || !/^\d+$/.test(id) || !signaturesMatch(sign(id), signature)) return null;
	return prisma.admin.findUnique({ where: { id: BigInt(id) }, select: { id: true, email: true } });
}

export async function requireAdmin() {
	const admin = await getCurrentAdmin();
	if (!admin) redirect("/admin/auth");
	return admin;
}
