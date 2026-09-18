import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeOptionValue } from "@/lib/utils";
import { serialize } from "@/lib/serialize";
import { PAGINATION } from "@/config/site";
import type {
	CreateProductInput,
	CreateVariantInput,
	ProductImageInput,
	ProductQuery,
	UpdateProductInput,
	UpdateVariantInput,
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
	const category = await prisma.category.findUnique({ where: { id: BigInt(input.categoryId) } });
	if (!category) throw new Error("Danh mục không tồn tại");

	const product = await prisma.$transaction(async (tx) => {
		const created = await tx.product.create({
			data: {
				categoryId: BigInt(input.categoryId),
				name: input.name,
				slug: await uniqueProductSlug(input.slug || input.name),
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
	});

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

export async function upsertImage(input: ProductImageInput) {
	const data = {
		url: input.url,
		altText: input.altText,
		sortOrder: input.sortOrder,
		isPrimary: input.isPrimary,
	};

	const image = input.id
		? await prisma.productImage.update({ where: { id: BigInt(input.id) }, data })
		: await prisma.productImage.create({ data: { ...data, productVariantId: BigInt(input.productVariantId) } });

	return serialize(image);
}

export async function deleteImage(id: bigint) {
	await prisma.productImage.delete({ where: { id } });
}
