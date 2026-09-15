import { AdminShell } from "@/components/admin/admin-shell";
import { categoryTree } from "@/features/admin/mock-data";

export default function CategoriesPage() {
	return (
		<AdminShell
			title='Danh mục sản phẩm'
			description='Quản lý cấu trúc danh mục và số lượng sản phẩm trong từng nhóm.'
			activeHref='/admin/categories'
		>
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				{categoryTree.map((category) => (
					<div key={category.name} className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-4'>
						<div className='flex items-center justify-between'>
							<h3 className='text-base font-semibold text-[#2d1b12]'>{category.name}</h3>
							<span className='rounded-full bg-[#f7e5b0] px-2 py-1 text-xs font-medium text-[#7e5a20]'>{category.type}</span>
						</div>
						<p className='mt-4 text-sm text-[#6a4d32]'>Số lượng sản phẩm: {category.count}</p>
						<button className='mt-4 text-sm font-medium text-[#a35f2d]'>Chỉnh sửa</button>
					</div>
				))}
			</div>
		</AdminShell>
	);
}
