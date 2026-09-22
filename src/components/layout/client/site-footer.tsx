export function SiteFooter() {
	return (
		<footer className='border-t border-border bg-card'>
			<div className='mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground'>
				<p className='font-serif text-base font-semibold text-foreground'>Kim Bạc Store</p>
				<p className='mt-1'>Mật ong &amp; tinh bột nghệ nguyên chất.</p>
				<p className='mt-4 text-xs'>© {new Date().getFullYear()} Kim Bạc Store. Mọi quyền được bảo lưu.</p>
			</div>
		</footer>
	);
}
