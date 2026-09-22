import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { CART_TTL_DAYS } from "@/config/site";
import { generateCartId, readCartIdCookie, writeCartIdCookie } from "@/lib/cart-cookie";
import type { AddToCartInput } from "../schema";

async function ensureCartExists(cartId: string) {
	await prisma.cart.upsert({
		where: { id: cartId },
		update: {},
		create: { id: cartId, expiresAt: new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000) },
	});
}

/** Chỉ đọc cookie, KHÔNG bao giờ ghi — an toàn để gọi ở bất kỳ Server Component nào
 * (SiteHeader, trang chủ, trang giỏ hàng...). Chưa có cookie thì coi như chưa có giỏ hàng. */
export async function getCartId(): Promise<string | null> {
	return readCartIdCookie();
}

/** Tạo mới nếu chưa có + GHI cookie — Next.js chỉ cho phép ghi cookie trong Server
 * Action/Route Handler, nên hàm này CHỈ được gọi từ trong Server Action (VD:
 * addToCartAction, checkoutAction), không bao giờ gọi trực tiếp từ Server Component. */
export async function getOrCreateCartId(): Promise<string> {
	const existing = await readCartIdCookie();
	if (existing) {
		await ensureCartExists(existing); // phòng khi cookie còn nhưng Cart đã bị dọn dẹp/hết hạn ở DB
		return existing;
	}

	const cartId = generateCartId();
	await ensureCartExists(cartId);
	await writeCartIdCookie(cartId);
	return cartId;
}

export async function getCart(cartId: string | null) {
	if (!cartId) {
		return {
			items: [] as Awaited<ReturnType<typeof buildCartItems>>,
			subtotal: 0,
			itemCount: 0,
		};
	}

	const items = await buildCartItems(cartId);
	const subtotal = items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

	return { items, subtotal, itemCount };
}

async function buildCartItems(cartId: string) {
	const items = await prisma.cartItem.findMany({
		where: { cartId },
		orderBy: { createdAt: "asc" },
		include: {
			variant: {
				include: {
					product: { select: { id: true, name: true, slug: true, status: true } },
					images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
					optionValues: { include: { optionValue: true } },
				},
			},
		},
	});

	return serialize(items);
}

export async function getCartItemCount(cartId: string | null): Promise<number> {
	if (!cartId) return 0;
	const result = await prisma.cartItem.aggregate({ where: { cartId }, _sum: { quantity: true } });
	return result._sum.quantity ?? 0;
}

export async function addToCart(cartId: string, input: AddToCartInput): Promise<void> {
	const variant = await prisma.productVariant.findUnique({ where: { id: BigInt(input.productVariantId) } });
	if (!variant || variant.status !== "Active") throw new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");

	const existing = await prisma.cartItem.findUnique({
		where: { cartId_productVariantId: { cartId, productVariantId: variant.id } },
	});

	const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
	if (nextQuantity > variant.stockQuantity) {
		throw new Error(`Chỉ còn ${variant.stockQuantity} sản phẩm trong kho`);
	}

	await prisma.cartItem.upsert({
		where: { cartId_productVariantId: { cartId, productVariantId: variant.id } },
		update: { quantity: nextQuantity },
		create: { cartId, productVariantId: variant.id, quantity: input.quantity },
	});
}

export async function updateCartItemQuantity(cartId: string, cartItemId: bigint, quantity: number): Promise<void> {
	const item = await prisma.cartItem.findUniqueOrThrow({ where: { id: cartItemId }, include: { variant: true } });
	if (item.cartId !== cartId) throw new Error("Không có quyền thao tác trên giỏ hàng này");
	if (quantity > item.variant.stockQuantity)
		throw new Error(`Chỉ còn ${item.variant.stockQuantity} sản phẩm trong kho`);

	await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
}

export async function removeCartItem(cartId: string, cartItemId: bigint): Promise<void> {
	const item = await prisma.cartItem.findUniqueOrThrow({ where: { id: cartItemId } });
	if (item.cartId !== cartId) throw new Error("Không có quyền thao tác trên giỏ hàng này");

	await prisma.cartItem.delete({ where: { id: cartItemId } });
}
