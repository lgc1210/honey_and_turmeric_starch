import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				"flex min-h-16 w-full border border-input bg-transparent px-3 py-2 text-sm shadow-none outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				"aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
