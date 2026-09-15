import { AdminShell } from "@/components/admin/admin-shell";
import { recentOrders } from "@/features/admin/mock-data";

const statusStyles: Record<string, string> = {
	"Đang xử lý": "bg-[#f7e5b0] text-[#7e5a20]",
	"Đã xác nhận": "bg-[#dfeecf] text-[#335e36]",
	"Hoàn thành": "bg-[#dfe9ff] text-[#305295]",
	"Chờ thanh toán": "bg-[#f7d5c6] text-[#8f4b38]",
};

export default function OrdersPage() {
	return (
		<AdminShell
			title='Đơn hàng'
			description='Theo dõi tiến độ, trạng thái thanh toán và các đơn hàng mới nhất.'
			activeHref='/admin/orders'
		>
			<div className='overflow-hidden rounded-2xl border border-[#ecd8bd] bg-[#fff]'>
				<div className='grid grid-cols-5 bg-[#fffaf3] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[#6a4d32]'>
					<div>Mã đơn</div>
					<div>Khách hàng</div>
					<div>Thanh toán</div>
					<div>Giá trị</div>
					<div>Trạng thái</div>
				</div>
				<div>
					{recentOrders.map((order) => (
						<div key={order.id} className='grid grid-cols-5 items-center border-t border-[#f1e7d9] px-4 py-3 text-sm'>
							<div className='font-medium text-[#2d1b12]'>{order.id}</div>
							<div className='text-[#6a4d32]'>{order.customer}</div>
							<div className='text-[#6a4d32]'>{order.channel}</div>
							<div className='text-[#2d1b12]'>{order.amount}</div>
							<div>
								<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status] ?? 'bg-[#f0e7dd] text-[#5d4534]'}`}>
									{order.status}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</AdminShell>
	);
}
