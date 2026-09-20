import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeOptionValue } from "@/lib/utils";
import { serialize } from "@/lib/serialize";
import { PAGINATION } from "@/config/site";
import type {
	CreateProductInput,
	CreateVariantInput,
	ProductQuery,
	UpdateProductInput,
	UpdateVariantInput,
	UploadProductImageInput,
} from "../schema";

async function uniqueProductSlug(input: string, excludeId?: bigint): Promise<string> {
	const base = slugify(input) || "san-pham";
	let slug = base;
	let suffix = 1;

	while (true) {
		const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
		if (!existing || existing.id === excludeId) return slug;
		slug = `${base}-${suffix++}`;
	}
}

/** Kiểm tra tổ hợp option value đã tồn tại trong product chưa (mục 4.2 AGENTS.md). */
async function assertNoDuplicateCombination(
	tx: Prisma.TransactionClient,
	productId: bigint,
	optionValueIds: bigint[],
	excludeVariantId?: bigint,
) {
	const variants = await tx.productVariant.findMany({
		where: { productId, ...(excludeVariantId ? { id: { not: excludeVariantId } } : {}) },
		include: { optionValues: true },
	});

	const targetSet = new Set(optionValueIds.map(String));
	const hasDuplicate = variants.some((variant) => {
		const variantSet = new Set(variant.optionValues.map((v) => v.optionValueId.toString()));
		return variantSet.size === targetSet.size && [...variantSet].every((id) => targetSet.has(id));
	});

	if (hasDuplicate) throw new Error("Tổ hợp thuộc tính này đã tồn tại cho một biến thể khác");
}

