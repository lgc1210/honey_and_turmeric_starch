# Quy ước viết code và hướng dẫn phát triển

## 1. Mục đích

File này là quy ước chung cho việc phát triển web app e-commerce.

Mục tiêu:

- Giữ code đơn giản, dễ đọc, dễ bảo trì.
- Tách rõ trách nhiệm giữa các tầng.
- Không over-engineering khi requirement chưa cần.
- Bảo đảm dữ liệu phía server là nguồn đáng tin cậy.
- Giữ nhất quán với thiết kế database và flow nghiệp vụ hiện tại.

---

## 2. Phạm vi và kiến trúc hệ thống

### 2.1. Phạm vi

Ứng dụng là một e-commerce nhiều sản phẩm với:

- Customer là guest, không có customer authentication.
- Admin có authentication và 2FA.
- Product hỗ trợ nhiều option, option value và variant.
- Cart được nhận diện bằng `cart.id` dạng chuỗi random.
- Cart state được lưu trong encrypted cookie.
- Database lưu cart/cart items để phục vụ checkout và truy xuất server-side.
- Order lưu snapshot thông tin người nhận, địa chỉ, sản phẩm và giá tại thời điểm đặt hàng.
- Payment hỗ trợ nhiều payment attempts cho một order.
- Coupon có giới hạn sử dụng và lịch sử sử dụng.
- Không xây dựng hệ thống shipment/address/customer account riêng nếu requirement chưa yêu cầu.

### 2.2. Backend layering (Next.js Server Actions)

Dự án dùng Next.js App Router. Backend logic chạy trực tiếp trong **Server
Actions**, không tách route/controller riêng theo kiểu Express truyền thống.

Flow:

```text
Component / Form (Client)
        ↓
Server Action ("use server")
        ↓
Zod validate (input)
        ↓
Service function (business logic thuần, không phụ thuộc request/response)
        ↓
Prisma / Database
```

Quy tắc:

- Server Action đặt tại `features/<domain>/api/actions.ts`.
- Action **không** chứa business logic phức tạp trực tiếp (tính giá, kiểm
  tra stock, tính discount...) — tách ra hàm service riêng trong cùng
  thư mục `api/` (ví dụ `features/order/api/service.ts`) để dễ test độc
  lập, không phụ thuộc Server Action context.
- Action chỉ làm nhiệm vụ: nhận input → validate bằng Zod → gọi service
  → trả về `ActionResult` (xem `src/types/common.ts`).
- Không query Prisma trực tiếp trong Component/Page — luôn đi qua Server
  Action hoặc hàm data-fetching đặt trong `features/<domain>/api/`.
- Không đặt Prisma query trực tiếp trong Component render.

Ví dụ:

```text
checkoutAction() [Server Action — features/order/api/actions.ts]
        ↓
validate checkoutSchema
        ↓
createOrder() [service function — features/order/api/service.ts]
        ↓
prisma.$transaction(...)
```

Không làm:

```ts
// ❌ Nhồi hết logic vào Server Action, không tách service
"use server";
export async function checkoutAction(input: unknown) {
  // validate
  // query cart
  // check stock
  // calculate price
  // create order
  // create payment
  // ...
}
```

### 2.3. Route Handler — chỉ dùng cho trường hợp đặc biệt

Route Handler (`app/api/.../route.ts`) **không** phải cách tiếp cận mặc
định — chỉ dùng khi bên ngoài (không phải chính app này) cần gọi HTTP
trực tiếp vào, mà Server Action không đáp ứng được:

- Payment callback/IPN từ payment provider.
- Webhook từ bất kỳ dịch vụ bên thứ ba nào.

Ngoài hai trường hợp này, ưu tiên Server Action.

---

## 3. Quy ước TypeScript

- Dùng TypeScript thay vì JavaScript trong backend/frontend khi project đã dùng TypeScript.
- Ưu tiên type rõ ràng.
- Không dùng `any` nếu có thể xác định type.
- Không ép kiểu (`as`) chỉ để làm TypeScript hết lỗi; phải xác định nguyên nhân trước.
- Các helper/function quan trọng nên có input/output type rõ ràng.
- Không tạo abstraction chỉ vì có thể tạo abstraction.
- Ưu tiên code trực tiếp, dễ đọc trước khi tối ưu abstraction.

### Naming

