"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { updateCouponStatusAction } from "../api/actions";

type CouponRow = {
	id: string;
	code: string;
	discountType: "Fixed" | "Percentage";
	discountValue: string;
	usedCount: number;
	usageLimit: number | null;
	startsAt: string;
	expiresAt: string;
	status: "Active" | "InActive";
};

export function CouponTable({ coupons }: { coupons: CouponRow[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);

	async function toggleStatus(coupon: CouponRow) {
		setPendingId(coupon.id);
		await updateCouponStatusAction({ id: coupon.id, status: coupon.status === "Active" ? "InActive" : "Active" });
		setPendingId(null);
		router.refresh();
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Mã</TableHead>
					<TableHead>Giảm</TableHead>
					<TableHead>Đã dùng / giới hạn</TableHead>
					<TableHead>Hiệu lực</TableHead>
					<TableHead>Trạng thái</TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{coupons.map((coupon) => (
					<TableRow key={coupon.id}>
						<TableCell className="font-semibold">{coupon.code}</TableCell>
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
						<TableCell>
							<Badge variant={coupon.status === "Active" ? "default" : "outline"}>
								{coupon.status === "Active" ? "Hoạt động" : "Ngừng"}
							</Badge>
						</TableCell>
						<TableCell>
							<Button variant="outline" size="sm" disabled={pendingId === coupon.id} onClick={() => toggleStatus(coupon)}>
								{coupon.status === "Active" ? "Ngừng" : "Kích hoạt"}
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
