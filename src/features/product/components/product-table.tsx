"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { updateProductStatusAction } from "../api/actions";

type ProductRow = {
	id: string;
	name: string;
	status: "Active" | "InActive";
	category: { name: string };
	variants: { sku: string; price: string }[];
};

export function ProductTable({ products }: { products: ProductRow[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);

	async function toggleStatus(product: ProductRow) {
		setPendingId(product.id);
		await updateProductStatusAction({ id: product.id, status: product.status === "Active" ? "InActive" : "Active" });
		setPendingId(null);
		router.refresh();
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Sản phẩm</TableHead>
					<TableHead>Danh mục</TableHead>
					<TableHead>SKU</TableHead>
					<TableHead>Giá từ</TableHead>
					<TableHead>Trạng thái</TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.map((product) => (
					<TableRow key={product.id}>
						<TableCell className="font-medium">
							<Link className="underline-offset-4 hover:underline" href={`/admin/products/${product.id}`}>
								{product.name}
							</Link>
						</TableCell>
						<TableCell>{product.category.name}</TableCell>
						<TableCell>{product.variants[0]?.sku ?? "—"}</TableCell>
						<TableCell>{product.variants[0] ? formatCurrency(product.variants[0].price) : "—"}</TableCell>
						<TableCell>
							<Badge variant={product.status === "Active" ? "default" : "outline"}>
								{product.status === "Active" ? "Đang bán" : "Ngừng bán"}
							</Badge>
						</TableCell>
						<TableCell>
							<Button variant="outline" size="sm" disabled={pendingId === product.id} onClick={() => toggleStatus(product)}>
								{product.status === "Active" ? "Ngừng bán" : "Kích hoạt"}
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