- Biến/function: `camelCase`.
- Class/type/interface: `PascalCase`.
- Database model: theo Prisma schema hiện tại.
- Database column: `snake_case` thông qua `@map`.
- Boolean nên có tên thể hiện trạng thái, ví dụ `isEnabled`, `isPrimary`.
- Thời gian dùng hậu tố rõ nghĩa: `createdAt`, `updatedAt`, `expiresAt`, `paidAt`.
- Enum giá trị lấy trực tiếp từ Prisma Client generated (`OrderStatus`,
  `EntityStatus`...), không tự định nghĩa lại mảng chuỗi song song —
  tránh hai nguồn sự thật lệch nhau khi enum trong schema thay đổi.

---

## 4. Prisma và Database

Database hiện tại sử dụng:

```text
PostgreSQL
Prisma ORM 7 (driver adapter: @prisma/adapter-pg)
```

Prisma schema là nguồn định nghĩa chính cho database model.

### 4.1. Không bỏ qua thiết kế quan hệ

Các quan hệ quan trọng:

```text
Category
  └── Product
       ├── ProductOption
       │    └── ProductOptionValue
       │
       ├── ProductVariant
       │    └── VariantOptionValue
       │
       └── ProductImage

Cart
  └── CartItem
       └── ProductVariant

Order
  ├── OrderItem
  ├── Payment
  └── CouponUsage
```

`VariantOptionValue` là junction table many-to-many và sử dụng composite primary key:

```prisma
@@id([variantId, optionValueId])
```

Không thêm `id` riêng nếu bảng chỉ có nhiệm vụ biểu diễn quan hệ.

### 4.2. Product options và variants

Không dùng JSON attributes làm nguồn xác định variant.

Dữ liệu được chuẩn hóa:

```text
Product
  ↓
ProductOption
  ↓
ProductOptionValue
  ↓
ProductVariant
  ↓
VariantOptionValue
```

Ví dụ:

```text
Product: T-Shirt

Color:
  Black
  White

Size:
  S
  M
  L
```

Một variant được xác định bởi tập option values của nó.

Database không tự đảm bảo hai variant không có cùng combination. Vì vậy service phải kiểm tra duplicate combination trước khi tạo variant.

Kiểm tra duplicate combination phải thực hiện trong transaction khi cần bảo đảm tính nhất quán.

### 4.3. Product image

Trong thiết kế hiện tại, `ProductImage` thuộc về `ProductVariant`:

```prisma
productVariantId BigInt
```

Do đó khi xử lý image phải xác định đúng variant.

Nếu requirement sau này thay đổi thành ảnh dùng chung cho toàn product hoặc ảnh phụ thuộc riêng vào một option value như Color, phải xem lại data model trước khi code.

### 4.4. Soft status

Các entity có `EntityStatus`:

```text
Active
InActive
```

Không hard-delete entity nếu entity đó đã có dữ liệu lịch sử liên quan và việc xóa có thể làm mất tính toàn vẹn của order/history.

Đặc biệt:

- `ProductVariant` đã xuất hiện trong `OrderItem` không nên hard-delete.
- Order history phải tiếp tục tham chiếu được product variant cũ.
- `status` được dùng để ngăn sản phẩm/variant tiếp tục được bán.

### 4.5. BigInt và Decimal khi truyền qua ranh giới Server → Client

`id` dùng `BigInt`, tiền dùng `Prisma.Decimal` — cả hai không serialize
được sang JSON mặc định khi truyền từ Server Component sang Client
Component hoặc trả về từ Server Action.

Luôn serialize trước khi trả về client, dùng helper tại `src/lib/serialize.ts`.
Không tự ý `JSON.stringify` trực tiếp dữ liệu Prisma trả về.

---

## 5. Guest Cart và encrypted cookie

Đây là flow đặc biệt quan trọng của hệ thống.

Customer không đăng nhập nên không có `customer_id` để xác định cart.

### 5.1. Cart identity

`carts.id` là chuỗi random:

```text
cartId = random string
```

Không dùng auto-increment integer cho cart ID.

### 5.2. Cookie

Cart payload được lưu trong browser cookie dưới dạng encrypted data.

Conceptual payload sau khi decrypt:

```json
{
  "id": "cart_xxx",
  "items": [
    {
      "variantId": 123,
      "quantity": 2
    }
  ]
}
```

Browser không nên giữ plaintext JSON nếu thiết kế yêu cầu encrypted cookie.

