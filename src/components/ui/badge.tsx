import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
	"inline-flex items-center gap-1 border px-2 py-0.5 text-xs font-medium whitespace-nowrap w-fit",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary/15 text-primary",
				secondary: "border-transparent bg-secondary text-secondary-foreground",
				accent: "border-transparent bg-accent/15 text-accent",
				destructive: "border-transparent bg-destructive/10 text-destructive",
				outline: "border-border text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return <span data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
