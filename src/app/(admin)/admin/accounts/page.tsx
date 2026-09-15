import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/features/admin/api/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountsPage() {
	await requireAdmin();
	const admins = await prisma.admin.findMany({ select: { id: true, email: true, recentlyLoginAt: true, twoFactorSettings: { select: { isEnabled: true } } } });
	return <AdminShell title="Tài khoản quản trị" description="Tài khoản quản trị duy nhất và trạng thái bảo mật." activeHref="/admin/accounts"><div className="overflow-hidden rounded-2xl border"><table className="min-w-full text-left text-sm"><thead><tr className="bg-[#fffaf3]"><th className="p-3">Email</th><th className="p-3">2FA</th><th className="p-3">Đăng nhập gần nhất</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin.id.toString()} className="border-t"><td className="p-3 font-medium">{admin.email}</td><td className="p-3">{admin.twoFactorSettings?.isEnabled ? "Đã bật" : "Chưa bật"}</td><td className="p-3">{admin.recentlyLoginAt?.toLocaleString("vi-VN") ?? "Chưa đăng nhập"}</td></tr>)}</tbody></table></div></AdminShell>;
}
