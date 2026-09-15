export type ActionResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type PaginatedResult<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;
