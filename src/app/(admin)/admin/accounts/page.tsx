import { AdminShell } from "@/components/admin/admin-shell";
import { accountRows, recentActivity } from "@/features/admin/mock-data";

const statusStyles: Record<string, string> = {
	Online: "bg-[#dfeecf] text-[#335e36]",
	Offline: "bg-[#f0e7dd] text-[#5d4534]",
};

export default function AccountsPage() {
	return (
		<AdminShell
			title='Tài khoản & phân quyền'
			description='Quản lý trạng thái hoạt động của nhân sự và các hành động gần đây trong hệ thống.'
			activeHref='/admin/accounts'
		>
			<div className='grid gap-6 xl:grid-cols-[1.3fr_0.8fr]'>
				<section className='overflow-hidden rounded-2xl border border-[#ecd8bd] bg-[#fff]'>
					<div className='border-b border-[#f1e7d9] bg-[#fffaf3] px-4 py-3 text-base font-semibold text-[#2d1b12]'>Danh sách tài khoản</div>
					<div>
						{accountRows.map((account) => (
							<div key={account.email} className='flex items-center justify-between border-b border-[#f1e7d9] px-4 py-3 last:border-b-0'>
								<div>
									<p className='font-medium text-[#2d1b12]'>{account.name}</p>
									<p className='text-sm text-[#6a4d32]'>{account.email}</p>
								</div>
								<div className='text-right'>
									<p className='text-sm text-[#6a4d32]'>{account.role}</p>
									<span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[account.status] ?? 'bg-[#f0e7dd] text-[#5d4534]'}`}>
										{account.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</section>

				<aside className='rounded-2xl border border-[#ecd8bd] bg-[#fff] p-5'>
					<h3 className='text-lg font-semibold text-[#2d1b12]'>Hoạt động gần đây</h3>
					<div className='mt-4 space-y-3'>
						{recentActivity.map((item) => (
							<div key={item} className='rounded-xl border border-[#f1e7d9] bg-[#fffaf3] p-3 text-sm text-[#5d4534]'>{item}</div>
						))}
					</div>
				</aside>
			</div>
		</AdminShell>
	);
}