### 5.3. Không trust cookie

Encryption không có nghĩa là backend được phép tin dữ liệu tuyệt đối.

Backend luôn phải:

1. Decrypt cookie.
2. Parse dữ liệu.
3. Validate schema.
4. Validate `cartId`.
5. Validate `variantId`.
6. Validate quantity.
7. Query database.
8. Kiểm tra product/variant status.
9. Kiểm tra stock.
10. Lấy giá hiện tại từ database.
11. Tự tính subtotal/discount/total.

Không tin các giá trị client gửi như:

```text
price
subtotal
discount
total
productName
sku
```

nếu những giá trị đó có thể lấy lại từ server/database.

### 5.4. Integrity của encrypted cookie

Cơ chế bảo vệ cookie phải bảo đảm cả:

- Confidentiality: người dùng không đọc được payload.
- Integrity/authenticity: người dùng không thể sửa ciphertext/payload mà backend chấp nhận.

Ưu tiên authenticated encryption như AES-GCM hoặc một cơ chế encryption + authentication tương đương.

Encryption không thay thế server-side validation.

---

## 6. Cart flow

### Add item

```text
Client
  ↓
variantId + quantity
  ↓
addToCartAction() [Server Action]
  ↓
Decrypt/validate cart cookie
  ↓
Find Cart
  ↓
Find ProductVariant
  ↓
Validate status/stock
  ↓
Create/update CartItem
  ↓
Return cart
```

`CartItem` unique theo:

```text
(cartId, productVariantId)
```

Nếu variant đã tồn tại trong cart thì update quantity thay vì tạo duplicate row.

### Update quantity

Backend phải kiểm tra lại:

- Quantity hợp lệ.
- Variant tồn tại.
- Variant active.
- Stock đủ.

### Remove item

Xóa `CartItem` thuộc đúng `cartId`.

Không được cho phép client cung cấp `cartItemId` rồi truy cập row mà không kiểm tra cart ownership/association.

---

## 7. Checkout

Checkout là nơi yêu cầu validation nghiêm ngặt nhất.

### Flow

```text
Encrypted Cart Cookie
        ↓
Decrypt
        ↓
Validate
        ↓
Load Cart + CartItems
        ↓
Load ProductVariants
        ↓
Check status
        ↓
Check stock
        ↓
Get current prices
        ↓
Validate coupon
        ↓
Calculate subtotal
        ↓
Calculate discount
        ↓
Calculate shipping fee
        ↓
Calculate total
        ↓
Create Order + snapshots
        ↓
Create Payment
        ↓
Update inventory/coupon usage as appropriate
```

### Server là nguồn tính toán

Không lấy:

```text
frontendTotal
frontendPrice
frontendDiscount
```

làm kết quả cuối cùng.

Server phải tự tính:

```text
subtotal
discountAmount
shippingFee
totalAmount
```

### Transaction

Các thao tác ảnh hưởng đến dữ liệu nhất quán phải nằm trong database transaction khi phù hợp:

```text
Create Order
Create Order Items
Create Coupon Usage
Update Stock
```

Phải đặc biệt lưu ý race condition khi nhiều request cùng mua một variant có stock thấp.

Không chỉ kiểm tra stock trước transaction rồi update sau đó theo cách có thể dẫn đến overselling.

---

## 8. Order và snapshot

Order phải độc lập về mặt lịch sử với dữ liệu product hiện tại.

`OrderItem` lưu snapshot:

```text
productName
sku
variantName
unitPrice
quantity
subtotal
```

Order cũng lưu snapshot:

```text
recipientName
recipientEmail
recipientPhone

shippingProvince
shippingDistrict
shippingWard
shippingAddress
```

Không lấy lại tên/giá sản phẩm hiện tại để hiển thị order lịch sử.

Ví dụ:

```text
Product hiện tại:
Price = 300,000

Order cũ:
unitPrice = 250,000
```

Order cũ phải tiếp tục hiển thị `250,000`.

---

## 9. Payment

Một order có thể có nhiều payment attempts.

Không unique `orderId` trong `Payment`.

Ví dụ:

```text
Order #1001
 ├── Payment #1 → Failed
 ├── Payment #2 → Failed
 └── Payment #3 → Paid
```

Payment callback/IPN phải được xử lý ở backend, qua **Route Handler**
(xem mục 2.3) — không qua Server Action vì bên gọi là payment provider,
không phải form/component trong app.

