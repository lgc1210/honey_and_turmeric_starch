import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),

	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

	NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

	// Ký session cookie của admin (HMAC). Bắt buộc phải cấu hình ở production.
	ADMIN_SESSION_SECRET: z.string().min(32).optional(),
	// Mã hoá AES-GCM cho TOTP secret lưu trong AdminTwoFactorSettings (mục 11 AGENTS.md).
	// Yêu cầu chuỗi hex 64 ký tự (32 byte) để dùng trực tiếp làm khoá AES-256.
	ADMIN_TWO_FACTOR_ENCRYPTION_KEY: z
		.string()
		.regex(/^[0-9a-f]{64}$/i)
		.optional(),

	// API tỉnh/thành Việt Nam (dùng cho chọn địa chỉ giao hàng lúc checkout).
	PROVINCES_BASE_URL: z.url().default("https://provinces.open-api.vn/api"),

	// Mã hoá AES-GCM cho cookie cart_id (mục 5.4/11 AGENTS.md) — chuỗi hex 64 ký tự (32 byte).
	CART_COOKIE_ENCRYPTION_KEY: z
		.string()
		.regex(/^[0-9a-f]{64}$/i)
		.optional(),
});

export const env = envSchema.parse(process.env);

/**
 * Đọc một secret bắt buộc phải có giá trị thật ở production, nhưng cho phép
 * fallback ở development để không chặn local dev khi chưa cấu hình .env.
 * Không log giá trị secret (xem AGENTS.md mục 17).
 */
export function requireSecret(value: string | undefined, name: string, devFallback: string): string {
	if (value) return value;
	if (env.NODE_ENV === "production") {
		throw new Error(`${name} must be configured in production`);
	}
	return devFallback;
}
