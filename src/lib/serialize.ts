import { Prisma } from "@/generated/prisma/client";

/**
 * Chuyển đổi dữ liệu trả về từ Prisma (BigInt, Decimal, Date) sang dạng
 * serialize được sang JSON trước khi trả về Client Component / Server Action.
 *
 * - BigInt -> string
 * - Prisma.Decimal -> string (giữ nguyên độ chính xác, tránh sai số floating-point)
 * - Date -> ISO string
 *
 * Không dùng JSON.stringify trực tiếp trên dữ liệu Prisma (xem AGENTS.md mục 4.5).
 */
export function serialize<T>(value: T): Serialized<T> {
	if (typeof value === "bigint") return value.toString() as Serialized<T>;
	if (value instanceof Prisma.Decimal) return value.toString() as Serialized<T>;
	if (value instanceof Date) return value.toISOString() as Serialized<T>;
	if (Array.isArray(value)) return value.map((item) => serialize(item)) as Serialized<T>;

	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, serialize(val)])) as Serialized<T>;
	}

	return value as Serialized<T>;
}

type Serialized<T> = T extends bigint
	? string
	: T extends Prisma.Decimal
		? string
		: T extends Date
			? string
			: T extends (infer U)[]
				? Serialized<U>[]
				: T extends object
					? { [K in keyof T]: Serialized<T[K]> }
					: T;
