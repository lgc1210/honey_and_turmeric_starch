"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { couponSchema } from "../schema";
import { createCouponAction } from "../api/actions";

export function CouponForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof couponSchema>, unknown, z.output<typeof couponSchema>>({
		resolver: zodResolver(couponSchema),
		defaultValues: {
			code: "",
			discountType: "Percentage",
			discountValue: 0,
			status: "Active",
		},
	});

	async function onSubmit(values: z.infer<typeof couponSchema>) {
		setServerError("");
		const result = await createCouponAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.refresh();
	}

	return (
		<form className="grid gap-4 border-b border-border pb-6 md:grid-cols-4" onSubmit={form.handleSubmit(onSubmit)}>
			<div className="space-y-2">
				<Label htmlFor="coupon-code">Mã giảm giá</Label>
				<Input id="coupon-code" placeholder="SUMMER2026" {...form.register("code")} />
				{form.formState.errors.code && <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>}
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-type">Loại giảm</Label>
				<select
					id="coupon-type"
					className="h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					{...form.register("discountType")}>
					<option value="Percentage">Phần trăm</option>
					<option value="Fixed">Số tiền</option>
				</select>
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-value">Giá trị</Label>
				<Input id="coupon-value" type="number" min={0} {...form.register("discountValue")} />
				{form.formState.errors.discountValue && (
					<p className="text-sm text-destructive">{form.formState.errors.discountValue.message}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-min">Đơn tối thiểu</Label>
				<Input id="coupon-min" type="number" min={0} {...form.register("minimumOrderAmount")} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-limit">Giới hạn lượt dùng</Label>
				<Input id="coupon-limit" type="number" min={1} {...form.register("usageLimit")} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-start">Bắt đầu</Label>
				<Input id="coupon-start" type="datetime-local" {...form.register("startsAt")} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="coupon-end">Hết hạn</Label>
				<Input id="coupon-end" type="datetime-local" {...form.register("expiresAt")} />
				{form.formState.errors.expiresAt && (
					<p className="text-sm text-destructive">{form.formState.errors.expiresAt.message}</p>
				)}
			</div>
			<div className="md:col-span-4">
				{serverError && <p className="mb-2 text-sm text-destructive">{serverError}</p>}
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang tạo..." : "Thêm mã giảm giá"}
				</Button>
			</div>
		</form>
	);
}
