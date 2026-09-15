import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Admin | Kim Bac Store",
	description: "Quản trị hệ thống Kim Bac Store",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
