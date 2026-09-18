import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Email không hợp lệ"),
	password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
	remember: z.boolean().default(false),
});

export const twoFactorVerifySchema = z.object({
	code: z
		.string()
		.length(6, "Mã xác thực gồm 6 chữ số")
		.regex(/^\d{6}$/, "Mã chỉ gồm chữ số"),
	remember: z.boolean().default(false),
});

export const backupCodeSchema = z.object({
	code: z.string().min(1, "Vui lòng nhập mã dự phòng"),
	remember: z.boolean().default(false),
});

/** Xác nhận bật 2FA: cần nhập đúng 1 mã OTP từ app authenticator sau khi quét QR/secret. */
export const enableTwoFactorSchema = z.object({
	code: z
		.string()
		.length(6, "Mã xác thực gồm 6 chữ số")
		.regex(/^\d{6}$/, "Mã chỉ gồm chữ số"),
});

/** Tắt 2FA yêu cầu xác nhận lại mật khẩu — tránh việc chiếm phiên đăng nhập rồi tự tắt bảo mật. */
export const disableTwoFactorSchema = z.object({
	password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
	newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
