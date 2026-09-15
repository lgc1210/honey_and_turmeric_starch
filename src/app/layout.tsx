import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Thêm vào đầu file entry point
declare global {
	interface BigInt {
		toJSON(): string;
	}
}

BigInt.prototype.toJSON = function () {
	return this.toString();
};

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ["vietnamese"], // Bắt buộc phải có vietnamese để không lỗi dấu
	weight: ["400", "500", "600", "700"], // Chọn các độ đậm/nhạt bạn sẽ dùng
	variable: "--font-be-vietnam", // Tạo một biến CSS (nếu dùng Tailwind)
});

export const metadata: Metadata = {
	title: "Kim Bac Store",
	description: "Chuyên bán lẻ mật ong và tinh bột nghệ tự làm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang='vi' className={`${beVietnamPro.className} h-full`}>
			<body className='min-h-full flex flex-col'>{children}</body>
		</html>
	);
}
