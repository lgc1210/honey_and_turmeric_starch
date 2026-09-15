export const adminNavItems = [
	{ href: "/admin/dashboard", label: "Tổng quan", icon: "Dashboard" },
	{ href: "/admin/products", label: "Sản phẩm", icon: "Products" },
	{ href: "/admin/categories", label: "Danh mục", icon: "Categories" },
	{ href: "/admin/orders", label: "Đơn hàng", icon: "Orders" },
	{ href: "/admin/accounts", label: "Tài khoản", icon: "Accounts" },
] as const;

export const dashboardMetrics = [
	{ label: "Doanh thu hôm nay", value: "₫48.6M", delta: "+12.4%", tone: "primary" },
	{ label: "Đơn hàng mới", value: "184", delta: "+8.1%", tone: "accent" },
	{ label: "Tỉ lệ hoàn tất", value: "96.2%", delta: "+1.7%", tone: "success" },
	{ label: "Sản phẩm hết hàng", value: "7", delta: "-3", tone: "warning" },
] as const;

export const recentOrders = [
	{ id: "#HT-2048", customer: "Nguyễn Thị Lan", amount: "₫1.860.000", status: "Đang xử lý", channel: "COD" },
	{ id: "#HT-2047", customer: "Trần Minh Huy", amount: "₫2.420.000", status: "Đã xác nhận", channel: "Banking" },
	{ id: "#HT-2046", customer: "Lê Hoài Nam", amount: "₫890.000", status: "Hoàn thành", channel: "Momo" },
	{ id: "#HT-2045", customer: "Phạm Thanh Tâm", amount: "₫1.290.000", status: "Chờ thanh toán", channel: "COD" },
] as const;

export const inventoryAlerts = [
	{ product: "Mật ong rừng nguyên chất", stock: 5, sku: "MH-001" },
	{ product: "Tinh bột nghệ vàng", stock: 3, sku: "NT-010" },
	{ product: "Set quà sức khỏe", stock: 2, sku: "BOX-008" },
] as const;

export const productRows = [
	{ name: "Mật ong rừng nguyên chất", category: "Mật ong", sku: "MH-001", stock: 48, price: "₫420.000", status: "Active" },
	{ name: "Tinh bột nghệ vàng", category: "Nghệ", sku: "NT-010", stock: 13, price: "₫290.000", status: "Active" },
	{ name: "Combo chăm sóc da", category: "Combo", sku: "COM-014", stock: 9, price: "₫560.000", status: "Draft" },
	{ name: "Hộp quà sức khỏe", category: "Quà tặng", sku: "BOX-008", stock: 2, price: "₫760.000", status: "Inactive" },
] as const;

export const categoryTree = [
	{ name: "Mật ong", count: 12, type: "Parent" },
	{ name: "Nghệ", count: 8, type: "Parent" },
	{ name: "Combo chăm sóc", count: 5, type: "Parent" },
	{ name: "Quà tặng", count: 4, type: "Parent" },
] as const;

export const accountRows = [
	{ name: "Nguyễn Thị Hạnh", role: "Admin tổng", email: "admin@kimbacstore.vn", status: "Online" },
	{ name: "Trần Quốc Đạt", role: "Quản lý đơn hàng", email: "ops@kimbacstore.vn", status: "Offline" },
	{ name: "Bùi Hồng Nhung", role: "Chăm sóc khách hàng", email: "support@kimbacstore.vn", status: "Online" },
] as const;

export const recentActivity = [
	"Đã cập nhật 2 biến thể cho bộ sưu tập Mật ong đặc sản.",
	"Khách hàng #HT-2048 đã xác nhận thanh toán COD thành công.",
	"Danh mục 'Quà tặng' được bổ sung 3 sản phẩm mới.",
	"Báo cáo tồn kho tuần này đã được gửi cho team.",
] as const;
