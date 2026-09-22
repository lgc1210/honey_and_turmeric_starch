import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "@node-rs/argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const passwordHash = (password: string) => hash(password);

async function main() {
	const admin = await prisma.admin.upsert({
		where: { email: "admin@kimbacstore.vn" },
		update: {},
		create: {
			email: "admin@kimbacstore.vn",
			passwordHash: await passwordHash(process.env.ADMIN_SEED_PASSWORD ?? "Admin123!"),
		},
	});
	await prisma.adminTwoFactorSettings.upsert({
		where: { adminId: admin.id },
		update: {},
		create: { adminId: admin.id },
	});
	const honey = await prisma.category.upsert({
		where: { slug: "mat-ong" },
		update: {},
		create: { name: "Mật ong", slug: "mat-ong", description: "Mật ong tự nhiên" },
	});
	const turmeric = await prisma.category.upsert({
		where: { slug: "tinh-bot-nghe" },
		update: {},
		create: { name: "Tinh bột nghệ", slug: "tinh-bot-nghe" },
	});
	const product = await prisma.product.upsert({
		where: { slug: "mat-ong-rung-nguyen-chat" },
		update: {},
		create: {
			categoryId: honey.id,
			name: "Mật ong rừng nguyên chất",
			slug: "mat-ong-rung-nguyen-chat",
			description: "Sản phẩm đại diện cho cửa hàng",
		},
	});
	const option = await prisma.productOption.upsert({
		where: { productId_name: { productId: product.id, name: "Dung tích" } },
		update: {},
		create: { productId: product.id, name: "Dung tích" },
	});
	const value = await prisma.productOptionValue.upsert({
		where: { optionId_normalizedValue: { optionId: option.id, normalizedValue: "500ml" } },
		update: {},
		create: { optionId: option.id, value: "500ml", normalizedValue: "500ml" },
	});
	const variant = await prisma.productVariant.upsert({
		where: { sku: "MH-500" },
		update: {},
		create: { productId: product.id, sku: "MH-500", name: "500ml", price: 420000, stockQuantity: 48 },
	});
	await prisma.variantOptionValue.upsert({
		where: { variantId_optionValueId: { variantId: variant.id, optionValueId: value.id } },
		update: {},
		create: { variantId: variant.id, optionValueId: value.id },
	});
	await prisma.productImage.upsert({
		where: { id: BigInt(1) },
		update: {
			url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38",
			altText: "Mật ong rừng",
			isPrimary: true,
		},
		create: {
			productVariantId: variant.id,
			url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38",
			altText: "Mật ong rừng",
			isPrimary: true,
		},
	});
	const turmericProduct = await prisma.product.upsert({
		where: { slug: "tinh-bot-nghe-nguyen-chat" },
		update: {},
		create: {
			categoryId: turmeric.id,
			name: "Tinh bột nghệ nguyên chất",
			slug: "tinh-bot-nghe-nguyen-chat",
			description: "Tinh bột nghệ sấy lạnh",
		},
	});
	await prisma.productVariant.upsert({
		where: { sku: "NGHE-200" },
		update: {},
		create: { productId: turmericProduct.id, sku: "NGHE-200", name: "200g", price: 180000, stockQuantity: 35 },
	});
	const coupon = await prisma.coupon.upsert({
		where: { code: "CHAOMUNG10" },
		update: { usedCount: 1 },
		create: {
			code: "CHAOMUNG10",
			discountType: "Percentage",
			discountValue: 10,
			minimumOrderAmount: 300000,
			usageLimit: 100,
			usedCount: 1,
			startsAt: new Date("2025-01-01"),
			expiresAt: new Date("2030-01-01"),
		},
	});
}

main().finally(() => prisma.$disconnect());
