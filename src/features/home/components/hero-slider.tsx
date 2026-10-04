"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import paths from "@/config/path";
import { cn } from "@/lib/utils";

type HeroSlide = {
	src: string;
	alt: string;
	badge: string;
	title: string;
	description: string;
	primaryCta: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
};

const HERO_SLIDES: HeroSlide[] = [
	{
		src: "/hero-images/hero-image-1.png",
		alt: "Mật ong rừng nguyên chất",
		badge: "Thủ công · Tự nhiên · Nguyên chất",
		title: "Mật ong rừng nguyên chất",
		description: "Thu hoạch trực tiếp từ rừng, không pha tạp, không chất bảo quản — vị ngọt thanh đúng chất tự nhiên.",
		primaryCta: { label: "Khám phá cửa hàng", href: paths.client.products },
		secondaryCta: { label: "Tìm hiểu thêm", href: "#gioi-thieu" },
	},
	{
		src: "/hero-images/hero-image-2.png",
		alt: "Tinh bột nghệ thủ công",
		badge: "Chế biến thủ công",
		title: "Tinh bột nghệ làm tay",
		description: "Nghệ tươi chọn lọc, lọc và phơi khô tự nhiên — giữ trọn hoạt chất curcumin cho cả gia đình.",
		primaryCta: { label: "Xem tinh bột nghệ", href: paths.client.products },
	},
	{
		src: "/hero-images/hero-image-3.png",
		alt: "Đóng gói và giao hàng toàn quốc",
		badge: "Giao hàng toàn quốc",
		title: "Đóng gói kỹ, giao tận nơi",
		description: "Chai lọ kín, bọc chống sốc cẩn thận. Miễn phí vận chuyển cho đơn từ 500.000đ.",
		primaryCta: { label: "Mua ngay", href: paths.client.products },
	},
	{
		src: "/hero-images/hero-image-4.png",
		alt: "Câu chuyện Kim Bạc Store",
		badge: "Câu chuyện của chúng tôi",
		title: "Từ vườn nhà đến tay bạn",
		description: "Không qua trung gian, mỗi sản phẩm đều được kiểm tra chất lượng trước khi đến tay khách hàng.",
		primaryCta: { label: "Về Kim Bạc Store", href: "#gioi-thieu" },
	},
];

const AUTOPLAY_MS = 3000;

export function HeroSlider() {
	const [current, setCurrent] = useState(0);
	const [paused, setPaused] = useState(false);
	const touchStartX = useRef<number | null>(null);
	const total = HERO_SLIDES.length;

	const goTo = useCallback((index: number) => setCurrent((index + total) % total), [total]);
	const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
	const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

	// Autoplay: reset timer mỗi khi đổi slide (kể cả khi bấm tay)
	useEffect(() => {
		if (paused) return;
		const id = setTimeout(next, AUTOPLAY_MS);
		return () => clearTimeout(id);
	}, [current, paused, next]);

	const onTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};
	const onTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX.current === null) return;
		const delta = e.changedTouches[0].clientX - touchStartX.current;
		if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
		touchStartX.current = null;
	};

	return (
		<section
			aria-roledescription='carousel'
			aria-label='Banner giới thiệu'
			className='relative h-105 overflow-hidden bg-card sm:h-125 lg:h-[calc(100vh-64px)]'
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			onTouchStart={onTouchStart}
			onTouchEnd={onTouchEnd}>
			{HERO_SLIDES.map((slide, index) => {
				const active = index === current;
				return (
					<div
						key={slide.src}
						role='group'
						aria-roledescription='slide'
						aria-label={`${index + 1} / ${total}`}
						aria-hidden={!active}
						className={cn(
							"absolute inset-0 transition-opacity duration-1000 ease-in-out",
							active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
						)}>
						{/* Ảnh nền + hiệu ứng zoom nhẹ (Ken Burns) */}
						<Image
							src={slide.src}
							alt={slide.alt}
							fill
							sizes='100vw'
							priority={index === 0}
							className={cn(
								"object-cover transition-transform duration-7000 ease-out",
								active ? "scale-110" : "scale-100",
							)}
						/>

						{/* Lớp overlay: tối dần từ trái sang phải để chữ dễ đọc */}
						<div
							aria-hidden
							className='absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-black/20 sm:to-black/10'
						/>
						<div
							aria-hidden
							className='absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent'
						/>

						{/* Nội dung — key theo trạng thái active để animation chạy lại mỗi lần đổi slide */}
						<div className='relative z-10 flex h-full items-center px-6 sm:px-12 lg:px-20'>
							{active && (
								<div className='max-w-2xl text-left text-white'>
									<span className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both inline-block bg-white/15 px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur-sm duration-700'>
										{slide.badge}
									</span>
									<h1 className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-4 font-sans text-3xl font-bold delay-150 duration-700 sm:text-4xl lg:text-5xl capitalize'>
										{slide.title}
									</h1>
									<p className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-4 text-sm text-white/85 delay-300 duration-700 sm:text-base'>
										{slide.description}
									</p>
									<div className='animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-8 flex flex-wrap gap-2 delay-500 duration-700'>
										<ButtonLink size='lg' href={slide.primaryCta.href}>
											{slide.primaryCta.label}
										</ButtonLink>
										{slide.secondaryCta && (
											<ButtonLink size='lg' variant='secondary' href={slide.secondaryCta.href}>
												{slide.secondaryCta.label}
											</ButtonLink>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				);
			})}

			{/* Nút điều hướng */}
			<button
				type='button'
				onClick={prev}
				aria-label='Slide trước'
				className='absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex'>
				<ChevronLeft className='size-6' />
			</button>
			<button
				type='button'
				onClick={next}
				aria-label='Slide kế tiếp'
				className='absolute top-1/2 right-3 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex'>
				<ChevronRight className='size-6' />
			</button>

			{/* Dots + thanh tiến trình */}
			<div className='absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2'>
				{HERO_SLIDES.map((slide, index) => (
					<button
						key={slide.src}
						type='button'
						onClick={() => goTo(index)}
						aria-label={`Chuyển tới slide ${index + 1}`}
						aria-current={index === current}
						className='group relative h-1.5 cursor-pointer overflow-hidden bg-white/40 transition-all'
						style={{ width: index === current ? 40 : 16 }}>
						{index === current && (
							<span
								key={`${current}-${paused}`}
								className='absolute inset-y-0 left-0 bg-white'
								style={{
									width: paused ? "100%" : undefined,
									animation: paused ? undefined : `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
								}}
							/>
						)}
					</button>
				))}
			</div>
		</section>
	);
}
