"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogPopup,
	AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Xác nhận",
	cancelLabel = "Huỷ",
	destructive = true,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onConfirm: () => void | Promise<void>;
}) {
	const [pending, setPending] = useState(false);

	async function handleConfirm() {
		setPending(true);
		await onConfirm();
		setPending(false);
		onOpenChange(false);
	}

	return (
		<AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
			<AlertDialogPopup>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				{description && <AlertDialogDescription>{description}</AlertDialogDescription>}
				<AlertDialogFooter>
					<Button type='button' variant='outline' size='sm' disabled={pending} onClick={() => onOpenChange(false)}>
						{cancelLabel}
					</Button>
					<Button
						type='button'
						variant={destructive ? "destructive" : "default"}
						size='sm'
						disabled={pending}
						onClick={handleConfirm}>
						{pending ? "Đang xử lý..." : confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogPopup>
		</AlertDialog>
	);
}
