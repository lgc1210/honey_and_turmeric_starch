"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { enableTwoFactorSchema, disableTwoFactorSchema } from "../schema";
import { disableTwoFactorAction, enableTwoFactorAction, setupTwoFactorAction } from "../api/actions";

export function TwoFactorPanel({ isEnabled }: { isEnabled: boolean }) {
	const router = useRouter();
	const [setupState, setSetupState] = useState<{ otpauthUri: string; secret: string } | null>(null);
	const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
	const [error, setError] = useState("");
	const [showDisableForm, setShowDisableForm] = useState(false);

	const enableForm = useForm<z.infer<typeof enableTwoFactorSchema>>({
		resolver: zodResolver(enableTwoFactorSchema),
		defaultValues: { code: "" },
	});

	const disableForm = useForm<z.infer<typeof disableTwoFactorSchema>>({
		resolver: zodResolver(disableTwoFactorSchema),
		defaultValues: { password: "" },
	});

	async function startSetup() {
		setError("");
		const result = await setupTwoFactorAction();
		if (!result.success) {
			setError(result.error);
			return;
		}
		setSetupState(result.data);
	}

	async function onEnable(values: z.infer<typeof enableTwoFactorSchema>) {
		setError("");
		const result = await enableTwoFactorAction(values);
		if (!result.success) {
			setError(result.error);
			return;
		}
		setBackupCodes(result.data.backupCodes);
		setSetupState(null);
	}

	async function onDisable(values: z.infer<typeof disableTwoFactorSchema>) {
		setError("");
		const result = await disableTwoFactorAction(values);
		if (!result.success) {
			setError(result.error);
			return;
		}
		setShowDisableForm(false);
		router.refresh();
	}

	if (backupCodes) {
		return (
			<div className="space-y-4">
				<p className="text-sm font-medium text-foreground">
					Đã bật 2FA. Lưu lại các mã dự phòng sau — mỗi mã chỉ dùng được một lần khi bạn mất quyền truy cập ứng
					dụng authenticator. Mã sẽ không hiển thị lại.
				</p>
				<div className="grid grid-cols-2 gap-2 border border-border bg-muted p-4 font-mono text-sm sm:grid-cols-4">
					{backupCodes.map((code) => (
						<span key={code}>{code}</span>
					))}
				</div>
				<Button onClick={() => { setBackupCodes(null); router.refresh(); }}>Đã lưu xong</Button>
			</div>
		);
	}

	if (setupState) {
		return (
			<form className="space-y-4" onSubmit={enableForm.handleSubmit(onEnable)}>
				<p className="text-sm text-muted-foreground">
					Quét mã dưới đây bằng Google Authenticator (hoặc ứng dụng TOTP tương thích), hoặc nhập thủ công secret
					key, sau đó nhập mã 6 số để xác nhận.
				</p>
				<div className="space-y-1 border border-border bg-muted p-3 font-mono text-xs break-all">
					{setupState.secret}
				</div>
				<div className="space-y-2">
					<Label htmlFor="enable-code">Mã xác thực</Label>
					<Input id="enable-code" autoFocus placeholder="123456" {...enableForm.register("code")} />
					{enableForm.formState.errors.code && (
						<p className="text-sm text-destructive">{enableForm.formState.errors.code.message}</p>
					)}
				</div>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<div className="flex gap-2">
					<Button type="submit" disabled={enableForm.formState.isSubmitting}>
						Xác nhận bật 2FA
					</Button>
					<Button type="button" variant="outline" onClick={() => setSetupState(null)}>
						Huỷ
					</Button>
				</div>
			</form>
		);
	}

	if (isEnabled) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Badge>Đã bật</Badge>
					<span className="text-sm text-muted-foreground">Xác thực 2 lớp đang bảo vệ tài khoản này.</span>
				</div>

				{!showDisableForm ? (
					<Button variant="destructive" onClick={() => setShowDisableForm(true)}>
						Tắt 2FA
					</Button>
				) : (
					<form className="space-y-3" onSubmit={disableForm.handleSubmit(onDisable)}>
						<div className="space-y-2">
							<Label htmlFor="disable-password">Xác nhận mật khẩu để tắt 2FA</Label>
							<Input id="disable-password" type="password" {...disableForm.register("password")} />
							{disableForm.formState.errors.password && (
								<p className="text-sm text-destructive">{disableForm.formState.errors.password.message}</p>
							)}
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<div className="flex gap-2">
							<Button type="submit" variant="destructive" disabled={disableForm.formState.isSubmitting}>
								Xác nhận tắt
							</Button>
							<Button type="button" variant="outline" onClick={() => setShowDisableForm(false)}>
								Huỷ
							</Button>
						</div>
					</form>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Badge variant="outline">Chưa bật</Badge>
				<span className="text-sm text-muted-foreground">Bật 2FA để tăng cường bảo mật cho tài khoản admin.</span>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button onClick={startSetup}>Bật xác thực 2 lớp</Button>
		</div>
	);
}
