import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import { randomUUID } from "node:crypto";

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

/**
 * Lưu file ảnh lên Supabase Storage (bucket public).
 */
async function saveImageFile(file: File, bucketName: string): Promise<string> {
	const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg"; // lấy đuôi file
	const objectPath = `${randomUUID()}.${extension}`; // tạo tên file ngẫu nhiên để tránh trùng lặp

	console.log({
		supabaseUrl: env.PUBLIC_SUPABASE_URL,
		bucketName,
		objectPath,
	});

	const { error } = await supabase.storage.from(bucketName).upload(objectPath, file, {
		contentType: file.type,
		upsert: false,
	});

	if (error) throw new Error(`Tải ảnh lên thất bại: ${error.message}`);

	return supabase.storage.from(bucketName).getPublicUrl(objectPath).data.publicUrl;
}

/**
 * Xóa file ảnh khỏi Supabase Storage từ Public URL.
 */
async function deleteImageFile(url: string, bucketName: string): Promise<void> {
	try {
		// 1. Dùng đối tượng URL để tự động parse, tránh lỗi do protocol (http/https) hoặc domain thay đổi
		const parsedUrl = new URL(url);
		const pathName = parsedUrl.pathname; // Ví dụ: /storage/v1/object/public/avatars/uuid.jpg

		// 2. Định vị chính xác tiền tố chứa bucket
		const prefix = `/object/public/${bucketName}/`;

		// Tìm vị trí của prefix trong pathname
		const index = pathName.indexOf(prefix);
		if (index === -1) return; // Không khớp cấu trúc bucket -> Bỏ qua

		// 3. Trích xuất objectPath chính xác tuyệt đối
		const objectPath = pathName.slice(index + prefix.length);

		// 4. Thực hiện xóa file
		const { error } = await supabase.storage.from(bucketName).remove([objectPath]);

		if (error) {
			console.error(`Lỗi khi xóa file trên Supabase Storage: ${error.message}`);
		}
	} catch {
		// Bỏ qua nếu chuỗi url truyền vào không hợp lệ (không parse được new URL)
		return;
	}
}

export { saveImageFile, deleteImageFile };
