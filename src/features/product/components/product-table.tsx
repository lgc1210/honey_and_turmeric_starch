"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { deleteProductAction, updateProductStatusAction } from "../api/actions";
import { EntityStatus } from "@/generated/prisma/enums";
import paths from "@/config/path";

type ProductRow = {
	id: string;
	name: string;
	status: EntityStatus;
	category: { name: string };
	variants: { sku: string; price: string }[];
};

export function ProductTable({ products }: { products: ProductRow[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
	const [errorById, setErrorById] = useState<Record<string, string>>({});

	async function toggleStatus(product: ProductRow) {
		setPendingId(product.id);
		await updateProductStatusAction({
			id: product.id,
			status: product.status === EntityStatus.Active ? EntityStatus.InActive : EntityStatus.Active,
		});
		setPendingId(null);
		router.refresh();
	}

	async function confirmDelete() {
		if (!deletingProduct) return;
		const result = await deleteProductAction({ id: deletingProduct.id });
		setErrorById((prev) => ({ ...prev, [deletingProduct.id]: result.success ? "" : result.error }));
		if (result.success) router.refresh();
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Sản phẩm</TableHead>
						<TableHead>Danh mục</TableHead>
						<TableHead>SKU</TableHead>
						<TableHead>Giá từ</TableHead>
						<TableHead className='text-center'>Trạng thái</TableHead>
						<TableHead className='text-center'>Hành động</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.map((product) => (
						<TableRow key={product.id}>
							<TableCell className='font-medium'>
								<Link className='underline-offset-4 hover:underline' href={`${paths.admin.products}/${product.id}`}>
									{product.name}
								</Link>
								{errorById[product.id] && <p className='mt-1 text-xs text-destructive'>{errorById[product.id]}</p>}
							</TableCell>
							<TableCell>{product.category.name}</TableCell>
							<TableCell>{product.variants[0]?.sku ?? "—"}</TableCell>
							<TableCell>{product.variants[0] ? formatCurrency(product.variants[0].price) : "—"}</TableCell>
							<TableCell className='flex items-center justify-center'>
								<Badge variant={product.status === EntityStatus.Active ? "default" : "destructive"}>
									{product.status === EntityStatus.Active ? "Đang bán" : "Ngừng bán"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className='flex items-center justify-center gap-1'>
									<Button
										variant='outline'
										size='sm'
										disabled={pendingId === product.id}
										onClick={() => toggleStatus(product)}>
										{product.status === EntityStatus.Active ? "Ngừng bán" : "Kích hoạt"}
									</Button>
									<Button variant='destructive' size='sm' onClick={() => setDeletingProduct(product)}>
										Xoá
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<ConfirmDialog
				open={deletingProduct !== null}
				onOpenChange={(open) => !open && setDeletingProduct(null)}
				title={`Xoá sản phẩm "${deletingProduct?.name}"?`}
				description='Toàn bộ biến thể, ảnh và thuộc tính của sản phẩm sẽ bị xoá theo. Hành động này không thể hoàn tác.'
				confirmLabel='Xoá'
				onConfirm={confirmDelete}
			/>
		</>
	);
}