export async function getAdminProducts(query: ProductQuery) {
	const pageSize = query.pageSize || PAGINATION.ADMIN_PAGE_SIZE;

	const where: Prisma.ProductWhereInput = {
		...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
		...(query.categoryId ? { categoryId: BigInt(query.categoryId) } : {}),
		...(query.status ? { status: query.status } : {}),
	};

	const orderBy: Prisma.ProductOrderByWithRelationInput =
		query.sortBy === "name" ? { name: query.sortOrder } : { createdAt: query.sortOrder };

	const [items, total] = await Promise.all([
		prisma.product.findMany({
			where,
			orderBy,
			skip: (query.page - 1) * pageSize,
			take: pageSize,
			include: { category: { select: { name: true } }, variants: { orderBy: { price: "asc" }, take: 1 } },
		}),
		prisma.product.count({ where }),
	]);

	return {
		items: serialize(items),
		total,
		page: query.page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function getAdminProductById(id: bigint) {
	const product = await prisma.product.findUnique({
		where: { id },
		include: {
			category: true,
			options: { include: { values: true } },
			variants: {
				include: { optionValues: { include: { optionValue: true } }, images: { orderBy: { sortOrder: "asc" } } },
				orderBy: { createdAt: "asc" },
			},
		},
	});

	return product ? serialize(product) : null;
}

export async function createProduct(input: CreateProductInput) {
	const category = await prisma.category.findUnique({
		where: { id: BigInt(input.categoryId) },
	});
	if (!category) throw new Error("Danh mục không tồn tại");

	const product = await prisma.$transaction(
		async (tx) => {
			const created = await tx.product.create({
				data: {
					categoryId: BigInt(input.categoryId),
					name: input.name,
					// slug: await uniqueProductSlug(input.slug || input.name),
					slug: input.slug || input.name,
					description: input.description,
					status: input.status,
				},
			});

			// map "tên option + tên value" -> id, để gán vào variant.optionValueIds theo index
			const optionValueIdByKey = new Map<string, bigint>();

			for (const option of input.options ?? []) {
				const createdOption = await tx.productOption.create({ data: { productId: created.id, name: option.name } });

				for (const optionValue of option.values) {
					const createdValue = await tx.productOptionValue.create({
						data: {
							optionId: createdOption.id,
							value: optionValue.value,
							normalizedValue: normalizeOptionValue(optionValue.value),
						},
					});
					optionValueIdByKey.set(`${option.name}:${optionValue.value}`, createdValue.id);
				}
			}

			for (const variant of input.variants) {
				// optionValueIds gửi từ client ở bước tạo mới là index cục bộ (0, 1, 2...) trỏ tới
				// option value vừa tạo ở trên theo thứ tự khai báo — quy ước này được xử lý ở component.
				const optionValueIds = variant.optionValueIds
					.map((index) => [...optionValueIdByKey.values()][index])
					.filter((id): id is bigint => id !== undefined);

				if (optionValueIds.length) await assertNoDuplicateCombination(tx, created.id, optionValueIds);

				await tx.productVariant.create({
					data: {
						productId: created.id,
						sku: variant.sku,
						name: variant.name,
						price: variant.price,
						oldPrice: variant.oldPrice,
						stockQuantity: variant.stockQuantity,
						status: variant.status,
						optionValues: optionValueIds.length
							? { create: optionValueIds.map((optionValueId) => ({ optionValueId })) }
							: undefined,
					},
				});
			}

			return created;
		},
		{
			timeout: 50000,
		},
	);

	return serialize(product);
}

export async function updateProduct(input: UpdateProductInput) {
	const id = BigInt(input.id);

	if (input.categoryId) {
		const category = await prisma.category.findUnique({ where: { id: BigInt(input.categoryId) } });
		if (!category) throw new Error("Danh mục không tồn tại");
	}

	const product = await prisma.product.update({
		where: { id },
		data: {
			...(input.categoryId ? { categoryId: BigInt(input.categoryId) } : {}),
			...(input.name ? { name: input.name, slug: await uniqueProductSlug(input.slug || input.name, id) } : {}),
			...(input.description !== undefined ? { description: input.description } : {}),
			...(input.status ? { status: input.status } : {}),
		},
	});

	return serialize(product);
}

export async function updateProductStatus(id: bigint, status: "Active" | "InActive") {
	const product = await prisma.product.update({ where: { id }, data: { status } });
	return serialize(product);
}

export async function createVariant(input: CreateVariantInput) {
	const optionValueIds = input.optionValueIds.map((value) => BigInt(value));

	const variant = await prisma.$transaction(async (tx) => {
		if (optionValueIds.length) {
			await assertNoDuplicateCombination(tx, BigInt(input.productId), optionValueIds);
		}

		return tx.productVariant.create({
			data: {
				productId: BigInt(input.productId),
				sku: input.sku,
				name: input.name,
				price: input.price,
				oldPrice: input.oldPrice,
				stockQuantity: input.stockQuantity,
				optionValues: optionValueIds.length
					? { create: optionValueIds.map((optionValueId) => ({ optionValueId })) }
					: undefined,
			},
		});
	});

	return serialize(variant);
}

export async function updateVariant(input: UpdateVariantInput) {
	const id = BigInt(input.id);
	const optionValueIds = input.optionValueIds.map((value) => BigInt(value));

	const variant = await prisma.$transaction(async (tx) => {
		if (optionValueIds.length) {
			await assertNoDuplicateCombination(tx, BigInt(input.productId), optionValueIds, id);
		}

		const updated = await tx.productVariant.update({
			where: { id },
			data: {
				sku: input.sku,
				name: input.name,
				price: input.price,
				oldPrice: input.oldPrice,
				stockQuantity: input.stockQuantity,
			},
		});

		await tx.variantOptionValue.deleteMany({ where: { variantId: id } });
		if (optionValueIds.length) {
			await tx.variantOptionValue.createMany({
				data: optionValueIds.map((optionValueId) => ({ variantId: id, optionValueId })),
			});
		}

		return updated;
	});

	return serialize(variant);
}

export async function updateVariantStatus(id: bigint, status: "Active" | "InActive") {
	const variant = await prisma.productVariant.update({ where: { id }, data: { status } });
	return serialize(variant);
}

/** Xoá 1 biến thể — chặn nếu đã từng được đặt hàng (dữ liệu lịch sử đơn hàng không được đụng tới)
 * hoặc là biến thể duy nhất còn lại của sản phẩm (sản phẩm luôn cần ít nhất 1 biến thể để bán được). */
export async function deleteVariant(id: bigint): Promise<void> {
	const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id } });

	const orderCount = await prisma.orderItem.count({ where: { productVariantId: id } });
	if (orderCount > 0) {
		throw new Error("Không thể xoá biến thể đã từng được đặt hàng — hãy chuyển sang trạng thái Ngừng bán thay vì xoá");
	}

	const siblingCount = await prisma.productVariant.count({ where: { productId: variant.productId } });
	if (siblingCount <= 1) {
		throw new Error("Không thể xoá biến thể duy nhất của sản phẩm — hãy xoá cả sản phẩm hoặc thêm biến thể khác trước");
	}

	const images = await prisma.productImage.findMany({ where: { productVariantId: id } });

	await prisma.$transaction([
		prisma.cartItem.deleteMany({ where: { productVariantId: id } }),
		prisma.productImage.deleteMany({ where: { productVariantId: id } }),
		prisma.variantOptionValue.deleteMany({ where: { variantId: id } }),
		prisma.productVariant.delete({ where: { id } }),
	]);

	await Promise.all(images.map((image) => deleteImageFile(image.url)));
}

