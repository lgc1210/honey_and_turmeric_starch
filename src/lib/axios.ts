import axios, { AxiosError } from "axios";

/**
 * Client dùng cho các API bên thứ ba (external), không phải API nội bộ.
 * Ví dụ: API tỉnh/thành Việt Nam.
 *
 * Vì dự án dùng Server Actions cho toàn bộ logic nội bộ, axios ở đây
 * CHỈ phục vụ mục đích gọi ra ngoài — không dùng để gọi route handler
 * của chính app này.
 */
export const externalApi = axios.create({
	timeout: 8000,
	headers: { Accept: "application/json" },
});

// Retry đơn giản cho lỗi mạng/timeout — API bên thứ ba đôi khi chập chờn
externalApi.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const config = error.config as typeof error.config & {
			_retryCount?: number;
		};

		const isNetworkOrTimeout = !error.response && (error.code === "ECONNABORTED" || error.message === "Network Error");

		if (isNetworkOrTimeout && config && (config._retryCount ?? 0) < 2) {
			config._retryCount = (config._retryCount ?? 0) + 1;
			await new Promise((r) => setTimeout(r, 500 * config._retryCount!));
			return externalApi.request(config);
		}

		return Promise.reject(error);
	},
);

/** Type guard tiện dùng khi catch lỗi từ externalApi */
export function isAxiosError(error: unknown): error is AxiosError {
	return axios.isAxiosError(error);
}
