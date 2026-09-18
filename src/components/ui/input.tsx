import * as React from "react";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-9 w-full min-w-0 border border-input bg-transparent px-3 py-1 text-sm shadow-none outline-none transition-colors selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
				"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				"aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
