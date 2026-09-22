import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { env, requireSecret } from "@/lib/env";
import { CART_COOKIE_NAME, CART_TTL_DAYS } from "@/config/site";

const AES_ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
	const hex = requireSecret(env.CART_COOKIE_ENCRYPTION_KEY, "CART_COOKIE_ENCRYPTION_KEY", "1".repeat(64));
	return Buffer.from(hex, "hex");
}

function encrypt(plain: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv(AES_ALGORITHM, encryptionKey(), iv);
	const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":");
}

function decrypt(encoded: string): string | null {
	const [ivHex, authTagHex, ciphertextHex] = encoded.split(":");
	if (!ivHex || !authTagHex || !ciphertextHex) return null;

	try {
		const decipher = createDecipheriv(AES_ALGORITHM, encryptionKey(), Buffer.from(ivHex, "hex"));
		decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
		const plain = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, "hex")), decipher.final()]);
		return plain.toString("utf8");
	} catch {
		return null; // cookie bị giả mạo/hỏng — coi như không có giỏ hàng, sẽ tạo giỏ mới
	}
}

export async function readCartIdCookie(): Promise<string | null> {
	const value = (await cookies()).get(CART_COOKIE_NAME)?.value;
	return value ? decrypt(value) : null;
}

export async function writeCartIdCookie(cartId: string): Promise<void> {
	(await cookies()).set(CART_COOKIE_NAME, encrypt(cartId), {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * CART_TTL_DAYS,
	});
}

export function generateCartId(): string {
	return randomUUID();
}
