# Design System

Tài liệu này ghi lại các quyết định thiết kế trực quan (màu sắc, hình
khối, typography...). Khác với `AGENTS.md` — file đó là quy ước _hành
vi code_, file này là quy ước _hình ảnh_.

---

## Hình khối (Shape)

**Quy tắc: UI sắc nét, không bo góc.**

- `--radius` trong `src/app/globals.css` được set về `0rem`.
- Mọi component shadcn/ui (Button, Card, Input, Dialog, Badge...) đều
  kế thừa giá trị này qua các biến `--radius-sm/md/lg/xl/2xl/3xl/4xl`
  — không cần sửa từng component riêng lẻ.
- Khi thêm component shadcn mới (`npx shadcn add ...`), kiểm tra lại
  component đó có dùng class `rounded-*` hardcode (không qua biến
  `--radius`) hay không — nếu có, sửa thủ công về `rounded-none`.

**Ngoại lệ — không tự động áp dụng theo token trên:**

- `rounded-full` dùng cho phần tử có chủ đích là hình tròn (Avatar,
  Radio, loading spinner...) — đây không phải "góc bo" mà là hình
  dạng tròn hoàn chỉnh, không thuộc phạm vi quy tắc "không bo góc".
  Nếu muốn các phần tử này cũng vuông, cần quyết định riêng và liệt
  kê rõ ở đây.

---

## Màu sắc

**Định hướng: tông ấm, tự nhiên, tối giản** — lấy cảm hứng từ chính
sản phẩm (mật ong, nghệ): nền kem ngà, chữ nâu espresso, điểm nhấn
vàng nghệ và đất nung. Không dùng màu bão hoà cao/neon — giữ cảm giác
thủ công, thanh lịch, dễ đọc lâu.

- **Primary — Vàng nghệ (turmeric gold):** màu thương hiệu chính, dùng
  cho CTA, link, trạng thái active.
- **Accent — Đất nung (terracotta):** điểm nhấn phụ, dùng cho badge,
  hover state nổi bật, không lấn át primary.
- **Background — Kem ngà (ivory):** nền tổng thể ấm, không dùng trắng
  thuần lạnh (`#fff`) cho nền lớn — card vẫn dùng trắng thuần để tạo
  độ tương phản nhẹ với nền.
- **Foreground — Nâu espresso đậm:** thay cho đen thuần, giữ tông ấm
  xuyên suốt kể cả ở phần chữ.

Áp dụng vào `src/app/globals.css`, thay các giá trị `oklch(...)` hiện
tại trong `:root` và `.dark`:

```css
:root {
	--background: oklch(0.98 0.012 85);
	--foreground: oklch(0.24 0.03 50);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.24 0.03 50);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.24 0.03 50);
	--primary: oklch(0.62 0.14 75);
	--primary-foreground: oklch(0.99 0.01 85);
	--secondary: oklch(0.94 0.02 70);
	--secondary-foreground: oklch(0.3 0.04 50);
	--muted: oklch(0.95 0.012 75);
	--muted-foreground: oklch(0.48 0.02 55);
	--accent: oklch(0.68 0.13 45);
	--accent-foreground: oklch(0.99 0.01 85);
	--destructive: oklch(0.58 0.21 25);
	--border: oklch(0.9 0.015 70);
	--input: oklch(0.9 0.015 70);
	--ring: oklch(0.62 0.14 75);
	--chart-1: oklch(0.62 0.14 75);
	--chart-2: oklch(0.68 0.13 45);
	--chart-3: oklch(0.45 0.08 40);
	--chart-4: oklch(0.78 0.09 90);
	--chart-5: oklch(0.35 0.03 50);
	--sidebar: oklch(0.96 0.015 75);
	--sidebar-foreground: oklch(0.24 0.03 50);
	--sidebar-primary: oklch(0.62 0.14 75);
	--sidebar-primary-foreground: oklch(0.99 0.01 85);
	--sidebar-accent: oklch(0.92 0.02 70);
	--sidebar-accent-foreground: oklch(0.3 0.04 50);
	--sidebar-border: oklch(0.9 0.015 70);
	--sidebar-ring: oklch(0.62 0.14 75);
}

.dark {
	--background: oklch(0.18 0.02 50);
	--foreground: oklch(0.95 0.015 80);
	--card: oklch(0.22 0.02 50);
	--card-foreground: oklch(0.95 0.015 80);
	--popover: oklch(0.22 0.02 50);
	--popover-foreground: oklch(0.95 0.015 80);
	--primary: oklch(0.72 0.15 75);
	--primary-foreground: oklch(0.18 0.02 50);
	--secondary: oklch(0.28 0.025 50);
	--secondary-foreground: oklch(0.92 0.015 80);
	--muted: oklch(0.26 0.02 50);
	--muted-foreground: oklch(0.65 0.02 60);
	--accent: oklch(0.62 0.13 45);
	--accent-foreground: oklch(0.97 0.01 85);
	--destructive: oklch(0.65 0.2 25);
	--border: oklch(0.32 0.02 50);
	--input: oklch(0.32 0.02 50);
	--ring: oklch(0.72 0.15 75);
	--chart-1: oklch(0.72 0.15 75);
	--chart-2: oklch(0.62 0.13 45);
	--chart-3: oklch(0.8 0.1 90);
	--chart-4: oklch(0.5 0.06 40);
	--chart-5: oklch(0.85 0.02 80);
	--sidebar: oklch(0.2 0.02 50);
	--sidebar-foreground: oklch(0.95 0.015 80);
	--sidebar-primary: oklch(0.72 0.15 75);
	--sidebar-primary-foreground: oklch(0.18 0.02 50);
	--sidebar-accent: oklch(0.28 0.025 50);
	--sidebar-accent-foreground: oklch(0.92 0.015 80);
	--sidebar-border: oklch(0.32 0.02 50);
	--sidebar-ring: oklch(0.72 0.15 75);
}
```