Không tin frontend báo:

```text
paymentSuccess = true
```

Backend phải:

1. Verify callback/signature theo provider.
2. Xác định payment/order.
3. Kiểm tra amount.
4. Kiểm tra transaction.
5. Đảm bảo callback có thể xử lý idempotently.
6. Cập nhật payment status.
7. Cập nhật order status theo business flow.

---

## 10. Coupon

Coupon phải được kiểm tra server-side:

```text
code
status
startsAt
expiresAt
minimumOrderAmount
usageLimit
usedCount
```

Không tin discount amount từ frontend.

Server tự tính discount.

`CouponUsage` dùng để lưu lịch sử coupon đã được áp dụng vào order.

Composite unique:

```text
(couponId, orderId)
```

đảm bảo một coupon không được ghi nhận hai lần cho cùng một order.

Việc tăng `usedCount` phải được xử lý nhất quán với việc tạo `CouponUsage`, đặc biệt khi có concurrent checkout.

---

## 11. Admin authentication và 2FA

Hệ thống chỉ có một admin account.

Admin:

```text
email
passwordHash
```

Password phải được lưu dưới dạng password hash, không plaintext.

### 2FA

`AdminTwoFactorSettings` có quan hệ 1-1 với `Admin`.

Secret key và backup codes là dữ liệu nhạy cảm.

- TOTP secret cần được bảo vệ/encrypt khi lưu vì server cần sử dụng secret để verify.
- Backup codes không nên lưu plaintext nếu không cần thiết; ưu tiên hash từng code.
- Không log secret, backup code hoặc password.
- Không trả secret/backup codes trong API response thông thường.

### 11.1. Thư viện cho các yêu cầu bảo mật (chưa chốt)

Các mục 5.4, 11 mô tả yêu cầu kỹ thuật nhưng dự án **chưa chọn thư viện**
cụ thể — cần chốt trước khi implement để tránh dùng lẫn lộn nhiều lib
cho cùng một mục đích:

| Yêu cầu | Trạng thái | Gợi ý |
|---|---|---|
| Cart cookie encryption (AES-GCM) | Chưa chọn | `jose`, hoặc Web Crypto API (`crypto.subtle`) thủ công |
| Password hashing cho Admin | Chưa chọn | `@node-rs/argon2` |
| TOTP secret + verify | Chưa chọn | `otplib` |

Khi implement, cập nhật bảng này với lựa chọn cuối cùng.

---

## 12. Validation

Validation phải được thực hiện ở boundary của hệ thống.

Validate:

- Input của Server Action.
- Params.
- Query.
- Cookie payload.
- IDs.
- Enum values.
- Quantity.
- Money.
- Email.
- Coupon code.
- Product/variant status.

Validation ở frontend (react-hook-form + Zod) chỉ nhằm cải thiện UX.

Validation ở Server Action (cùng schema Zod, chạy lại phía server) mới là bắt buộc.

Không dựa vào:

```text
disabled button
frontend validation
hidden input
readonly input
```

để bảo vệ business logic.

Zod schema dùng chung giữa client (react-hook-form resolver) và server
(validate lại trong Server Action) — đặt tại `features/<domain>/schema.ts`,
không định nghĩa hai schema riêng biệt cho hai phía.

---

## 13. Error handling

Không trả stack trace hoặc thông tin nội bộ cho client trong production.

Server Action trả về `ActionResult` (`src/types/common.ts`) thay vì throw
lỗi thẳng ra client — phân biệt rõ lỗi validate (`fieldErrors`) và lỗi
nghiệp vụ (`error` message).

Với Route Handler (payment callback, webhook), phân biệt:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Business error nên có message rõ ràng và nhất quán.

Không dùng `try/catch` ở mọi function một cách máy móc.

---

## 14. Frontend

Frontend tổ chức theo tính năng (feature-based), không tách theo loại
file ở cấp cao nhất:

```text
features/<domain>/
  ├── components/    — UI riêng của feature
  ├── hooks/         — hook riêng của feature
  ├── api/           — Server Action + service function + data fetching
  ├── schema.ts       — Zod schema, dùng chung client/server
  ├── types.ts
  └── utils.ts
```

`components/ui/` (shadcn) và `components/layout/` (Header/Footer) là nơi
duy nhất chứa UI dùng chung toàn app, không thuộc riêng feature nào.

