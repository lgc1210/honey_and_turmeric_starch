"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { updateVariantStatusAction } from "../api/actions";
import { ImageManager } from "./image-manager";

type VariantDetail = {
	id: string;
	sku: string;
	name: string | null;
	price: string;
	stockQuantity: number;
	status: "Active" | "InActive";
	optionValues: { optionValue: { value: string } }[];
	images: { id: string; url: string; isPrimary: boolean }[];
};

export function VariantCard({ variant }: { variant: VariantDetail }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	async function toggleStatus() {
		setPending(true);
		await updateVariantStatusAction({ id: variant.id, status: variant.status === "Active" ? "InActive" : "Active" });
		setPending(false);
		router.refresh();
	}

	return (
		<section className="space-y-3 border border-border p-4">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div>
					<h4 className="font-semibold text-foreground">
						{variant.name || "Không tên"} ({variant.sku})
					</h4>
					<p className="text-sm text-muted-foreground">
						{formatCurrency(variant.price)} · tồn {variant.stockQuantity}
					</p>
					<p className="text-xs text-muted-foreground">
						{variant.optionValues.map((x) => x.optionValue.value).join(" / ") || "Không có thuộc tính"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={variant.status === "Active" ? "default" : "outline"}>
						{variant.status === "Active" ? "Đang bán" : "Ngừng bán"}
					</Badge>
					<Button variant="outline" size="sm" disabled={pending} onClick={toggleStatus}>
						{variant.status === "Active" ? "Ngừng bán" : "Kích hoạt"}
					</Button>
				</div>
			</div>
			<ImageManager variantId={variant.id} images={variant.images} />
		</section>
	);
}
