import { clsx, type ClassValue } from "clsx";
import { Prisma } from "@/generated/prisma/client";

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

/** Format tiền VNĐ: 150000 -> "150.000 ₫" */
export function formatCurrency(value: Prisma.Decimal | number | string) {
	const num = typeof value === "object" ? value.toNumber() : Number(value);

	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(num);
}

export function formatDate(date: Date | string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

/** Chuẩn hóa tiếng Việt có dấu -> slug: "Tinh bột nghệ" -> "tinh-bot-nghe" */
export function slugify(input: string) {
	return input
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

/** Dùng cho product_option_values.normalized_value */
export function normalizeOptionValue(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.toLowerCase()
		.trim()
		.replace(/\s+/g, " ");
}

/** Sinh gợi ý SKU từ tên biến thể: "Đỏ / Size M" -> "DO-SIZE-M" */
export function generateSkuFromName(name: string): string {
	return slugify(name).toUpperCase();
}

/** Định dạng Date thành giá trị dùng cho <input type="datetime-local"> (YYYY-MM-DDTHH:mm, theo giờ local). */
export function toDatetimeLocalValue(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Sinh order_number: "HT20260915-A3F9K2" */
export function generateOrderNumber() {
	const now = new Date();
	const datePart = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
	].join("");

	const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

	return `HT${datePart}-${randomPart}`;
}
