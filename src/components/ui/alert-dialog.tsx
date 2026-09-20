"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { cn } from "cn";

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
	return <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' {...props} />;
}

function AlertDialogBackdrop({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
	return (
		<AlertDialogPrimitive.Backdrop
			data-slot='alert-dialog-backdrop'
			className={cn(
				"fixed inset-0 z-50 bg-black/50 transition-opacity",
				"data-starting-style:opacity-0 data-ending-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogPopup({ className, children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
	return (
		<AlertDialogPortal>
			<AlertDialogBackdrop />
			<AlertDialogPrimitive.Popup
				data-slot='alert-dialog-popup'
				className={cn(
					"fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border border-border bg-card p-6 shadow-none outline-none",
					"transition-all data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
					className,
				)}
				{...props}>
				{children}
			</AlertDialogPrimitive.Popup>
		</AlertDialogPortal>
	);
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			data-slot='alert-dialog-title'
			className={cn("font-sans text-lg font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			data-slot='alert-dialog-description'
			className={cn("mt-2 text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot='alert-dialog-footer' className={cn("mt-6 flex justify-end gap-1", className)} {...props} />;
}

function AlertDialogClose(props: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
	return <AlertDialogPrimitive.Close data-slot='alert-dialog-close' {...props} />;
}

export {
	AlertDialog,
	AlertDialogBackdrop,
	AlertDialogClose,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogPopup,
	AlertDialogPortal,
	AlertDialogTitle,
};
