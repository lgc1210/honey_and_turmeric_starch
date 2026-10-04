import Link from "next/link";
import { Suspense } from "react";
import { Award, Leaf, PackageCheck, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import paths from "@/config/path";
import { FeaturedProducts } from "@/features/product/components/featured-products";
import { ProductGridSkeleton } from "@/features/product/components/product-skeleton";
import { CategoryShowcase } from "@/features/category/components/category-showcase";
import { HeroSlider } from "@/features/home/components/hero-slider";
import Image from "next/image";

const BENEFITS = [
	{ icon: Leaf, title: "100% tự nhiên", description: "Nguyên liệu chọn lọc, không pha tạp, không chất bảo quản." },
	{ icon: PackageCheck, title: "Đóng gói cẩn thận", description: "Chai lọ kín, bọc chống sốc kỹ trước khi giao đi." },
	{ icon: Truck, title: "Giao hàng toàn quốc", description: "Miễn phí vận chuyển cho đơn từ 500.000đ." },
	{ icon: Award, title: "Cam kết chất lượng", description: "Đổi trả nếu sản phẩm không đúng như mô tả." },
];

export default function HomePage() {
	return (
		<>
			<HeroSlider />

			<div className='space-y-16 max-w-6xl px-4 py-8 w-full mx-auto'>
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
					<div className='animate-in fade-in slide-in-from-left-4 duration-700 space-y-6'>
						<span className='text-xs font-medium tracking-wide text-primary uppercase'>Câu chuyện của chúng tôi</span>
						<h2 className='font-sans text-2xl font-bold text-foreground'>Từ vườn nhà đến tay bạn</h2>
						<p className='text-muted-foreground'>
							Kim Bạc Store bắt đầu từ những mẻ mật ong rừng và tinh bột nghệ tự làm cho gia đình — vì tin rằng những gì
							tốt nhất nên được chia sẻ. Mỗi sản phẩm đều được chúng tôi trực tiếp kiểm tra chất lượng trước khi đến tay
							khách hàng, không qua trung gian, không pha trộn.
						</p>
						<ButtonLink size='lg' href={paths.client.products}>
							Xem sản phẩm của chúng tôi
						</ButtonLink>
					</div>

					<div className='relative h-full w-full lg:h-full min-h-75'>
						<Image
							src='/about-images/about-image-1.png'
							alt='Giới thiệu'
							fill
							sizes='(max-width: 1024px) 100vw, 50vw'
							className='object-cover'
						/>
					</div>
				</section>
			</div>
		</>
	);
}
