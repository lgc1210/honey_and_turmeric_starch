import type { Metadata } from "next";
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

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
	subsets: ["vietnamese", "latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Kim Bac Store",
	description: "Chuyên bán lẻ mật ong và tinh bột nghệ tự làm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang='vi' className={`${montserrat.className} h-full`}>
			<body className='min-h-full flex flex-col' suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
