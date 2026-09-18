import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { generateSecret as generateTotpSecret, generateURI as generateTotpUri, verify as verifyTotp } from "otplib";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { env, requireSecret } from "@/lib/env";

const BACKUP_CODE_COUNT = 8;
const AES_ALGORITHM = "aes-256-gcm";

// Khoá AES-256 dùng để mã hoá TOTP secret khi lưu DB (AGENTS.md mục 11).
// Fallback dev chỉ 32 byte hex cố định — KHÔNG dùng ở production.
function encryptionKey(): Buffer {
	const hex = requireSecret(
		env.ADMIN_TWO_FACTOR_ENCRYPTION_KEY,
		"ADMIN_TWO_FACTOR_ENCRYPTION_KEY",
		"0".repeat(64),
	);
	return Buffer.from(hex, "hex");
}

/** Mã hoá một chuỗi bí mật (TOTP secret) bằng AES-256-GCM. Kết quả: iv:authTag:ciphertext (hex). */
function encryptSecret(plain: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv(AES_ALGORITHM, encryptionKey(), iv);
	const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":");
}

function decryptSecret(encoded: string): string {
	const [ivHex, authTagHex, ciphertextHex] = encoded.split(":");
	if (!ivHex || !authTagHex || !ciphertextHex) throw new Error("TOTP secret bị hỏng");

	const decipher = createDecipheriv(AES_ALGORITHM, encryptionKey(), Buffer.from(ivHex, "hex"));
	decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
	const plain = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, "hex")), decipher.final()]);
	return plain.toString("utf8");
}

/** Sinh secret mới (chưa mã hoá) và otpauth URI để admin quét bằng Google Authenticator. */
export async function generateTwoFactorSecret(email: string) {
	const secret = await generateTotpSecret();
	const otpauthUri = generateTotpUri({ issuer: "Kim Bac Store Admin", label: email, secret });
	return { secret, otpauthUri, encryptedSecret: encryptSecret(secret) };
}

export async function verifyTotpCode(encryptedSecret: string, code: string): Promise<boolean> {
	if (!/^\d{6}$/.test(code)) return false;
	try {
		const result = await verifyTotp({ token: code, secret: decryptSecret(encryptedSecret) });
		return result.valid;
	} catch {
		return false;
	}
}


/** Sinh {BACKUP_CODE_COUNT} mã dự phòng dạng "XXXX-XXXX" (đọc được), trả về cả bản rõ (hiển thị 1 lần) và bản hash (lưu DB). */
export async function generateBackupCodes() {
	const plainCodes: string[] = [];

	for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
		const raw = randomBytes(5).toString("hex").toUpperCase();
		plainCodes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
	}

	const hashedCodes = await Promise.all(plainCodes.map((code) => argon2Hash(code)));
	return { plainCodes, hashedCodesJson: JSON.stringify(hashedCodes) };
}

/**
 * Kiểm tra một backup code, trả về danh sách hash còn lại (đã dùng thì bị loại bỏ —
 * backup code chỉ dùng được một lần) hoặc null nếu không khớp mã nào.
 */
export async function consumeBackupCode(hashedCodesJson: string | null, inputCode: string): Promise<string[] | null> {
	if (!hashedCodesJson) return null;

	let hashedCodes: string[];
	try {
		hashedCodes = JSON.parse(hashedCodesJson);
	} catch {
		return null;
	}

	for (let i = 0; i < hashedCodes.length; i++) {
		const matches = await argon2Verify(hashedCodes[i], inputCode).catch(() => false);
		if (matches) return hashedCodes.filter((_, index) => index !== i);
	}

	return null;
}
