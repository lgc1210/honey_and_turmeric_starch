import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Email không hợp lệ"),
	password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const twoFactorVerifySchema = z.object({
	code: z
		.string()
		.length(6, "Mã xác thực gồm 6 chữ số")
		.regex(/^\d{6}$/, "Mã chỉ gồm chữ số"),
});

export const backupCodeSchema = z.object({
	code: z.string().min(1, "Vui lòng nhập mã dự phòng"),
});

export type LoginInput = z.infer<typeof loginSchema>;
