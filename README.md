# Kim Bạc Store

Kim Bạc Store là ứng dụng thương mại điện tử dành cho cửa hàng bán mật ong và
tinh bột nghệ. Ứng dụng gồm cửa hàng trực tuyến cho khách mua hàng không cần
tài khoản và khu vực quản trị để vận hành danh mục, sản phẩm, đơn hàng, mã giảm
giá và tài khoản quản trị.

## Giao diện và các trang

Giao diện trang chủ
![Giao diện trang chủ](/readme_images/client_home.png)

Giao diện trang sản phẩm
![Giao diện trang sản phẩm](/readme_images/client_shop.png)

Giao diện trang chi tiết sản phẩm
![Giao diện trang chi tiết sản phẩm](/readme_images/client_product.png)

Giao diện trang giỏ hàng
![Giao diện trang giỏ hàng](/readme_images/client_cart.png)

Giao diện trang thanh toán
![Giao diện trang thanh toán](/readme_images/client_checkout.png)

Giao diện trang thanh toán thành công
![Giao diện trang thanh toán thông cong](/readme_images/client_checkout_success.png)

Giao diện trang quản trị
![Giao diện trang quản trị](/readme_images/admin_dashboard.png)

Giao diện trang quản lý danh mục
![Giao diện trang quản lý danh mục](/readme_images/admin_categories.png)

Giao diện trang quản lý sản phẩm
![Giao diện trang quản lý sản phẩm](/readme_images/admin_products.png)

Giao diện trang tạo sản phẩm
![Giao diện trang tạo sản phẩm](/readme_images/admin_product_create.png)

Giao diện trang quản lý đơn hàng
![Giao diện trang đơn hàng](/readme_images/admin_orders.png)

Giao diện trang quản lý chi tiết đơn hàng
![Giao diện trang chi tiết đơn hàng](/readme_images/admin_order_detail.png)

Giao diện trang quản lý tài khoản
![Giao diện trang quản lý tài khoản](/readme_images/admin_account_manage.png)

Giao diện trang quản lý mã giảm giá
![Giao diện trang quản lý mạ giảm giá](/readme_images/admin_coupons.png)

### Cửa hàng cho khách

Các trang khách hàng dùng chung thanh đầu trang, biểu tượng giỏ hàng có số lượng
sản phẩm, nội dung chính co giãn và chân trang.

| Đường dẫn                     | Nội dung                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/`                           | Trang chủ: carousel giới thiệu, các cam kết của cửa hàng, danh mục, sản phẩm nổi bật và câu chuyện thương hiệu. |
| `/products`                   | Danh sách sản phẩm có tìm kiếm, lọc danh mục, sắp xếp theo mới nhất/giá và phân trang.                          |
| `/products/[slug]`            | Chi tiết sản phẩm, lựa chọn biến thể/thuộc tính, số lượng, giá, tồn kho và thao tác thêm vào giỏ.               |
| `/cart`                       | Các sản phẩm trong giỏ, chỉnh số lượng/xóa sản phẩm và xem tạm tính, phí giao hàng.                             |
| `/checkout`                   | Biểu mẫu người nhận, địa chỉ, mã giảm giá và ghi chú; đơn hàng trống được chuyển về giỏ hàng.                   |
| `/checkout/success?order=...` | Xác nhận đơn hàng, hiển thị mã đơn, sản phẩm, tổng tiền, địa chỉ giao và hình thức COD.                         |

Trang chủ dùng bốn thông điệp chính: nguyên liệu tự nhiên, đóng gói cẩn thận,
giao hàng toàn quốc và cam kết chất lượng. Carousel hỗ trợ tự chuyển slide, nút
điều hướng, chấm chọn slide, vuốt trên thiết bị cảm ứng và tạm dừng khi rê chuột
hoặc focus.

### Khu vực quản trị

Các trang quản trị dùng bố cục có sidebar điều hướng; sidebar có thể thu gọn và
ghi nhớ tùy chọn đó bằng cookie. Trang `/admin` chuyển đến dashboard.

| Đường dẫn              | Chức năng                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/auth`          | Đăng nhập quản trị; nếu bật 2FA thì yêu cầu thêm mã TOTP hoặc mã dự phòng.                                                                                             |
| `/admin/dashboard`     | Tổng quan doanh thu, giá trị đơn trung bình, số đơn, sản phẩm/danh mục/mã giảm giá đang hoạt động, tồn kho thấp, xu hướng doanh thu, sản phẩm bán chạy và đơn gần đây. |
| `/admin/categories`    | Tạo/sửa danh mục, gán danh mục cha, chuyển chế độ xem cây/danh sách, bật/tắt hoặc xóa.                                                                                 |
| `/admin/products`      | Tìm kiếm, lọc, phân trang và quản lý trạng thái sản phẩm.                                                                                                              |
| `/admin/products/new`  | Tạo sản phẩm kèm thuộc tính, giá trị thuộc tính và các biến thể ban đầu.                                                                                               |
| `/admin/products/[id]` | Sửa thông tin sản phẩm; quản lý biến thể, tồn kho, ảnh và ảnh đại diện của từng biến thể.                                                                              |
| `/admin/orders`        | Tìm/lọc đơn theo trạng thái, ngày và thông tin đơn; cập nhật trạng thái theo các bước hợp lệ.                                                                          |
| `/admin/orders/[id]`   | Xem thông tin người nhận, địa chỉ, snapshot sản phẩm/giá, mã giảm giá và các lần thanh toán; cập nhật trạng thái thanh toán.                                           |
| `/admin/coupons`       | Tạo/sửa, tìm/lọc, bật/tắt và xóa mã giảm giá.                                                                                                                          |
| `/admin/accounts`      | Xem thông tin đăng nhập gần nhất, đổi mật khẩu và cấu hình 2FA cho tài khoản hiện tại.                                                                                 |