### Server state

Data từ Prisma được lấy qua Server Component (fetch trực tiếp trong
component async) hoặc qua Server Action — **không dùng TanStack Query**
cho data ban đầu, vì Next.js App Router đã có cơ chế cache/revalidate
riêng (`revalidatePath`, `revalidateTag`, `unstable_cache`).

TanStack Query chỉ cân nhắc thêm vào dự án nếu phát sinh nhu cầu thực sự
cần client-side polling hoặc optimistic update phức tạp mà Server Action
không đáp ứng tốt. Hiện tại package.json chưa có dependency này — không
tự ý thêm nếu chưa có nhu cầu cụ thể.

### Client state

Zustand hoặc local state dùng cho state thực sự thuộc frontend, ví dụ:

```text
Cart drawer open/close
Modal
Filter UI tạm thời (chưa submit)
Temporary interaction state
```

Không dùng Zustand để lưu cart items hay dữ liệu order — đó là server
state, nguồn thật nằm ở database + encrypted cookie (xem mục 5). Zustand
chỉ giữ state UI-only.

Không tạo global state nếu component/local hook đã đủ.

### Auth state

Không lưu thông tin authentication nhạy cảm vào localStorage. Admin
session dùng cơ chế cookie an toàn (HttpOnly, Secure, SameSite) do
backend quản lý.

---

## 15. Server Action naming convention

Action đặt tên theo dạng `<verb><Noun>Action`, nhóm theo domain trong
`features/<domain>/api/actions.ts`:

```text
getProducts()              — features/product/api/actions.ts
getProductBySlug()
createProductAction()      — admin only
updateProductAction()      — admin only

addToCartAction()          — features/cart/api/actions.ts
updateCartItemAction()
removeCartItemAction()

checkoutAction()           — features/order/api/actions.ts
updateOrderStatusAction()  — admin only

fetchProvincesAction()     — features/order/api/actions.ts
fetchDistrictsAction()
```

Quy ước:

- Hàm đọc dữ liệu (query, không mutate) có thể bỏ hậu tố `Action` nếu
  gọi trực tiếp trong Server Component (không phải `"use server"` form
  action) — ví dụ `getProducts()`.
- Hàm mutate dữ liệu (create/update/delete) luôn có hậu tố `Action` và
  luôn là Server Action (`"use server"`).
- Admin action phải kiểm tra quyền admin ngay đầu action, không dựa vào
  việc ẩn action ở client hay không hiển thị UI liên quan.

Ngoại lệ dùng Route Handler thay vì Server Action — xem mục 2.3.

Không để client tự quyết định:

```text
order.status
payment.status
stock_quantity
```

nếu đây là dữ liệu do server quản lý.

---

## 16. Database query

- Chỉ select/include dữ liệu thực sự cần.
- Tránh N+1 queries.
- Không query database lặp lại trong vòng lặp nếu có thể giải quyết bằng một query phù hợp.
- Dùng transaction khi nhiều thao tác phải thành công/thất bại cùng nhau.
- Không dùng transaction cho mọi query một cách máy móc.
- Khi xử lý tiền, sử dụng kiểu Decimal của Prisma thay vì JavaScript floating-point để tránh sai số tiền tệ.
- Không xây dựng query động từ raw user input nếu không cần.
- Khi bắt buộc dùng raw SQL, phải parameterize query.

---

## 17. Security

Nguyên tắc chính:

> Never trust user input.

Các nguồn không được mặc định là trusted:

- Input của Server Action.
- Query string.
- URL params.
- Cookie.
- Headers.
- Frontend-calculated values.
- Payment callback nếu chưa verify.

Đặc biệt không trust:

```text
price
stock
discount
total
role
order status
payment status
```

nếu client có thể gửi các giá trị này.

Không log:

```text
password
password hash
OTP
TOTP secret
backup codes
encrypted cookie contents
payment secrets
```

Cookie chứa cart nên có các thuộc tính bảo mật phù hợp như:

```text
HttpOnly
Secure
SameSite
```

tùy theo deployment và flow thực tế.

---

## 18. Business rules cần giữ nhất quán

### Product

- Product phải thuộc category.
- Product có thể có nhiều options.
- Option name unique trong cùng product.
- Option value normalized unique trong cùng option.
- SKU unique toàn hệ thống.
- Variant thuộc một product.
- Variant combination không được duplicate.

