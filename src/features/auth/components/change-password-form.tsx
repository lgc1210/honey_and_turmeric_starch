"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema } from "../schema";
import { changePasswordAction } from "../api/actions";

export function ChangePasswordForm() {
	const [serverError, setServerError] = useState("");
	const [success, setSuccess] = useState(false);

	const form = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: "", newPassword: "" },
	});

	async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
		setServerError("");
		setSuccess(false);
		const result = await changePasswordAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		setSuccess(true);
		form.reset();
	}

	return (
		<form className="max-w-sm space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
			<div className="space-y-2">
				<Label htmlFor="current-password">Mật khẩu hiện tại</Label>
				<Input id="current-password" type="password" {...form.register("currentPassword")} />
				{form.formState.errors.currentPassword && (
					<p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="new-password">Mật khẩu mới</Label>
				<Input id="new-password" type="password" {...form.register("newPassword")} />
				{form.formState.errors.newPassword && (
					<p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
				)}
			</div>
			{serverError && <p className="text-sm text-destructive">{serverError}</p>}
			{success && <p className="text-sm text-primary">Đổi mật khẩu thành công</p>}
			<Button type="submit" disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}
			</Button>
		</form>
	);
}
