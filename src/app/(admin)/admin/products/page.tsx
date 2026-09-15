import { AdminShell } from "@/components/admin/admin-shell";
import { productRows } from "@/features/admin/mock-data";

const statusStyles: Record<string, string> = {
	Active: "bg-[#dfeecf] text-[#335e36]",
	Draft: "bg-[#f7e5b0] text-[#7e5a20]",
	Inactive: "bg-[#f7d5c6] text-[#8f4b38]",
};

export default function ProductsPage() {
	return (
		<AdminShell
			title='Quản lý sản phẩm'
			description='Theo dõi danh sách sản phẩm, trạng thái tồn kho và biến thể đang hoạt động.'
			activeHref='/admin/products'
		>
			<div className='overflow-hidden rounded-2xl border border-[#ecd8bd] bg-[#fff]'>
				<div className='flex items-center justify-between border-b border-[#f1e7d9] bg-[#fffaf3] px-4 py-3'>
					<h3 className='text-base font-semibold text-[#2d1b12]'>Danh sách sản phẩm</h3>
					<button className='rounded-lg bg-[#f5cb63] px-3 py-1.5 text-sm font-medium text-[#2d1b12]'>+ Thêm sản phẩm</button>
				</div>
				<div className='overflow-x-auto'>
					<table className='min-w-full text-left text-sm'>
						<thead className='bg-[#fffaf3] text-[#6a4d32]'>
							<tr>
								<th className='px-4 py-3 font-medium'>Sản phẩm</th>
								<th className='px-4 py-3 font-medium'>Danh mục</th>
								<th className='px-4 py-3 font-medium'>SKU</th>
								<th className='px-4 py-3 font-medium'>Tồn kho</th>
								<th className='px-4 py-3 font-medium'>Giá</th>
								<th className='px-4 py-3 font-medium'>Trạng thái</th>
							</tr>
						</thead>
						<tbody>
							{productRows.map((product) => (
								<tr key={product.sku} className='border-t border-[#f1e7d9]'>
									<td className='px-4 py-3 font-medium text-[#2d1b12]'>{product.name}</td>
									<td className='px-4 py-3 text-[#6a4d32]'>{product.category}</td>
									<td className='px-4 py-3 text-[#6a4d32]'>{product.sku}</td>
									<td className='px-4 py-3 text-[#6a4d32]'>{product.stock}</td>
									<td className='px-4 py-3 text-[#2d1b12]'>{product.price}</td>
									<td className='px-4 py-3'>
										<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[product.status] ?? 'bg-[#f0e7dd] text-[#5d4534]'}`}>
											{product.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</AdminShell>
	);
}
