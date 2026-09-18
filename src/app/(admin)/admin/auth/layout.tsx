import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Đăng nhập Admin",
	description: "Trang đăng nhập quản trị viên",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
	return <div className="min-h-svh bg-muted">{children}</div>;
}
