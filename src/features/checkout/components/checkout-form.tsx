"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Province, Ward } from "@/features/order/api/provinces";
import { checkoutSchema } from "@/features/order/schema";
import { getProvincesAction, getWardsAction } from "@/features/order/api/provinces-actions";
import { checkoutAction } from "@/features/order/api/checkout-action";

export function CheckoutForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState("");
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [wards, setWards] = useState<Ward[]>([]);

	const form = useForm<z.input<typeof checkoutSchema>, unknown, z.output<typeof checkoutSchema>>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			recipientName: "",
			recipientEmail: "",
			recipientPhone: "",
			shippingProvince: "",
			shippingWard: "",
			shippingAddress: "",
			note: "",
			couponCode: "",
		},
	});

	useEffect(() => {
		getProvincesAction()
			.then((list) => setProvinces(list))
			.catch(() => setServerError("Không thể tải danh sách tỉnh/thành, vui lòng tải lại trang"));
	}, []);

	async function onProvinceChange(code: string) {
		const province = provinces.find((p) => String(p.code) === code);
		form.setValue("shippingProvince", province?.name ?? "");
		form.setValue("shippingWard", "");
		setWards([]);
		if (!province) return;

		try {
			setWards(await getWardsAction(province.code));
		} catch {
			setServerError("Không thể tải danh sách phường/xã");
		}
	}

	function onWardChange(code: string) {
		const ward = wards.find((w) => String(w.code) === code);
		form.setValue("shippingWard", ward?.name ?? "");
	}

	async function onSubmit(values: z.output<typeof checkoutSchema>) {
		setServerError("");
		const result = await checkoutAction(values);
		if (!result.success) {
			setServerError(result.error);
			return;
		}
		router.push(`/checkout/success?order=${result.data.orderNumber}`);
	}

	const selectClass =
		"h-9 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

	return (
		<form
			className='space-y-6'
			onSubmit={form.handleSubmit(onSubmit, (errors) => {
				console.log("Validation errors:", errors);
			})}>
			<section className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1'>
					<Label htmlFor='recipientName'>Họ và tên</Label>
					<Input id='recipientName' {...form.register("recipientName")} />
					{form.formState.errors.recipientName && (
						<p className='text-xs text-destructive'>{form.formState.errors.recipientName.message}</p>
					)}
				</div>
				<div className='space-y-1'>
					<Label htmlFor='recipientPhone'>Số điện thoại</Label>
					<Input id='recipientPhone' {...form.register("recipientPhone")} />
					{form.formState.errors.recipientPhone && (
						<p className='text-xs text-destructive'>{form.formState.errors.recipientPhone.message}</p>
					)}
				</div>
				<div className='space-y-1 sm:col-span-2'>
					<Label htmlFor='recipientEmail'>Email</Label>
					<Input id='recipientEmail' type='email' {...form.register("recipientEmail")} />
					{form.formState.errors.recipientEmail && (
						<p className='text-xs text-destructive'>{form.formState.errors.recipientEmail.message}</p>
					)}
				</div>
			</section>

			<section className='grid gap-4 sm:grid-cols-3'>
				<div className='space-y-1'>
					<Label htmlFor='province'>Tỉnh/Thành phố</Label>
					<select
						id='province'
						className={selectClass}
						onChange={(e) => onProvinceChange(e.target.value)}
						defaultValue=''>
						<option value='' disabled>
							{provinces.length ? "Chọn tỉnh/thành" : "Đang tải..."}
						</option>
						{provinces.map((p) => (
							<option key={p.code} value={p.code}>
								{p.name}
							</option>
						))}
					</select>
					{form.formState.errors.shippingProvince && (
						<p className='text-xs text-destructive'>{form.formState.errors.shippingProvince.message}</p>
					)}
				</div>
				<div className='space-y-1'>
					<Label htmlFor='ward'>Phường/Xã</Label>
					<select
						id='ward'
						className={selectClass}
						onChange={(e) => onWardChange(e.target.value)}
						disabled={wards.length === 0}
						defaultValue=''>
						<option value='' disabled>
							Chọn phường/xã
						</option>
						{wards.map((w) => (
							<option key={w.code} value={w.code}>
								{w.name}
							</option>
						))}
					</select>
					{form.formState.errors.shippingWard && (
						<p className='text-xs text-destructive'>{form.formState.errors.shippingWard.message}</p>
					)}
				</div>
			</section>

			<div className='space-y-1'>
				<Label htmlFor='shippingAddress'>Địa chỉ cụ thể</Label>
				<Input id='shippingAddress' placeholder='Số nhà, tên đường...' {...form.register("shippingAddress")} />
				{form.formState.errors.shippingAddress && (
					<p className='text-xs text-destructive'>{form.formState.errors.shippingAddress.message}</p>
				)}
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='space-y-1'>
					<Label htmlFor='couponCode'>Mã giảm giá (nếu có)</Label>
					<Input id='couponCode' {...form.register("couponCode")} />
				</div>
				<div className='space-y-1'>
					<Label htmlFor='note'>Ghi chú</Label>
					<Textarea id='note' rows={1} {...form.register("note")} />
				</div>
			</div>

			{serverError && <p className='text-sm text-destructive'>{serverError}</p>}

			<Button size='lg' type='submit' className='w-full' disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
			</Button>
		</form>
	);
}