Đây là hệ thống dành cho một tài khoản admin; `/admin/accounts` là trang cài đặt
tài khoản hiện tại, không phải công cụ quản lý nhiều admin.

## Tính năng và quy tắc nghiệp vụ

- **Danh mục phân cấp:** hỗ trợ danh mục cha/con; không cho ngừng hoạt động hoặc
  xóa danh mục khi vẫn còn danh mục con hay sản phẩm liên kết.
- **Sản phẩm và biến thể:** sản phẩm có danh mục, nhiều tùy chọn/giá trị và một
  hay nhiều biến thể. SKU là mã riêng của biến thể; giá và tồn kho được quản lý
  theo biến thể. Ảnh cũng gắn với biến thể, có thứ tự và ảnh chính.
- **Giỏ khách vãng lai:** định danh giỏ là chuỗi ngẫu nhiên lưu trong cookie
  mã hóa AES-256-GCM; các dòng hàng được lưu trong PostgreSQL. Server kiểm tra
  lại biến thể, trạng thái và tồn kho khi thay đổi giỏ.
- **Checkout:** không yêu cầu tài khoản khách hàng. Server đọc giỏ từ cơ sở dữ
  liệu, tính lại giá hiện tại, kiểm tra tồn kho và coupon, tạo đơn cùng snapshot
  người nhận/sản phẩm/giá, trừ tồn kho, ghi nhận lượt dùng coupon và xóa giỏ
  trong transaction.
- **Phí giao hàng:** mức phí cố định là 30.000₫; đơn từ 500.000₫ sau giảm giá
  được miễn phí vận chuyển.
- **Coupon:** hỗ trợ giảm theo số tiền hoặc phần trăm, giá trị đơn tối thiểu,
  giới hạn lượt dùng, thời điểm bắt đầu/hết hạn và lịch sử sử dụng theo đơn.
- **Lịch sử đơn:** `OrderItem` lưu tên sản phẩm, SKU, tên biến thể, đơn giá,
  số lượng và thành tiền tại thời điểm đặt để dữ liệu cũ không phụ thuộc nội
  dung sản phẩm hiện tại.
- **Trạng thái:** trạng thái đơn và thanh toán chỉ chuyển theo các bước được
  định nghĩa trong service; biến thể/sản phẩm đã xuất hiện trong đơn không
  được xóa theo cách làm mất lịch sử.
- **Địa chỉ giao hàng:** tỉnh/thành và phường/xã được lấy từ API tỉnh thành Việt
  Nam, kiểm tra cấu trúc bằng Zod và cache trong một ngày.

### Thanh toán hiện tại

Checkout hiện chỉ tạo phương thức **COD (thanh toán khi nhận hàng)**. Schema có
hỗ trợ nhiều payment attempts trên một đơn và khu vực quản trị có thể cập nhật
trạng thái thanh toán, nhưng mã nguồn chưa tích hợp cổng thanh toán trực tuyến,
chưa có callback/IPN hay webhook của nhà cung cấp.

