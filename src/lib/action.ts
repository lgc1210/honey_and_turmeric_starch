import { z } from "zod";
import type { ActionResult } from "@/types/common";

export async function handleAction<TSchema extends z.ZodType, TResult>(
	schema: TSchema,
	input: unknown,
	handler: (data: z.infer<TSchema>) => Promise<TResult>,
): Promise<ActionResult<TResult>> {
	const parsed = schema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: "Dữ liệu không hợp lệ",
			fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
		};
	}

	try {
		const data = await handler(parsed.data);
		return { success: true, data };
	} catch (error) {
		// Chỉ log message (string), KHÔNG log thẳng object Error: Next.js dev server
		// tự động "enhance" console.error khi thấy Error object bằng cách vẽ code
		// frame nguồn qua next-code-frame — crate này có bug panic khi dòng nguồn
		// lân cận chứa ký tự tiếng Việt đa byte (VD: 'ý', 'ộ'...) rơi đúng vào một
		// byte offset giữa ký tự. Log string thường để tránh kích hoạt cơ chế đó.
		console.error("[Action Error]", error instanceof Error ? error.message : error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
		};
	}
}
