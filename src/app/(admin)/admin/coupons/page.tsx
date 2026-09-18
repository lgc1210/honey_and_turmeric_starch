import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminCoupons } from "@/features/coupon/api/service";
import { CouponForm } from "@/features/coupon/components/coupon-form";
import { CouponTable } from "@/features/coupon/components/coupon-table";

export default async function CouponsPage() {
	const coupons = await getAdminCoupons();

	return (
		<AdminShell>
			<h1 className='mb-6 font-serif text-2xl font-semibold text-foreground'>Mã giảm giá</h1>
			<CouponForm />
			<div className='mt-6'>
				<CouponTable
					coupons={coupons.map((c) => ({
						id: c.id,
						code: c.code,
						discountType: c.discountType,
						discountValue: c.discountValue,
						usedCount: c.usedCount,
						usageLimit: c.usageLimit,
						startsAt: c.startsAt,
						expiresAt: c.expiresAt,
						status: c.status,
					}))}
				/>
			</div>
		</AdminShell>
	);
}