## Kiến trúc

Ứng dụng dùng Next.js App Router. Trang và dữ liệu ban đầu được tải bằng Server
Components; thao tác thay đổi dữ liệu đi qua Server Actions, không có lớp
Express/controller riêng.

```text
src/
├── app/
│   ├── (client)/       # Trang cửa hàng, giỏ, checkout
│   └── (admin)/        # Trang quản trị
├── features/
│   ├── auth/           # Đăng nhập, session, 2FA
│   ├── cart/           # Giỏ hàng và cookie định danh
│   ├── category/       # Danh mục
│   ├── checkout/       # Biểu mẫu và kiểu dữ liệu checkout
│   ├── coupon/         # Coupon
│   ├── dashboard/      # Thống kê quản trị
│   ├── home/           # Carousel trang chủ
│   ├── order/          # Checkout, đơn hàng, địa chỉ
│   ├── payment/        # Kiểu dữ liệu và tiện ích thanh toán
│   └── product/        # Catalog, biến thể, ảnh sản phẩm
├── components/
│   ├── layout/         # Header/footer cửa hàng và sidebar admin
│   └── ui/             # Thành phần giao diện dùng chung
├── config/             # Đường dẫn, cấu hình site, thông báo lỗi
├── lib/                # Prisma, serialize, cookie, ảnh, HTTP, tiện ích
└── types/
```

Luồng xử lý điển hình:

```text
Client form / component
        ↓
Server Action ("use server")
        ↓
Zod validate input
        ↓
Service theo feature (nghiệp vụ)
        ↓
Prisma Client + PostgreSQL
```

Các action dùng helper `src/lib/action.ts` để chuẩn hóa `ActionResult`, lỗi
validation và lỗi nghiệp vụ. Server Actions quản trị kiểm tra phiên admin trước
khi thực hiện thao tác, sau đó revalidate các đường dẫn liên quan. Form client
dùng React Hook Form kết hợp schema Zod. Dữ liệu Prisma có `BigInt`, `Decimal`
hoặc `Date` được chuyển đổi trước khi trả qua ranh giới Server/Client bằng
`src/lib/serialize.ts`.

## Mô hình dữ liệu

Schema PostgreSQL được định nghĩa trong `prisma/schema.prisma`; migration nằm
trong `prisma/migrations/`.

```text
Category ──< Product ──< ProductOption ──< ProductOptionValue
                     └──< ProductVariant ──< ProductImage
                                      ├──< VariantOptionValue >── ProductOptionValue
                                      ├──< CartItem >── Cart
                                      └──< OrderItem >── Order
                                                               ├──< Payment
                                                               └──< CouponUsage >── Coupon
Admin ── 0..1 AdminTwoFactorSettings
```

- Các ID nội bộ dùng `BigInt`; tiền dùng `Decimal`.
- Tổ hợp biến thể được biểu diễn bằng bảng nối
  `VariantOptionValue` với khóa chính ghép `(variantId, optionValueId)`.
- Giỏ có ID chuỗi ngẫu nhiên; một biến thể chỉ xuất hiện một lần trong cùng
  giỏ nhờ unique `(cartId, productVariantId)`.
- Một đơn có thể có nhiều payment attempts. Coupon usage có unique
  `(couponId, orderId)`.
- Dữ liệu người nhận và dòng hàng trong đơn là snapshot; đơn không phụ thuộc
  vào tên/giá sản phẩm được sửa về sau.

## Công nghệ

- **Ứng dụng:** Next.js 16 App Router, React 19, TypeScript.
- **Giao diện:** Tailwind CSS 4, Base UI, các thành phần giao diện nội bộ;
  màu nền kem và điểm nhấn vàng nghệ/đất nung, hình khối vuông cạnh.
- **Biểu mẫu/validation:** React Hook Form và Zod.
- **Dữ liệu:** PostgreSQL, Prisma ORM 7, `@prisma/adapter-pg`.
- **Lưu ảnh:** Supabase Storage.
- **Bảo mật admin:** Argon2 cho mật khẩu; HMAC ký session; AES-GCM mã hóa
  secret TOTP; mã dự phòng được hash và chỉ dùng một lần.
