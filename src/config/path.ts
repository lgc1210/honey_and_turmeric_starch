export default Object.freeze({
	admin: {
		auth: "/admin/auth",
		products: "/admin/products",
		newProduct: "/admin/products/new",
		categories: "/admin/categories",
		orders: "/admin/orders",
		accounts: "/admin/accounts",
		coupons: "/admin/coupons",
		dashboard: "/admin/dashboard",
		payments: "/admin/payments",
	},
	client: {
		home: "/",
		cart: "/cart",
		checkout: "/checkout",
		products: "/products",
		product: (slug: string) => `/products/${slug}`,
	},
} as const);
