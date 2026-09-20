"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityStatus } from "@/generated/prisma/enums";
import paths from "@/config/path";

export function CouponFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentStatus = searchParams.get("status") ?? "";

	const [search, setSearch] = useState(currentSearch);
	const [status, setStatus] = useState(currentStatus);

	const hasActiveFilters = currentSearch !== "" || currentStatus !== "";

	function applyParams(next: Record<string, string | undefined>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(next)) {
			if (value) params.set(key, value);
			else params.delete(key);
		}
		params.delete("page");
		router.push(`${paths.admin.coupons}/?${params.toString()}`);
	}

	const handleClear = () => {
		setSearch("");
		setStatus("");
		router.push(paths.admin.coupons);
	};

	return (
		<form
			className='mb-4 flex flex-wrap items-end gap-3'
			onSubmit={(e) => {
				e.preventDefault();
				applyParams({ search: search || undefined });
			}}>
			<div className='w-56'>
				<Input placeholder='Tìm theo mã giảm giá...' value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>

			<select
				className='h-9 border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				value={status}
				onChange={(e) => {
					const nextStatus = e.target.value;
					setStatus(nextStatus);
					applyParams({ status: e.target.value || undefined });
				}}>
				<option value=''>Tất cả trạng thái</option>
				<option value={EntityStatus.Active}>Hoạt động</option>
				<option value={EntityStatus.InActive}>Ngừng</option>
			</select>

			<Button type='submit' variant='outline' size='lg'>
				Tìm
			</Button>
			{hasActiveFilters && (
				<Button type='button' variant='ghost' size='lg' onClick={handleClear}>
					Xóa bộ lọc
				</Button>
			)}
		</form>
	);
}
