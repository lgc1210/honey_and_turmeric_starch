"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Sinh danh sách số trang hiển thị, rút gọn bằng "…" khi nhiều trang (kiểu 1 … 4 5 [6] 7 8 … 20). */
function buildPageList(page: number, totalPages: number): (number | "ellipsis")[] {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

	const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
	const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

	const result: (number | "ellipsis")[] = [];
	for (let i = 0; i < sorted.length; i++) {
		if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
		result.push(sorted[i]);
	}
	return result;
}

export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
	const searchParams = useSearchParams();
	// if (totalPages <= 1) return null;

	function hrefFor(target: number) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(target));
		return `${basePath}?${params.toString()}`;
	}

	const pages = buildPageList(page, totalPages);
	const linkClass = "flex h-9 min-w-9 items-center justify-center border border-border px-2 text-sm";

	return (
		<nav className='mt-4 flex flex-wrap items-center justify-end gap-1' aria-label='Phân trang'>
			<Link
				href={hrefFor(Math.max(1, page - 1))}
				aria-disabled={page <= 1}
				title='Trang trước'
				className={cn(linkClass, page <= 1 && "pointer-events-none opacity-40")}>
				<ChevronLeft className='size-3' />
			</Link>

			{pages.map((p, index) =>
				p === "ellipsis" ? (
					<span key={`ellipsis-${index}`} className='px-1 text-sm text-muted-foreground'>
						…
					</span>
				) : (
					<Link
						key={p}
						href={hrefFor(p)}
						aria-current={p === page ? "page" : undefined}
						className={cn(linkClass, p === page && "border-primary bg-primary text-primary-foreground")}>
						{p}
					</Link>
				),
			)}

			<Link
				href={hrefFor(Math.min(totalPages, page + 1))}
				aria-disabled={page >= totalPages}
				title='Trang sau'
				className={cn(linkClass, page >= totalPages && "pointer-events-none opacity-40")}>
				<ChevronRight className='size-3' />
			</Link>
		</nav>
	);
}
