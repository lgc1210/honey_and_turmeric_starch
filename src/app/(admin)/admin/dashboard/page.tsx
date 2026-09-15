import { AdminShell } from "@/components/admin/admin-shell";
import { dashboardMetrics, inventoryAlerts, recentOrders } from "@/features/admin/mock-data";

const statusStyles: Record<string, string> = {
	"Đang xử lý": "bg-[#f7e5b0] text-[#7e5a20]",
	"Đã xác nhận": "bg-[#dfeecf] text-[#335e36]",
	"Hoàn thành": "bg-[#dfe9ff] text-[#305295]",
	"Chờ thanh toán": "bg-[#f7d5c6] text-[#8f4b38]",
};

export default function DashboardPage() {
	return (
		<AdminShell
			title='Tổng quan'
			description='Xem doanh thu, đơn hàng và tình trạng tồn kho trên một dashboard thống nhất.'
			activeHref='/admin/dashboard'
		>
			<div className='space-y-6'>
				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					{dashboardMetrics.map((item) => (
						<div key={item.label} className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-4'>
							<p className='text-sm text-[#6a4d32]'>{item.label}</p>
							<div className='mt-3 flex items-end justify-between'>
								<strong className='text-2xl font-semibold text-[#2d1b12]'>{item.value}</strong>
								<span className='text-xs font-medium text-[#5b8c5d]'>{item.delta}</span>
							</div>
						</div>
					))}
				</div>

				<div className='grid gap-6 xl:grid-cols-[1.5fr_0.9fr]'>
					<section className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
						<div className='mb-4 flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-[#2d1b12]'>Đơn hàng gần đây</h3>
							<button className='text-sm font-medium text-[#a35f2d]'>Xem tất cả</button>
						</div>
						<div className='space-y-3'>
							{recentOrders.map((order) => (
								<div key={order.id} className='flex items-center justify-between rounded-xl border border-[#f1e7d9] bg-[#fffaf3] p-3'>
									<div>
										<p className='font-medium text-[#2d1b12]'>{order.id}</p>
										<p className='text-sm text-[#6a4d32]'>{order.customer}</p>
									</div>
									<div className='text-right'>
										<p className='font-medium text-[#2d1b12]'>{order.amount}</p>
										<div className='mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-[#2d1b12]'>
											<span className={statusStyles[order.status] ?? 'bg-[#f0e7dd] text-[#5d4534]'}>{order.status}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>

					<section className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
						<h3 className='text-lg font-semibold text-[#2d1b12]'>Sản phẩm cần chú ý</h3>
						<div className='mt-4 space-y-3'>
							{inventoryAlerts.map((item) => (
								<div key={item.sku} className='rounded-xl border border-[#f1e7d9] bg-[#fffaf3] p-3'>
									<div className='flex items-center justify-between'>
										<p className='font-medium text-[#2d1b12]'>{item.product}</p>
										<span className='text-xs uppercase tracking-[0.12em] text-[#a35f2d]'>{item.sku}</span>
									</div>
									<p className='mt-2 text-sm text-[#6a4d32]'>Còn lại {item.stock} sản phẩm</p>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</AdminShell>
	);
}
