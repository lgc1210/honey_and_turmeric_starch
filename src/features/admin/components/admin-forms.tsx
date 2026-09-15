"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, createProductAction, loginAction, updateOrderStatusAction } from "../api/actions";

export function LoginForm() {
	const [error, setError] = useState("");
	const router = useRouter();
	return <form className="space-y-4" action={async (formData) => {
		const result = await loginAction({ email: formData.get("email"), password: formData.get("password"), remember: formData.get("remember") === "on" });
		if (!result.success) setError(result.error);
		else router.push("/admin/dashboard");
	}}>
		<input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border p-3" />
		<input name="password" type="password" required minLength={8} placeholder="Mật khẩu" className="w-full rounded-xl border p-3" />
		<label className="flex gap-2 text-sm"><input name="remember" type="checkbox" /> Ghi nhớ đăng nhập</label>
		{error && <p className="text-sm text-red-600">{error}</p>}
		<button className="w-full rounded-xl bg-[#f5cb63] px-4 py-3 font-semibold">Đăng nhập</button>
	</form>;
}

export function CategoryForm() {
	const [message, setMessage] = useState("");
	return <form className="grid gap-2 rounded-xl border p-4 md:grid-cols-4" action={async (fd) => {
		const result = await createCategoryAction({ name: fd.get("name"), slug: fd.get("slug"), description: fd.get("description") });
		setMessage(result.success ? "Đã tạo danh mục" : result.error);
		if (result.success) window.location.reload();
	}}>
		<input name="name" required placeholder="Tên danh mục" className="rounded-lg border p-2" />
		<input name="slug" required placeholder="slug" className="rounded-lg border p-2" />
		<input name="description" placeholder="Mô tả" className="rounded-lg border p-2" />
		<button className="rounded-lg bg-[#f5cb63] px-3 py-2">Thêm</button>
		{message && <p className="text-sm">{message}</p>}
	</form>;
}

export function ProductForm({ categories }: { categories: { id: string; name: string }[] }) {
	const [message, setMessage] = useState("");
	return <form className="space-y-2 rounded-xl border p-4" action={async (fd) => {
		let variants: unknown;
		let options: unknown;
		try { variants = JSON.parse(String(fd.get("variants"))); options = JSON.parse(String(fd.get("options") || "[]")); } catch { setMessage("Options và variants phải là JSON hợp lệ"); return; }
		const result = await createProductAction({ categoryId: fd.get("categoryId"), name: fd.get("name"), slug: fd.get("slug"), description: fd.get("description"), options, variants });
		setMessage(result.success ? "Đã tạo sản phẩm" : result.error);
		if (result.success) window.location.reload();
	}}>
		<div className="grid gap-2 md:grid-cols-3"><input name="name" required placeholder="Tên sản phẩm" className="rounded-lg border p-2" /><input name="slug" required placeholder="slug" className="rounded-lg border p-2" /><select name="categoryId" required className="rounded-lg border p-2">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
		<input name="description" placeholder="Mô tả" className="w-full rounded-lg border p-2" />
		<textarea name="options" defaultValue="[]" className="min-h-16 w-full rounded-lg border p-2 font-mono text-sm" placeholder='Options JSON: [{"name":"Dung tích","values":["500ml"]}]' />
		<textarea name="variants" required defaultValue={'[{"sku":"SKU-001","name":"Mặc định","price":100000,"stockQuantity":10,"optionValues":[]}]'} className="min-h-24 w-full rounded-lg border p-2 font-mono text-sm" />
		<button className="rounded-lg bg-[#f5cb63] px-3 py-2">Thêm sản phẩm</button>{message && <span className="ml-3 text-sm">{message}</span>}
	</form>;
}

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
	return <select defaultValue={status} className="rounded border p-1 text-sm" onChange={async (e) => { await updateOrderStatusAction({ orderId, status: e.target.value }); }}>{["Pending", "Confirmed", "Processing", "Completed", "Cancelled"].map((value) => <option key={value}>{value}</option>)}</select>;
}