/** Xoá toàn bộ sản phẩm (kèm option/variant/ảnh) — chặn nếu bất kỳ biến thể nào đã từng được đặt hàng. */
export async function deleteProduct(id: bigint): Promise<void> {
	const variantIds = (await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } })).map(
		(v) => v.id,
	);

	if (variantIds.length > 0) {
		const orderCount = await prisma.orderItem.count({ where: { productVariantId: { in: variantIds } } });
		if (orderCount > 0) {
			throw new Error(
				"Không thể xoá sản phẩm đã có đơn hàng liên quan — hãy chuyển các biến thể sang Ngừng bán thay vì xoá",
			);
		}
	}

	const [images, optionIds] = await Promise.all([
		prisma.productImage.findMany({ where: { productVariantId: { in: variantIds } } }),
		prisma.productOption
			.findMany({ where: { productId: id }, select: { id: true } })
			.then((options) => options.map((o) => o.id)),
	]);

	await prisma.$transaction([
		prisma.cartItem.deleteMany({ where: { productVariantId: { in: variantIds } } }),
		prisma.productImage.deleteMany({ where: { productVariantId: { in: variantIds } } }),
		prisma.variantOptionValue.deleteMany({ where: { variantId: { in: variantIds } } }),
		prisma.productVariant.deleteMany({ where: { productId: id } }),
		prisma.productOptionValue.deleteMany({ where: { optionId: { in: optionIds } } }),
		prisma.productOption.deleteMany({ where: { productId: id } }),
		prisma.product.delete({ where: { id } }),
	]);

	await Promise.all(images.map((image) => deleteImageFile(image.url)));
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PUBLIC_UPLOAD_PATH = "/uploads/products";

/**
 * Lưu file ảnh vào ổ đĩa cục bộ (public/uploads/products). Phù hợp cho deploy
 * dạng server chạy liên tục (VD: VPS, Docker); nếu sau này chuyển sang nền
 * tảng serverless/edge (filesystem không bền), cần thay bằng object storage
 * (S3/R2/Supabase Storage) — không làm trước vì hiện chưa cần (YAGNI).
 */
async function saveImageFile(file: File): Promise<string> {
	await mkdir(UPLOAD_DIR, { recursive: true });

	const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
	const filename = `${randomUUID()}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	await writeFile(path.join(UPLOAD_DIR, filename), buffer);
	return `${PUBLIC_UPLOAD_PATH}/${filename}`;
}

async function deleteImageFile(url: string): Promise<void> {
	if (!url.startsWith(PUBLIC_UPLOAD_PATH)) return; // ảnh không phải do hệ thống upload (dữ liệu cũ) thì bỏ qua

	const filename = url.slice(PUBLIC_UPLOAD_PATH.length + 1);
	await unlink(path.join(UPLOAD_DIR, filename)).catch(() => undefined); // file có thể đã bị xoá thủ công, không chặn thao tác DB
}

export async function uploadProductImage(input: UploadProductImageInput) {
	const url = await saveImageFile(input.file);

	const image = await prisma.$transaction(async (tx) => {
		if (input.isPrimary) {
			await tx.productImage.updateMany({
				where: { productVariantId: BigInt(input.productVariantId), isPrimary: true },
				data: { isPrimary: false },
			});
		}

		return tx.productImage.create({
			data: {
				productVariantId: BigInt(input.productVariantId),
				url,
				altText: input.altText,
				sortOrder: input.sortOrder,
				isPrimary: input.isPrimary,
			},
		});
	});

	return serialize(image);
}

/** Đặt 1 ảnh làm ảnh chính của variant — tự động bỏ cờ ảnh chính cũ (mỗi variant chỉ có 1 ảnh chính). */
export async function setPrimaryImage(id: bigint) {
	const image = await prisma.productImage.findUniqueOrThrow({ where: { id } });

	await prisma.$transaction([
		prisma.productImage.updateMany({
			where: { productVariantId: image.productVariantId, isPrimary: true },
			data: { isPrimary: false },
		}),
		prisma.productImage.update({ where: { id }, data: { isPrimary: true } }),
	]);
}

export async function deleteImage(id: bigint) {
	const image = await prisma.productImage.findUniqueOrThrow({ where: { id } });
	await prisma.productImage.delete({ where: { id } });
	await deleteImageFile(image.url);
}