- **Tích hợp ngoài:** API tỉnh/thành Việt Nam qua Axios; response được
  kiểm tra bằng Zod và cache phía server.

## Chạy dự án cục bộ

Yêu cầu Node.js tương thích Next.js 16, npm, PostgreSQL và một Supabase project
có Storage bucket dành cho ảnh sản phẩm.

1. Cài dependency:

   ```bash
   npm ci
   ```

   Script `postinstall` sẽ sinh Prisma Client.

2. Tạo file `.env` ở thư mục gốc và khai báo các biến cần thiết (không commit
   file này):

   | Biến                               | Bắt buộc                | Mô tả                                                                                     |
   | ---------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
   | `DATABASE_URL`                     | Có                      | URL kết nối PostgreSQL.                                                                   |
   | `PUBLIC_SUPABASE_URL`              | Có                      | URL Supabase project.                                                                     |
   | `PUBLIC_SUPABASE_ANON_KEY`         | Có                      | Anon key được kiểm tra bởi schema môi trường.                                             |
   | `PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Có                      | Service-role key dùng phía server để upload/xóa ảnh; phải giữ bí mật.                     |
   | `SUPABASE_PRODUCT_IMAGE_BUCKET`    | Có                      | Tên bucket ảnh sản phẩm.                                                                  |
   | `ADMIN_SESSION_SECRET`             | Production              | Secret ký HMAC, tối thiểu 32 ký tự.                                                       |
   | `ADMIN_TWO_FACTOR_ENCRYPTION_KEY`  | Production khi dùng 2FA | Khóa AES-256 dạng hex 64 ký tự để mã hóa TOTP secret.                                     |
   | `CART_COOKIE_ENCRYPTION_KEY`       | Production              | Khóa AES-256 dạng hex 64 ký tự để mã hóa cookie giỏ hàng.                                 |
   | `PUBLIC_APP_URL`                   | Không                   | Mặc định `http://localhost:3000`.                                                         |
   | `PROVINCES_BASE_URL`               | Không                   | Mặc định API tỉnh thành `https://provinces.open-api.vn/api`.                              |
   | `NODE_ENV`                         | Không                   | Mặc định `development`; các secret ở trên có fallback chỉ dành cho môi trường phát triển. |
   | `ADMIN_SEED_PASSWORD`              | Khi seed                | Mật khẩu khởi tạo admin; nên tự đặt giá trị mạnh, riêng tư trước khi chạy seed.           |

   Dù tên có tiền tố `PUBLIC_`, không đưa `PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
   vào bundle client hoặc chia sẻ giá trị này.

3. Áp dụng migration cho database đã cấu hình:

   ```bash
   npx prisma migrate deploy
   ```

4. (Tùy chọn) Tạo dữ liệu mẫu cho môi trường phát triển:

   ```bash
   npm run prisma:seed
   ```

   Seed tạo/cập nhật dữ liệu mẫu admin, danh mục, sản phẩm, biến thể và coupon.
   Đặt `ADMIN_SEED_PASSWORD` trước khi chạy; không dùng dữ liệu seed mặc định
   cho môi trường thật.

5. Khởi chạy ứng dụng:

   ```bash
   npm run dev
   ```

   Mở `http://localhost:3000`. Khu vực admin ở `/admin`.

### Các lệnh có sẵn

| Lệnh                  | Mục đích                          |
| --------------------- | --------------------------------- |
| `npm run dev`         | Chạy Next.js ở chế độ phát triển. |
| `npm run build`       | Tạo bản build production.         |
| `npm run start`       | Chạy bản production đã build.     |
| `npm run lint`        | Chạy ESLint.                      |
| `npm run prisma:seed` | Chạy `prisma/seed.ts`.            |

## Phạm vi hiện tại

- Khách mua hàng ở chế độ guest; chưa có đăng nhập khách hàng, hồ sơ khách
  hàng, sổ địa chỉ hoặc quản lý vận chuyển riêng.
- Thanh toán trực tuyến/callback nhà cung cấp chưa được triển khai; checkout
  tạo payment COD.
- Có cấu trúc lưu nhiều payment attempts trong dữ liệu, nhưng hiện không có
  trang `/admin/payments` độc lập; giao dịch được xem trong chi tiết đơn hàng.
- Script dự án hiện chưa khai báo lệnh test riêng.
