export type CategoryTreeSource = { id: string; name: string; parentId: string | null };
export type CategoryTreeOption<T extends CategoryTreeSource> = T & { depth: number };

/**
 * Sắp xếp danh sách category phẳng thành thứ tự cây (DFS: cha trước, con ngay sau),
 * kèm `depth` để render <select> có thụt lề thể hiện quan hệ cha/con.
 * Danh mục có parentId trỏ tới id không tồn tại trong danh sách được coi là gốc.
 */
export function flattenCategoryTree<T extends CategoryTreeSource>(categories: T[]): CategoryTreeOption<T>[] {
	const byParent = new Map<string | null, T[]>();

	for (const category of categories) {
		const key = category.parentId && categories.some((c) => c.id === category.parentId) ? category.parentId : null;
		if (!byParent.has(key)) byParent.set(key, []);
		byParent.get(key)!.push(category);
	}

	const result: CategoryTreeOption<T>[] = [];

	function walk(parentId: string | null, depth: number) {
		for (const category of byParent.get(parentId) ?? []) {
			result.push({ ...category, depth });
			walk(category.id, depth + 1);
		}
	}

	walk(null, 0);
	return result;
}

/** Nhãn hiển thị trong <option> có thụt lề theo depth. */
export function categoryOptionLabel(name: string, depth: number): string {
	return depth === 0 ? name : `${"\u00A0\u00A0\u00A0\u00A0".repeat(depth)}└ ${name}`;
}
