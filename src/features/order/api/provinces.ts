import { externalApi, isAxiosError } from "@/lib/axios";
import { z } from "zod";

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

/** Lấy danh sách tỉnh/thành (không kèm quận/huyện) */
export async function getProvinces(): Promise<Province[]> {
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

/** Lấy 1 tỉnh kèm danh sách quận/huyện (depth=2) */
export async function getDistrictsByProvince(provinceCode: number): Promise<District[]> {
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

/** Lấy 1 quận/huyện kèm danh sách phường/xã (depth=2) */
export async function getWardsByDistrict(districtCode: number): Promise<Ward[]> {
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
