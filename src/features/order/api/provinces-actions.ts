"use server";

import { getProvinces, getWardsByProvince } from "./provinces";

export async function getProvincesAction() {
	return getProvinces();
}

export async function getWardsAction(provinceCode: number) {
	return getWardsByProvince(provinceCode);
}
