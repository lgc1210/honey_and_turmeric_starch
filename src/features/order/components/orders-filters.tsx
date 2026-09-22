"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import paths from "@/config/path";
import { ORDER_STATUS_OPTIONS } from "../constants";

// Định nghĩa kiểu dữ liệu cho Form
interface OrderFilterFormValues {
	search: string;
	status: string;
	fromDate: string;
	toDate: string;
}

export function OrdersFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentStatus = searchParams.get("status") ?? "";
	const currentFromDate = searchParams.get("fromDate") ?? "";
	const currentToDate = searchParams.get("toDate") ?? "";

	const hasActiveFilters =
		currentSearch !== "" || currentStatus !== "" || currentFromDate !== "" || currentToDate !== "";

	const { register, handleSubmit, reset, setValue } = useForm<OrderFilterFormValues>({
		defaultValues: {
			search: currentSearch,
			status: currentStatus,
			fromDate: currentFromDate,
			toDate: currentToDate,
		},
	});

	// 4. Hàm áp dụng params lên URL
	function applyParams(data: OrderFilterFormValues) {
		const params = new URLSearchParams(searchParams.toString());

		for (const [key, value] of Object.entries(data)) {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		}

		params.delete("page"); // Đổi filter thì quay lại trang 1
		router.push(`${paths.admin.orders}/?${params.toString()}`);
	}

	// 5. Hàm xóa bộ lọc
	const handleClear = () => {
		reset({
			search: "",
			status: "",
			fromDate: "",
			toDate: "",
		});
		router.push(paths.admin.orders);
	};

	return (
		<form className='mb-4 flex flex-wrap items-end gap-3' onSubmit={handleSubmit(applyParams)}>
			{/* Ô tìm kiếm từ khóa */}
			<div className='w-56'>
				<Input placeholder='Tìm theo mã đơn hàng...' {...register("search")} />
			</div>

			{/* Select trạng thái */}
			<select
				className='h-9 border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				{...register("status")}
				onChange={(e) => {
					// Vừa cập nhật value trong form vừa trigger apply URL ngay lập tức
					setValue("status", e.target.value);
					handleSubmit(applyParams)();
				}}>
				<option value=''>Tất cả trạng thái</option>
				{ORDER_STATUS_OPTIONS.map(({ value, label }) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>

			<div className='w-44'>
				<label className='text-xs font-medium text-muted-foreground block mb-1'>Từ ngày</label>
				<Input type='date' {...register("fromDate")} />
			</div>

			<div className='w-44'>
				<label className='text-xs font-medium text-muted-foreground block mb-1'>Đến ngày</label>
				<Input type='date' {...register("toDate")} />
			</div>

			{/* Nút hành động */}
			<Button type='submit' size='lg'>
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
