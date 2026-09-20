"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import paths from "@/config/path";

export function DashboardRangeForm({ days }: { days: number }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [value, setValue] = useState(String(days));

	function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const params = new URLSearchParams(searchParams.toString());
		params.set("days", value);
		router.push(`${paths.admin.dashboard}?${params.toString()}`);
	}

	return (
		<form className='flex items-end gap-2' onSubmit={onSubmit}>
			<div className='space-y-1'>
				<Label htmlFor='dashboard-days'>Thống kê trong bao nhiêu ngày</Label>
				<div className='flex items-center gap-1'>
					<Input
						id='dashboard-days'
						type='number'
						min={1}
						max={365}
						className='w-28'
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<Button type='submit' size='lg'>
						Xem
					</Button>
				</div>
			</div>
		</form>
	);
}
