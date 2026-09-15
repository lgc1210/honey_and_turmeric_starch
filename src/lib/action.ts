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
		console.error("[Action Error]", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
		};
	}
}