### Cart

- Cart ID là random string.
- Một cart không có duplicate variant.
- Quantity phải hợp lệ.
- Cart có thể hết hạn.
- Cookie không được quyết định giá/stock cuối cùng.

### Order

- Order number unique.
- Order item giữ snapshot.
- Shipping/recipient information là snapshot.
- Order history không phụ thuộc vào product data hiện tại.

### Payment

- Một order có thể có nhiều payment attempts.
- Chỉ backend sau khi verify provider mới xác nhận payment.

### Coupon

- Coupon phải còn hiệu lực.
- Phải thỏa minimum order amount.
- Phải tôn trọng usage limit.
- Discount phải được server tính lại.
- Coupon usage phải được ghi nhận nhất quán.

---

## 19. Code style và refactoring

Ưu tiên:

```text
Simple > Clever
Explicit > Implicit
Readable > Short
Necessary > Abstract
```

Không:

- Refactor toàn bộ file khi chỉ cần sửa một bug.
- Tạo generic abstraction quá sớm.
- Tạo repository/service/helper chỉ có một dòng logic không cần thiết.
- Thêm dependency chỉ để giải quyết một vấn đề nhỏ.
- Đổi architecture hiện tại nếu requirement chưa yêu cầu.

Khi sửa code hiện có:

1. Hiểu flow hiện tại.
2. Xác định nguyên nhân.
3. Sửa phần cần thiết.
4. Giữ nguyên behavior không liên quan.
5. Kiểm tra regression.

---

## 20. Testing và kiểm tra trước khi hoàn thành

Trước khi xem một feature là hoàn thành, kiểm tra ít nhất:

### Happy path

```text
Valid input
→ expected result
```

### Invalid input

```text
Missing field
Invalid type
Invalid ID
Invalid quantity
```

### Business edge cases

```text
Out of stock
Inactive product
Variant không tồn tại
Coupon expired
Coupon chưa bắt đầu
Coupon hết lượt
Payment failed
Payment retry
Duplicate request
Concurrent checkout
```

### Security

```text
Modified cookie
Modified price
Modified discount
Modified total
Access another cart
Access admin action without authentication
Replay payment callback
```

---

## 21. Git

Commit message nên mô tả thay đổi rõ ràng.

Ví dụ:

```text
feat: add product variant management
fix: prevent checkout with inactive variant
fix: validate coupon usage limit
refactor: simplify cart service
docs: update development guidelines
```

Không commit:

- `.env`
- Secret keys.
- Password.
- TOTP secret.
- Backup codes.
- Production credentials.
- Sensitive customer/payment information.

Trước khi commit nên kiểm tra:

```text
TypeScript
Lint
Tests
Prisma schema
Build
```

theo các script thực tế của project.

---

## 22. Quy trình phát triển feature

Khi implement feature mới:

```text
1. Đọc requirement
        ↓
2. Xác định business rules
        ↓
3. Kiểm tra database model hiện tại
        ↓
4. Xác định Server Action cần có (theo quy ước mục 15)
        ↓
5. Implement Zod schema (features/<domain>/schema.ts)
        ↓
6. Implement service function (features/<domain>/api/service.ts)
        ↓
7. Implement Server Action (features/<domain>/api/actions.ts)
        ↓
8. Implement UI (features/<domain>/components, hooks)
        ↓
9. Validate security/business rules
        ↓
10. Test edge cases
        ↓
11. Typecheck/lint/build
        ↓
12. Review diff
```

Không bắt đầu bằng việc tạo code trước khi hiểu data flow.

---

## 23. Nguyên tắc quan trọng nhất

Toàn bộ ứng dụng phải tuân theo ba nguyên tắc:

### 1. Client không phải source of truth

```text
Client → Server Action
Server → validate
Database → authoritative data
```

### 2. Historical data phải ổn định

Order phải giữ snapshot của dữ liệu quan trọng tại thời điểm mua.

### 3. Không over-engineer

Thiết kế hiện tại không có:

```text
Customer authentication
Customer addresses
Shipment management
Complex session system
Route/Controller/Service layer kiểu Express
TanStack Query (trừ khi phát sinh nhu cầu thực sự)
```

Không tự thêm những thành phần này nếu requirement chưa thay đổi.

Khi requirement thay đổi, đánh giá lại data model và flow trước khi implement.