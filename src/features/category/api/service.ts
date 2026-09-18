import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { serialize } from "@/lib/serialize";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schema";
import { EntityStatus } from "@/generated/prisma/enums";

async function uniqueCategorySlug(input: string, excludeId?: bigint): Promise<string> {
	const base = slugify(input) || "danh-muc";
	let slug = base;
	let suffix = 1;

	while (true) {
		const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
		if (!existing || existing.id === excludeId) return slug;
		slug = `${base}-${suffix++}`;
	}
}

async function assertNoCycle(newParentId: bigint, categoryId: bigint): Promise<void> {
	let current: bigint | null = newParentId;

	while (current) {
		if (current === categoryId) {
			throw new Error("Không thể chọn danh mục con của chính nó làm danh mục cha");
		}
		const parentCategory: { parentId: bigint | null } | null = await prisma.category.findUnique({
			where: { id: current },
			select: { parentId: true },
		});
		current = parentCategory?.parentId ?? null;
	}
}

async function assertNoChildrenOrProducts(id: bigint, action: "ngừng bán" | "xoá"): Promise<void> {
	const [childCount, productCount] = await Promise.all([
		prisma.category.count({ where: { parentId: id } }),
		prisma.product.count({ where: { categoryId: id } }),
	]);

	if (childCount > 0)
		throw new Error(`Không thể ${action} danh mục đang có danh mục con — hãy xử lý danh mục con trước`);
	if (productCount > 0)
		throw new Error(`Không thể ${action} danh mục đang có sản phẩm — hãy chuyển sản phẩm sang danh mục khác trước`);
}

/** Danh sách danh mục kèm số sản phẩm — dùng cho trang quản lý danh mục. */
export async function getAdminCategories() {
	const categories = await prisma.category.findMany({
		include: { _count: { select: { products: true } }, parent: { select: { id: true, name: true } } },
		orderBy: { name: "asc" },
	});
	return serialize(categories);
}

/** Danh mục đang Active — dùng cho select trong form sản phẩm. */
export async function getActiveCategoryOptions() {
	const categories = await prisma.category.findMany({
		where: { status: EntityStatus.Active },
		select: { id: true, name: true },
		orderBy: { name: "asc" },
	});
	return serialize(categories);
}

export async function createCategory(input: CreateCategoryInput) {
	if (input.parentId) {
		const parent = await prisma.category.findUnique({ where: { id: BigInt(input.parentId) } });
		if (!parent) throw new Error("Danh mục cha không tồn tại");
	}

	const category = await prisma.category.create({
		data: {
			name: input.name,
			slug: await uniqueCategorySlug(input.slug || input.name),
			description: input.description,
			parentId: input.parentId ? BigInt(input.parentId) : null,
		},
	});

	return serialize(category);
}

export async function updateCategory(input: UpdateCategoryInput) {
	const id = BigInt(input.id);

	if (input.parentId) {
		const newParentId = BigInt(input.parentId);
		if (newParentId === id) throw new Error("Danh mục không thể là danh mục cha của chính nó");
		await assertNoCycle(newParentId, id);
	}

	const category = await prisma.category.update({
		where: { id },
		data: {
			name: input.name,
			slug: await uniqueCategorySlug(input.slug || input.name, id),
			description: input.description,
			parentId: input.parentId ? BigInt(input.parentId) : null,
		},
	});

	return serialize(category);
}

export async function updateCategoryStatus(id: bigint, status: EntityStatus) {
	if (status === EntityStatus.InActive) {
		await assertNoChildrenOrProducts(id, "ngừng bán");
	}

	const category = await prisma.category.update({ where: { id }, data: { status } });
	return serialize(category);
}

export async function deleteCategory(id: bigint) {
	await assertNoChildrenOrProducts(id, "xoá");
	await prisma.category.delete({ where: { id } });
}
