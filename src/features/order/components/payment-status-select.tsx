"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaymentStatus } from "@/generated/prisma/enums";
import { updatePaymentStatusAction } from "../api/actions";

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
	Pending: "Chờ thanh toán",
	Paid: "Đã thanh toán",
	Failed: "Thất bại",
	Refunded: "Đã hoàn tiền",
};

const PAYMENT_STATUSES: PaymentStatus[] = [
	PaymentStatus.Pending,
	PaymentStatus.Paid,
	PaymentStatus.Failed,
	PaymentStatus.Refunded,
];

export function PaymentStatusSelect({ paymentId, status }: { paymentId: string; status: PaymentStatus }) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function onChange(next: string) {
		setError("");
		setPending(true);
		const result = await updatePaymentStatusAction({ paymentId, status: next });
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
				{PAYMENT_STATUSES.map((value) => (
					<option key={value} value={value}>
						{PAYMENT_STATUS_LABEL[value]}
					</option>
				))}
			</select>
			{error && <p className='mt-1 text-xs text-destructive'>{error}</p>}
		</div>
	);
}
