import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/ui/pagination";
import { getAdminCoupons } from "@/features/coupon/api/service";
import { couponQuerySchema } from "@/features/coupon/schema";
import { CouponFilters } from "@/features/coupon/components/coupon-filters";
import { CouponForm } from "@/features/coupon/components/coupon-form";
import { CouponTable } from "@/features/coupon/components/coupon-table";
import type { SearchParams } from "@/types/common";
import paths from "@/config/path";

export default async function CouponsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const rawParams = await searchParams;
	const query = couponQuerySchema.parse({
		page: rawParams.page,
		search: rawParams.search,
		status: rawParams.status,
	});

	const result = await getAdminCoupons(query);

	return (
		<AdminShell>
			<h1 className='mb-6 font-sans text-2xl font-bold text-foreground'>Mã giảm giá</h1>
			<CouponForm />
			<div className='mt-6'>
				<CouponFilters />
				<CouponTable
					coupons={result.items.map((c) => ({
						id: c.id,
						code: c.code,
						discountType: c.discountType,
						discountValue: c.discountValue,
						minimumOrderAmount: c.minimumOrderAmount,
						usedCount: c.usedCount,
						usageLimit: c.usageLimit,
						startsAt: c.startsAt,
						expiresAt: c.expiresAt,
						status: c.status,
					}))}
				/>
				<Pagination page={result.page} totalPages={result.totalPages} basePath={paths.admin.coupons} />
			</div>
		</AdminShell>
	);
}
