"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, backupCodeSchema, twoFactorVerifySchema } from "../schema";
import { loginAction, verifyBackupCodeAction, verifyTwoFactorAction } from "../api/actions";
import paths from "@/config/path";

type Step = "credentials" | "otp" | "backup-code";

export function LoginForm() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("credentials");
	const [remember, setRemember] = useState(false);
	const [serverError, setServerError] = useState("");

	const credentialsForm = useForm<z.input<typeof loginSchema>, unknown, z.output<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "", remember: false },
	});

	const otpForm = useForm<z.input<typeof twoFactorVerifySchema>, unknown, z.output<typeof twoFactorVerifySchema>>({
		resolver: zodResolver(twoFactorVerifySchema),
		defaultValues: { code: "", remember: false },
	});

	const backupForm = useForm<z.input<typeof backupCodeSchema>, unknown, z.output<typeof backupCodeSchema>>({
		resolver: zodResolver(backupCodeSchema),
		defaultValues: { code: "", remember: false },
	});

	async function onSubmitCredentials(values: z.infer<typeof loginSchema>) {
		setServerError("");
		const result = await loginAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		if (result.data.requiresTwoFactor) {
			setRemember(values.remember);
			setStep("otp");
			return;
		}
		router.push(paths.admin.dashboard);
		router.refresh();
	}

	async function onSubmitOtp(values: z.infer<typeof twoFactorVerifySchema>) {
		setServerError("");
		const result = await verifyTwoFactorAction({ ...values, remember });
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.push("/admin/dashboard");
		router.refresh();
	}

	async function onSubmitBackupCode(values: z.infer<typeof backupCodeSchema>) {
		setServerError("");
		const result = await verifyBackupCodeAction({ ...values, remember });
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.push("/admin/dashboard");
		router.refresh();
	}

	if (step === "otp" || step === "backup-code") {
		const form = step === "otp" ? otpForm : backupForm;
		const onSubmit = step === "otp" ? onSubmitOtp : onSubmitBackupCode;

		return (
			<form className='space-y-4' onSubmit={form.handleSubmit(onSubmit as never)}>
				<div className='space-y-2'>
					<Label htmlFor='code'>{step === "otp" ? "Mã xác thực (6 số)" : "Mã dự phòng"}</Label>
					<Input
						id='code'
						autoFocus
						placeholder={step === "otp" ? "123456" : "XXXXX-XXXXX"}
						{...form.register("code")}
					/>
					{form.formState.errors.code && (
						<p className='text-sm text-destructive'>{form.formState.errors.code.message}</p>
					)}
				</div>

				{serverError && <p className='text-sm text-destructive'>{serverError}</p>}

				<Button type='submit' className='w-full' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang xác thực..." : "Xác nhận"}
				</Button>

				<button
					type='button'
					className='w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline'
					onClick={() => {
						setServerError("");
						setStep(step === "otp" ? "backup-code" : "otp");
					}}>
					{step === "otp" ? "Dùng mã dự phòng thay thế" : "Dùng mã xác thực từ ứng dụng"}
				</button>
			</form>
		);
	}

	return (
		<form className='space-y-4' onSubmit={credentialsForm.handleSubmit(onSubmitCredentials)}>
			<div className='space-y-2'>
				<Label htmlFor='email'>Email</Label>
				<Input id='email' type='email' autoComplete='username' {...credentialsForm.register("email")} />
				{credentialsForm.formState.errors.email && (
					<p className='text-sm text-destructive'>{credentialsForm.formState.errors.email.message}</p>
				)}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='password'>Mật khẩu</Label>
				<Input
					id='password'
					type='password'
					autoComplete='current-password'
					{...credentialsForm.register("password")}
				/>
				{credentialsForm.formState.errors.password && (
					<p className='text-sm text-destructive'>{credentialsForm.formState.errors.password.message}</p>
				)}
			</div>

			<label className='flex items-center gap-2 text-sm text-muted-foreground'>
				<input type='checkbox' className='accent-primary' {...credentialsForm.register("remember")} />
				Ghi nhớ đăng nhập
			</label>

			{serverError && <p className='text-sm text-destructive'>{serverError}</p>}

			<Button type='submit' className='w-full' disabled={credentialsForm.formState.isSubmitting}>
				{credentialsForm.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
			</Button>
		</form>
	);
}
