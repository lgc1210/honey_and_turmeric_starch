"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS_OPTIONS } from "../constants";
import { updateOrderStatusAction } from "../api/actions";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function onChange(next: string) {
		setError("");
		setPending(true);
		const result = await updateOrderStatusAction({ orderId, status: next });
		setPending(false);
		if (!result.success) {
			setError(result.error);
			return;
		}
		router.refresh();
	}

	return (
		<div>
			<select
				defaultValue={status}
				disabled={pending}
				className='h-8 border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
				onChange={(e) => onChange(e.target.value)}>
				{ORDER_STATUS_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className='mt-1 text-xs text-destructive'>{error}</p>}
		</div>
	);
}
