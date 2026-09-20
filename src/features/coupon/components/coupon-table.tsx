"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { deleteCouponAction, updateCouponStatusAction } from "../api/actions";
import { CouponEditForm } from "./coupon-edit-form";
import { DiscountType, EntityStatus } from "@/generated/prisma/enums";

type CouponRow = {
	id: string;
	code: string;
	discountType: DiscountType;
	discountValue: string;
	minimumOrderAmount: string | null;
	usedCount: number;
	usageLimit: number | null;
	startsAt: string;
	expiresAt: string;
	status: EntityStatus;
};

export function CouponTable({ coupons }: { coupons: CouponRow[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deletingCoupon, setDeletingCoupon] = useState<CouponRow | null>(null);
	const [errorById, setErrorById] = useState<Record<string, string>>({});

	async function toggleStatus(coupon: CouponRow) {
		setPendingId(coupon.id);
		const result = await updateCouponStatusAction({
			id: coupon.id,
			status: coupon.status === EntityStatus.Active ? EntityStatus.InActive : EntityStatus.Active,
		});
		setPendingId(null);
		setErrorById((prev) => ({ ...prev, [coupon.id]: result.success ? "" : result.error }));
		router.refresh();
	}

	async function confirmDelete() {
		if (!deletingCoupon) return;
		const result = await deleteCouponAction({ id: deletingCoupon.id });
		setErrorById((prev) => ({ ...prev, [deletingCoupon.id]: result.success ? "" : result.error }));
		if (result.success) router.refresh();
	}

	if (coupons.length === 0) {
		return <p className='text-sm text-muted-foreground'>Không tìm thấy mã giảm giá nào.</p>;
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Mã</TableHead>
						<TableHead>Giảm</TableHead>
						<TableHead>Đã dùng / giới hạn</TableHead>
						<TableHead>Hiệu lực</TableHead>
						<TableHead className='text-center'>Trạng thái</TableHead>
						<TableHead className='text-center'>Hành động</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{coupons.map((coupon) =>
						editingId === coupon.id ? (
							<tr key={coupon.id}>
								<TableCell colSpan={6}>
									<CouponEditForm coupon={coupon} onDone={() => setEditingId(null)} />
								</TableCell>
							</tr>
						) : (
							<TableRow key={coupon.id}>
								<TableCell className='font-semibold'>
									{coupon.code}
									{errorById[coupon.id] && <p className='mt-1 text-xs text-destructive'>{errorById[coupon.id]}</p>}
								</TableCell>
								<TableCell>
									{coupon.discountValue}
									{coupon.discountType === "Percentage" ? "%" : " ₫"}
								</TableCell>
								<TableCell>
									{coupon.usedCount} / {coupon.usageLimit ?? "∞"}
								</TableCell>
								<TableCell>
									{formatDate(coupon.startsAt)} – {formatDate(coupon.expiresAt)}
								</TableCell>
								<TableCell className='h-full flex items-center justify-center'>
									<Badge variant={coupon.status === EntityStatus.Active ? "default" : "destructive"}>
										{coupon.status === EntityStatus.Active ? "Hoạt động" : "Ngừng"}
									</Badge>
								</TableCell>
								<TableCell className='mx-auto'>
									<div className='flex items-center justify-center gap-1'>
										<Button
											variant='outline'
											size='sm'
											disabled={pendingId === coupon.id}
											onClick={() => toggleStatus(coupon)}>
											{coupon.status === EntityStatus.Active ? "Ngừng" : "Kích hoạt"}
										</Button>
										<Button variant='outline' size='sm' onClick={() => setEditingId(coupon.id)}>
											Sửa
										</Button>
										<Button variant='destructive' size='sm' onClick={() => setDeletingCoupon(coupon)}>
											Xoá
										</Button>
									</div>
								</TableCell>
							</TableRow>
						),
					)}
				</TableBody>
			</Table>

			<ConfirmDialog
				open={deletingCoupon !== null}
				onOpenChange={(open) => !open && setDeletingCoupon(null)}
				title={`Xoá mã giảm giá "${deletingCoupon?.code}"?`}
				description='Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>
		</>
	);
}
