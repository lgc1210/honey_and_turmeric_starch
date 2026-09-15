import { unstable_cache } from "next/cache";
import { externalApi, isAxiosError } from "@/lib/axios";
import { z } from "zod";

const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24; // 1 ngày

const wardSchema = z.object({
	code: z.number(),
	name: z.string(),
});

const districtSchema = z.object({
	code: z.number(),
	name: z.string(),
	wards: z.array(wardSchema).optional(),
});

const provinceSchema = z.object({
	code: z.number(),
	name: z.string(),
	districts: z.array(districtSchema).optional(),
});

export type Ward = z.infer<typeof wardSchema>;
export type District = z.infer<typeof districtSchema>;
export type Province = z.infer<typeof provinceSchema>;

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

async function fetchDistrictsByProvince(provinceCode: number): Promise<District[]> {
	try {
		const { data } = await externalApi.get(`${process.env.PROVINCES_BASE_URL}/p/${provinceCode}`, {
			params: { depth: 2 },
		});
		return provinceSchema.parse(data).districts ?? [];
	} catch (error) {
		if (isAxiosError(error)) {
			throw new Error(`Không thể tải danh sách quận/huyện: ${error.message}`);
		}
		throw error;
	}
}

async function fetchWardsByDistrict(districtCode: number): Promise<Ward[]> {
	try {
		const { data } = await externalApi.get(`${process.env.PROVINCES_BASE_URL}/d/${districtCode}`, {
			params: { depth: 2 },
		});
		return districtSchema.parse(data).wards ?? [];
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

/** Lấy quận/huyện theo tỉnh — cache riêng theo từng provinceCode */
export const getDistrictsByProvince = unstable_cache(fetchDistrictsByProvince, ["districts-by-province"], {
	revalidate: CACHE_REVALIDATE_SECONDS,
	tags: ["provinces"],
});

/** Lấy phường/xã theo quận/huyện — cache riêng theo từng districtCode */
export const getWardsByDistrict = unstable_cache(fetchWardsByDistrict, ["wards-by-district"], {
	revalidate: CACHE_REVALIDATE_SECONDS,
	tags: ["provinces"],
});
