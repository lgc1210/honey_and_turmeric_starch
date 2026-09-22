import { unstable_cache } from "next/cache";
import { externalApi, isAxiosError } from "@/lib/axios";
import { z } from "zod";

const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24; // 1 ngày

const wardSchema = z.object({
	code: z.number(),
	name: z.string(),
});

const provinceSchema = z.object({
	code: z.number(),
	name: z.string(),
	wards: z.array(wardSchema).optional(),
});

export type Province = z.infer<typeof provinceSchema>;
export type Ward = z.infer<typeof wardSchema>;

async function fetchProvinces(): Promise<Province[]> {
	try {
		const { data } = await externalApi.get(`${process.env.PROVINCES_BASE_URL}/p/`);
		return z.array(provinceSchema).parse(data);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new Error(`Không thể tải danh sách tỉnh/thành: ${error.message}`);
		}
		throw error;
	}
}

async function fetchWardsByProvince(provinceCode: number): Promise<Ward[]> {
	try {
		const { data } = await externalApi.get(`${process.env.PROVINCES_BASE_URL}/w/`, {
			params: { province: provinceCode },
		});
		return z.array(wardSchema).parse(data ?? []);
	} catch (error) {
		if (isAxiosError(error)) {
			throw new Error(`Không thể tải danh sách phường/xã: ${error.message}`);
		}
		throw error;
	}
}

/** Lấy danh sách tỉnh/thành — cache 1 ngày, dùng chung cho mọi request */
export const getProvinces = unstable_cache(fetchProvinces, ["provinces-list"], {
	revalidate: CACHE_REVALIDATE_SECONDS,
	tags: ["provinces"],
});

/** Lấy phường/xã theo quận/huyện — cache riêng theo từng provinceCode */
export const getWardsByProvince = unstable_cache(fetchWardsByProvince, ["wards-by-province"], {
	revalidate: CACHE_REVALIDATE_SECONDS,
	tags: ["provinces"],
});
