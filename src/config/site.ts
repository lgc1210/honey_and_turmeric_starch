export const siteConfig = Object.freeze({
	name: "Kim Bac Store",
	description: "Mật ong & tinh bột nghệ nguyên chất",
	url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const);

export const CART_COOKIE_NAME = "cart_id";
export const CART_TTL_DAYS = 30;

export const PAGINATION = Object.freeze({
	DEFAULT_PAGE: 1,
	DEFAULT_PAGE_SIZE: 12,
	ADMIN_PAGE_SIZE: 10,
	MAX_PAGE_SIZE: 100,
} as const);

export const vietnamPhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
