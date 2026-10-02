import Link from "next/link";
import { Suspense } from "react";
import { Award, Leaf, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import paths from "@/config/path";
import { FeaturedProducts } from "@/features/product/components/featured-products";
import { ProductGridSkeleton } from "@/features/product/components/product-skeleton";
import { CategoryShowcase } from "@/features/category/components/category-showcase";

const BENEFITS = [
	{ icon: Leaf, title: "100% tự nhiên", description: "Nguyên liệu chọn lọc, không pha tạp, không chất bảo quản." },
	{ icon: PackageCheck, title: "Đóng gói cẩn thận", description: "Chai lọ kín, bọc chống sốc kỹ trước khi giao đi." },
	{ icon: Truck, title: "Giao hàng toàn quốc", description: "Miễn phí vận chuyển cho đơn từ 500.000đ." },
	{ icon: Award, title: "Cam kết chất lượng", description: "Đổi trả nếu sản phẩm không đúng như mô tả." },
];

export default function HomePage() {
	return (
		<div className='space-y-16'>
			<section className='relative overflow-hidden border border-border bg-card px-6 py-20 text-center'>
				<div
					aria-hidden
					className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary)_0%,transparent_35%),radial-gradient(circle_at_80%_70%,var(--color-accent)_0%,transparent_35%)] opacity-[0.08]'
				/>
				<div className='relative animate-in fade-in slide-in-from-bottom-4 duration-700'>
					<span className='inline-block bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase'>
						Thủ công · Tự nhiên · Nguyên chất
					</span>
					<h1 className='mt-4 font-sans text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl'>
						Mật ong &amp; tinh bột nghệ nguyên chất
					</h1>
					<p className='mx-auto mt-4 max-w-xl text-muted-foreground'>
						Tự tay chọn lọc nguyên liệu, chế biến thủ công — mang đến sản phẩm tự nhiên, an toàn cho sức khoẻ cả gia
						đình.
					</p>
					<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
						<Button size='lg' className='cursor-pointer'>
							<Link href={paths.client.products}>Khám phá cửa hàng</Link>
						</Button>
						<Button size='lg' variant='outline' className='cursor-pointer'>
							<Link href='#gioi-thieu'>Tìm hiểu thêm</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
				{BENEFITS.map((benefit, index) => (
					<div
						key={benefit.title}
						className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-col items-center gap-2 border border-border bg-card p-5 text-center duration-500'
						style={{ animationDelay: `${index * 80}ms` }}>
						<benefit.icon className='size-6 text-primary' />
						<p className='text-sm font-medium text-foreground'>{benefit.title}</p>
						<p className='text-xs text-muted-foreground'>{benefit.description}</p>
					</div>
				))}
			</section>

			<section>
				<div className='mb-6 text-center'>
					<h2 className='font-sans text-2xl font-bold text-foreground'>Danh mục sản phẩm</h2>
					<p className='mt-1 text-sm text-muted-foreground'>Chọn đúng loại bạn đang tìm kiếm</p>
				</div>
				<CategoryShowcase />
			</section>

			<section>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h2 className='font-sans text-2xl font-bold text-foreground'>Sản phẩm nổi bật</h2>
						<p className='mt-1 text-sm text-muted-foreground'>Được yêu thích nhất trong thời gian gần đây</p>
					</div>
					<Link href={paths.client.products} className='text-sm text-primary underline-offset-4 hover:underline'>
						Xem tất cả →
					</Link>
				</div>

				<Suspense fallback={<ProductGridSkeleton />}>
					<FeaturedProducts />
				</Suspense>
			</section>

			<section id='gioi-thieu' className='grid items-center gap-8 border border-border bg-card p-8 lg:grid-cols-2'>
				<div className='animate-in fade-in slide-in-from-left-4 duration-700'>
					<span className='text-xs font-medium tracking-wide text-primary uppercase'>Câu chuyện của chúng tôi</span>
					<h2 className='mt-2 font-sans text-2xl font-bold text-foreground'>Từ vườn nhà đến tay bạn</h2>
					<p className='mt-4 text-muted-foreground'>
						Kim Bạc Store bắt đầu từ những mẻ mật ong rừng và tinh bột nghệ tự làm cho gia đình — vì tin rằng những gì
						tốt nhất nên được chia sẻ. Mỗi sản phẩm đều được chúng tôi trực tiếp kiểm tra chất lượng trước khi đến tay
						khách hàng, không qua trung gian, không pha trộn.
					</p>
					<Button className='mt-6 cursor-pointer' variant='outline'>
						<Link href={paths.client.products}>Xem sản phẩm của chúng tôi</Link>
					</Button>
				</div>
				<div
					aria-hidden
					className='flex aspect-video items-center justify-center border border-border bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-accent)_100%)] opacity-90'
				/>
			</section>
		</div>
	);
}
