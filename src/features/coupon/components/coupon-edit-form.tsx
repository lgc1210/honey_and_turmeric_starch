"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDatetimeLocalValue } from "@/lib/utils";
import { updateCouponSchema } from "../schema";
import { updateCouponAction } from "../api/actions";
import { DiscountType, EntityStatus } from "@/generated/prisma/enums";

type EditableCoupon = {
	id: string;
	code: string;
	discountType: DiscountType;
	discountValue: string;
	minimumOrderAmount: string | null;
	usageLimit: number | null;
	startsAt: string;
	expiresAt: string;
	status: EntityStatus;
};

export function CouponEditForm({ coupon, onDone }: { coupon: EditableCoupon; onDone: () => void }) {
	const router = useRouter();
	const [serverError, setServerError] = useState("");

	const form = useForm<z.input<typeof updateCouponSchema>, unknown, z.output<typeof updateCouponSchema>>({
		resolver: zodResolver(updateCouponSchema),
		defaultValues: {
			id: Number(coupon.id),
			code: coupon.code,
			discountType: coupon.discountType,
			discountValue: Number(coupon.discountValue),
			minimumOrderAmount: coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : undefined,
			usageLimit: coupon.usageLimit ?? undefined,
			startsAt: new Date(coupon.startsAt),
			expiresAt: new Date(coupon.expiresAt),
			status: coupon.status,
		},
	});

	async function onSubmit(values: z.output<typeof updateCouponSchema>) {
		setServerError("");
		const result = await updateCouponAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.refresh();
		onDone();
	}

	return (
		<form
			className='grid gap-3 border border-primary/40 bg-muted/40 p-3 md:grid-cols-4'
			onSubmit={form.handleSubmit(onSubmit)}>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-code-${coupon.id}`}>Mã giảm giá</Label>
				<Input id={`edit-coupon-code-${coupon.id}`} {...form.register("code")} />
				{form.formState.errors.code && <p className='text-xs text-destructive'>{form.formState.errors.code.message}</p>}
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-type-${coupon.id}`}>Loại giảm</Label>
				<select
					id={`edit-coupon-type-${coupon.id}`}
					className='h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
					{...form.register("discountType")}>
					<option value='Percentage'>Phần trăm</option>
					<option value='Fixed'>Số tiền</option>
				</select>
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-value-${coupon.id}`}>Giá trị</Label>
				<Input id={`edit-coupon-value-${coupon.id}`} type='number' min={0} {...form.register("discountValue")} />
				{form.formState.errors.discountValue && (
					<p className='text-xs text-destructive'>{form.formState.errors.discountValue.message}</p>
				)}
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-min-${coupon.id}`}>Đơn tối thiểu</Label>
				<Input id={`edit-coupon-min-${coupon.id}`} type='number' min={0} {...form.register("minimumOrderAmount")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-limit-${coupon.id}`}>Giới hạn lượt dùng</Label>
				<Input id={`edit-coupon-limit-${coupon.id}`} type='number' min={1} {...form.register("usageLimit")} />
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-start-${coupon.id}`}>Bắt đầu</Label>
				<Controller
					control={form.control}
					name='startsAt'
					render={({ field }) => (
						<Input
							id={`edit-coupon-start-${coupon.id}`}
							type='datetime-local'
							value={field.value ? toDatetimeLocalValue(field.value as Date) : ""}
							onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
							onBlur={field.onBlur}
							ref={field.ref}
						/>
					)}
				/>
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-end-${coupon.id}`}>Hết hạn</Label>
				<Controller
					control={form.control}
					name='expiresAt'
					render={({ field }) => (
						<Input
							id={`edit-coupon-end-${coupon.id}`}
							type='datetime-local'
							value={field.value ? toDatetimeLocalValue(field.value as Date) : ""}
							onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
							onBlur={field.onBlur}
							ref={field.ref}
						/>
					)}
				/>
				{form.formState.errors.expiresAt && (
					<p className='text-xs text-destructive'>{form.formState.errors.expiresAt.message}</p>
				)}
			</div>
			<div className='space-y-1'>
				<Label htmlFor={`edit-coupon-status-${coupon.id}`}>Trạng thái</Label>
				<select
					id={`edit-coupon-status-${coupon.id}`}
					className='h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
					{...form.register("status")}>
					<option value={EntityStatus.Active}>Hoạt động</option>
					<option value={EntityStatus.InActive}>Ngừng</option>
				</select>
			</div>

			<div className='flex items-center gap-2 md:col-span-4'>
				{serverError && <p className='text-sm text-destructive'>{serverError}</p>}
				<Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
				</Button>
				<Button type='button' variant='outline' size='sm' onClick={onDone}>
					Huỷ
				</Button>
			</div>
		</form>
	);
}