**Quy tắc dùng màu:**

- `primary` (vàng nghệ) chỉ dùng cho hành động chính: nút "Thêm vào
  giỏ", "Đặt hàng", link quan trọng — không dùng tràn lan cho mọi
  button, tránh loãng trọng tâm thị giác.
- `accent` (đất nung) dùng cho: badge giảm giá, trạng thái "Hết hàng"
  nhẹ, hover nổi bật trên card sản phẩm.
- `destructive` giữ nguyên tông đỏ ấm (không đỏ tươi lạnh) để nhất
  quán với tổng thể, vẫn đủ tương phản để nhận biết là cảnh báo.
- Không tự thêm màu mới ngoài bảng token này khi build UI — nếu thiếu
  case cụ thể (ví dụ màu riêng cho trạng thái `Processing` của đơn
  hàng), dùng lại `chart-1..5` đã có sẵn thay vì tạo màu tuỳ hứng.

## Typography

**Font: Be Vietnam Pro** — cấu hình tại `src/app/layout.tsx` qua
`next/font/google`.

```ts
const beVietnamPro = Be_Vietnam_Pro({
	subsets: ["vietnamese"], // bắt buộc — thiếu sẽ lỗi/mất dấu tiếng Việt
	weight: ["400", "500", "600", "700"],
	variable: "--font-be-vietnam",
});
```

- Biến `--font-be-vietnam` được set làm `--font-sans` trong
  `globals.css` (`@theme inline`) — toàn bộ text mặc định dùng font
  này, không cần khai `font-be-vietnam` thủ công ở từng component.
- `--font-heading` hiện đang trỏ về cùng `--font-sans` (chưa tách
  riêng font cho heading) — nếu cần font khác cho heading, cập nhật
  `--font-heading` trong `globals.css` và thêm ghi chú tại đây.
- 4 weight đã import: `400` (regular), `500` (medium), `600`
  (semibold), `700` (bold). Không dùng weight ngoài danh sách này
  (ví dụ `300`, `900`) vì chưa được load — sẽ bị trình duyệt tự
  fallback sang weight gần nhất, không đúng thiết kế.
- Khi thêm ngôn ngữ khác ngoài tiếng Việt/Latin cơ bản, kiểm tra lại
  subset đã đủ trong Google Fonts cho Be Vietnam Pro trước khi dùng.

## Spacing

**Không tạo scale spacing riêng** — dùng thẳng scale mặc định của
Tailwind v4 (bội số của `4px`: `1 = 4px`, `2 = 8px`, `4 = 16px`...).
Đủ dùng cho e-commerce hiện đại, không cần override — đúng nguyên tắc
"Necessary > Abstract" ở `AGENTS.md`.

Quy ước áp dụng (không phải token mới, chỉ là _cách dùng nhất quán_
các class Tailwind sẵn có):

| Ngữ cảnh                                                     | Mobile                | Desktop                  |
| ------------------------------------------------------------ | --------------------- | ------------------------ |
| Container width                                              | `max-w-7xl mx-auto`   | như nhau                 |
| Padding ngang container                                      | `px-4`                | `px-6` → `px-8` (≥ `lg`) |
| Khoảng cách giữa các section lớn (Hero, Featured, Footer...) | `py-12`               | `py-20`                  |
| Padding trong card sản phẩm                                  | `p-4`                 | `p-6`                    |
| Padding trong card nội dung (checkout, dashboard)            | `p-6`                 | `p-8`                    |
| Gap giữa các item trong grid sản phẩm                        | `gap-4`               | `gap-6`                  |
| Khoảng cách giữa các field trong form                        | `space-y-4`           | như nhau                 |
| Khoảng cách label → input                                    | `gap-2` (hoặc `mb-2`) | như nhau                 |
| Khoảng cách giữa icon và text (button, nav)                  | `gap-2`               | như nhau                 |

**Quy tắc chung:**

- Luôn dùng class spacing của Tailwind (`p-*`, `gap-*`, `space-y-*`),
  không viết `style={{ padding: "16px" }}` hay CSS tuỳ ý.
- Không tự chế số lẻ (`p-[13px]`, `gap-[22px]`) trừ khi có lý do cụ
  thể (ví dụ khớp kích thước ảnh cố định) — bám theo scale chuẩn để
  giữ nhịp điệu đều trên toàn giao diện.
- Vì UI không bo góc (xem mục Hình khối), khoảng trắng (spacing) và
  đường viền (`border`) là công cụ chính để phân tách khối nội dung
  thay vì dùng shadow/bo góc — ưu tiên `border` mảnh (`border`,
  `border-border`) hoặc khoảng cách rộng hơn giữa các khối, thay vì
  lạm dụng `shadow-lg` để tạo chiều sâu giả.

---

## Cách áp dụng

Mọi token trong file này nên phản ánh trực tiếp vào
`src/app/globals.css` (biến `@theme`) — file này mô tả _quyết định_,
Tailwind config là nơi _thực thi_. Khi hai nơi lệch nhau, `globals.css`
là nguồn đang chạy thật, cần đồng bộ lại tài liệu này theo đó.
