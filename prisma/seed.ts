import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const passwordHash = (password: string) => {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};

async function main() {
	const admin = await prisma.admin.upsert({ where: { email: "admin@kimbacstore.vn" }, update: {}, create: { email: "admin@kimbacstore.vn", passwordHash: passwordHash(process.env.ADMIN_SEED_PASSWORD ?? "Admin123!") } });
	await prisma.adminTwoFactorSettings.upsert({ where: { adminId: admin.id }, update: {}, create: { adminId: admin.id } });
	const honey = await prisma.category.upsert({ where: { slug: "mat-ong" }, update: {}, create: { name: "Mật ong", slug: "mat-ong", description: "Mật ong tự nhiên" } });
	const turmeric = await prisma.category.upsert({ where: { slug: "tinh-bot-nghe" }, update: {}, create: { name: "Tinh bột nghệ", slug: "tinh-bot-nghe" } });
	const product = await prisma.product.upsert({ where: { slug: "mat-ong-rung-nguyen-chat" }, update: {}, create: { categoryId: honey.id, name: "Mật ong rừng nguyên chất", slug: "mat-ong-rung-nguyen-chat", description: "Sản phẩm đại diện cho cửa hàng" } });
	const option = await prisma.productOption.upsert({ where: { productId_name: { productId: product.id, name: "Dung tích" } }, update: {}, create: { productId: product.id, name: "Dung tích" } });
	const value = await prisma.productOptionValue.upsert({ where: { optionId_normalizedValue: { optionId: option.id, normalizedValue: "500ml" } }, update: {}, create: { optionId: option.id, value: "500ml", normalizedValue: "500ml" } });
	const variant = await prisma.productVariant.upsert({ where: { sku: "MH-500" }, update: {}, create: { productId: product.id, sku: "MH-500", name: "500ml", price: 420000, stockQuantity: 48 } });
	await prisma.variantOptionValue.upsert({ where: { variantId_optionValueId: { variantId: variant.id, optionValueId: value.id } }, update: {}, create: { variantId: variant.id, optionValueId: value.id } });
	const cart = await prisma.cart.upsert({ where: { id: "seed-cart" }, update: {}, create: { id: "seed-cart" } });
	const item = await prisma.cartItem.upsert({ where: { cartId_productVariantId: { cartId: cart.id, productVariantId: variant.id } }, update: {}, create: { cartId: cart.id, productVariantId: variant.id, quantity: 2 } });
	const existingOrder = await prisma.order.findUnique({ where: { orderNumber: "HT-SEED-001" } });
	if (!existingOrder) {
		await prisma.order.create({ data: { cartId: cart.id, orderNumber: "HT-SEED-001", recipientName: "Nguyễn Thị Lan", recipientEmail: "lan@example.com", recipientPhone: "0900000000", shippingProvince: "Hà Nội", shippingDistrict: "Cầu Giấy", shippingWard: "Dịch Vọng", shippingAddress: "1 Đường Mẫu", subtotal: 840000, totalAmount: 840000, status: "Confirmed", items: { create: { productVariantId: variant.id, productName: product.name, sku: variant.sku, variantName: variant.name, unitPrice: variant.price, quantity: item.quantity, subtotal: 840000 } }, payments: { create: { provider: "COD", amount: 840000, status: "Pending" } } } });
	}
	console.log(`Seeded admin ${admin.email}, categories ${honey.name}/${turmeric.name}`);
}

main().finally(() => prisma.$disconnect());
