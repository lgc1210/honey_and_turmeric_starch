import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/features/auth/api/session";
import { getAdminAccountProfile } from "@/features/auth/api/service";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { TwoFactorPanel } from "@/features/auth/components/two-factor-panel";

export default async function AccountsPage() {
	const admin = await requireAdmin();
	const profile = await getAdminAccountProfile(admin.id);

	return (
		<AdminShell>
			<h1 className="mb-6 font-serif text-2xl font-semibold text-foreground">Tài khoản quản trị</h1>

			<div className="space-y-8">
				<section className="border border-border p-4">
					<h2 className="mb-3 font-semibold text-foreground">Thông tin</h2>
					<p className="text-sm text-muted-foreground">Email: {profile.email}</p>
					<p className="text-sm text-muted-foreground">
						Đăng nhập gần nhất:{" "}
						{profile.recentlyLoginAt ? new Date(profile.recentlyLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập"}
					</p>
					{profile.recentlyLoginDevice && (
						<p className="max-w-md truncate text-xs text-muted-foreground">Thiết bị: {profile.recentlyLoginDevice}</p>
					)}
				</section>

				<section className="border border-border p-4">
					<h2 className="mb-3 font-semibold text-foreground">Xác thực hai lớp (2FA)</h2>
					<TwoFactorPanel isEnabled={profile.isTwoFactorEnabled} />
				</section>

				<section className="border border-border p-4">
					<h2 className="mb-3 font-semibold text-foreground">Đổi mật khẩu</h2>
					<ChangePasswordForm />
				</section>
			</div>
		</AdminShell>
	);
}
