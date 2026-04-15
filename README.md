# Invento - Inventory Management System

Hệ thống quản lý kho hàng chia ba phần: Backend (ASP.NET Core Web API), Frontend (React) và Database (SQL Server). Project xây theo hướng portfolio cho sinh viên C#/.NET. Toàn bộ màn hình trong giao diện đều chạy trên API thật, dữ liệu ghi xuống SQL Server.

Người dùng chia hai vai trò: Admin thao tác toàn bộ, Staff xem số liệu và ghi nhận nhập/xuất kho nhưng không chỉnh sửa được các danh mục quản trị.

## Công nghệ

- Backend: C# / ASP.NET Core Web API trên .NET 10 LTS, EF Core 10, SQL Server, JWT Bearer, rate limiting cho đăng nhập, Swagger/OpenAPI (chỉ bật ở Development).
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, Tailwind CSS 4, Recharts, Lucide. Quản lý package bằng pnpm.
- Database: SQL Server, ba script tạo database, schema, index/foreign key và seed dữ liệu demo.
- Test: xUnit kết hợp ASP.NET Core integration test.

## Cấu trúc thư mục

```text
inventory-management-system/
|-- Backend/
|   |-- inventory-management-system.slnx        # Mở API và test trong Visual Studio / Rider
|   |-- Inventory_Man_Sys_Be/                   # ASP.NET Core Web API
|   |   |-- Controllers/                        # Auth, dashboard, products, inventory, warehouse, supplier, customer, purchase orders, shipments, notifications, reports
|   |   |-- Data/                               # EF Core DbContext, entity, seeder
|   |   |-- Domain/                             # Entity models
|   |   |-- DTOs/                               # Request/response contract + validation
|   |   |-- Services/                           # JWT auth, quy tắc stock, nhận đơn mua hàng
|   |   |-- Middleware/                         # Chuẩn hoá lỗi API thành JSON
|   |   |-- Properties/                         # launchSettings (API chạy ở cổng 5080)
|   |   |-- appsettings.json                    # Cấu hình mặc định; .env sẽ override
|   |   |-- Dockerfile
|   `-- Inventory_Man_Sys_Be.Tests/             # xUnit unit + API smoke tests
|-- Frontend/
|   |-- vercel.json                             # Cấu hình deploy Vercel (SPA rewrite)
|   |-- src/app/                                # Redux store, hooks, navigation theo state
|   |-- src/components/common/                  # Pagination, password input, stat card
|   |-- src/constants/                          # Menu và phân loại hàng
|   |-- src/features/                           # Mỗi domain một thư mục: api, hooks, store, components
|   |-- src/layouts/                            # Sidebar + Header
|   |-- src/lib/                                # fetch wrapper gắn JWT, token storage, env
|   |-- src/pages/                              # Login, dashboard, các trang nghiệp vụ
|   |-- nginx.conf                              # SPA fallback + cache file tĩnh
|   `-- Dockerfile                              # Build UI rồi đóng gói dist vào Nginx
|-- Database/
|   |-- 01_CreateDatabase.sql
|   |-- 02_CreateSchema.sql
|   `-- 03_SeedData.sql
`-- docker-compose.yml                          # Gom ba dịch vụ: sqlserver + api + ui
```

## Chuẩn bị

- .NET SDK 10
- SQL Server đang chạy ở máy local (cài sẵn hoặc qua Docker đều được)
- Node.js 22+ và pnpm (bật bằng `corepack enable`)

## Chạy backend

Copy `Backend/Inventory_Man_Sys_Be/.env.example` thành `.env` và chỉnh lại cho khớp máy mình. Chương trình đọc `.env` trước khi build config, biến có dạng `Section__Key` map vào cấu hình lồng nhau và được ưu tiên hơn `appsettings.json`. Một vài biến hay đụng đến:

```text
ConnectionStrings__DefaultConnection=Server=localhost;Database=InventoDb;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False
Database__AutoCreate=true
Jwt__Key=LOCAL_DEVELOPMENT_ONLY_CHANGE_THIS_KEY_2026_InventorySystem
Cors__AllowedOrigins__0=http://localhost:5173
Security__LoginRateLimit=5
```

Chạy:

```bash
cd Backend/Inventory_Man_Sys_Be
dotnet restore
dotnet run
```

API nằm ở http://localhost:5080, Swagger UI ở http://localhost:5080/swagger, endpoint kiểm tra sống còn ở http://localhost:5080/health.

Với `Database__AutoCreate=true`, lúc khởi động API sẽ chờ SQL Server sẵn sàng (retry 20 lần, cách nhau 3 giây), tự tạo schema nếu database trống và chèn seed khi bảng Users còn rỗng. Database đã tạo sẵn bằng SQL script thì API giữ nguyên schema hiện hữu.

## Tạo database bằng SQL script

Nếu muốn nắm schema bằng tay thay vì để API tự tạo, chạy ba file theo thứ tự trong SSMS hoặc `sqlcmd`:

1. `Database/01_CreateDatabase.sql` - tạo `InventoDb` nếu chưa có.
2. `Database/02_CreateSchema.sql` - tạo bảng, khoá ngoại, unique index và check constraint.
3. `Database/03_SeedData.sql` - seed user, danh mục, kho, nhà cung cấp, sản phẩm, tồn kho, lịch sử giao dịch và đơn đặt hàng mẫu.

Seed script viết idempotent, chạy lại không bị nhân đôi dữ liệu. Chọn một trong hai cách tạo database, không cần làm cả hai.

## Chạy frontend

```bash
cd Frontend
corepack enable
pnpm install
pnpm dev
```

Vite chạy ở http://localhost:5173 (cổng đọc từ `VITE_DEV_PORT` trong `.env`, mặc định 5173). Copy `Frontend/.env.example` thành `.env` trước, đặc biệt là `VITE_API_BASE_URL` nếu backend không nằm ở `localhost:5080`. CORS backend đã mở sẵn cho hai origin `localhost:5173` và `127.0.0.1:5173`; đổi cổng frontend thì thêm biến `Cors__AllowedOrigins__N` vào `.env` backend.

Build và kiểm tra type:

```bash
cd Frontend
pnpm typecheck
pnpm build
```

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@invento.local` | `Inventory123!` |
| Staff | `staff@invento.local` | `Inventory123!` |

Đây là tài khoản local/demo. **Đổi mật khẩu và thay JWT signing key (tối thiểu 32 byte UTF-8) trước khi chạy ở môi trường thật.** File `.env` hai phía đều không commit vào Git.

## Các endpoint của API

| Method | Endpoint | Mục đích |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT (rate limit 5 lần / 60 giây theo IP) |
| `GET` | `/api/auth/me` | User hiện tại theo JWT |
| `GET` / `POST` | `/api/auth/users` | Admin xem danh sách và tạo user Staff/Admin |
| `GET` | `/api/auth/users/{id}` | Admin xem một tài khoản |
| `GET` | `/api/dashboard/summary` | Thẻ tổng quan, dòng tiền, cảnh báo tồn kho, hoạt động gần đây |
| `GET` | `/api/products?search=&status=&categoryId=` | Tìm kiếm, lọc, phân loại sản phẩm |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm |
| `POST` / `PUT` / `DELETE` | `/api/products` | Admin thêm, sửa, ngừng kinh doanh (soft deactivate) |
| `GET` | `/api/inventory/movements?take=50` | Lịch sử nhập/xuất kho |
| `POST` | `/api/inventory/receive` | Nhập kho |
| `POST` | `/api/inventory/issue` | Xuất kho, từ chối nếu tồn kho không đủ |
| `GET` / `POST` | `/api/warehouses` | Danh sách và tạo kho (tạo mới chỉ dành cho Admin) |
| `GET` / `POST` | `/api/suppliers` | Danh sách và tạo nhà cung cấp |
| `GET` / `POST` | `/api/customers` | Danh sách và tạo khách hàng |
| `GET` / `POST` | `/api/purchase-orders` | Danh sách và tạo đơn đặt hàng |
| `GET` | `/api/purchase-orders/{id}` | Chi tiết đơn |
| `GET` | `/api/purchase-orders/{id}/items` | Các dòng hàng của đơn |
| `POST` | `/api/purchase-orders/{id}/receive` | Nhận hàng theo đơn, hỗ trợ nhận một phần |
| `GET` | `/api/shipments` | Lịch sử lô hàng đã nhận |
| `GET` | `/api/reports/summary` | Tổng hợp giá trị nhập/xuất |
| `GET` | `/api/reports/cash-flow?months=12` | Dòng tiền theo tháng |
| `GET` | `/api/notifications?category=&archived=&unreadOnly=` | Danh sách thông báo |
| `GET` | `/api/notifications/summary` | Đếm tổng và số chưa đọc |
| `POST` | `/api/notifications` | Gửi thông báo, người gửi là user hiện tại |
| `PATCH` | `/api/notifications/{id}/read` | Đánh dấu đã đọc / chưa đọc, body `{ "value": true|false }` |
| `PATCH` | `/api/notifications/{id}/archive` | Lưu trữ / khôi phục thông báo |

Trừ `/health`, mọi endpoint đều cần JWT. Các thao tác quản trị đánh dấu `[Authorize(Roles = "Admin")]`.

## Quy tắc nghiệp vụ và bảo mật

- Nhập/xuất kho ghi `StockMovement` và cập nhật `WarehouseStock` trong một transaction ở mức cách ly `Serializable`.
- Số lượng giao dịch phải là số nguyên dương; xuất vượt tồn kho hoặc nhận vượt số lượng đặt sẽ bị từ chối.
- `WarehouseStocks` dùng khoá chính ghép `(ProductId, WarehouseId)` nên một SKU không bị trùng dòng trong cùng một kho. Import kho mới sẽ tự khởi tạo dòng tồn kho bằng 0 trước khi cộng thêm.
- Sản phẩm ngừng kinh doanh bằng `IsActive = false`, lịch sử giao dịch giữ nguyên để tra cứu.
- Tạo đơn mua hàng sinh mã `PO-yyyyMMdd-HHmmssfff`, status bắt đầu ở `Draft`. Nhận hàng phải thuộc đúng dòng của đơn, vượt số lượng còn lại sẽ bị từ chối; sau khi nhận, đơn chuyển `PartiallyReceived` hoặc `Received` khi nhận đủ, một `StockMovement` loại `Receive` sinh ra theo tham chiếu mã đơn. Đơn đã `Cancelled` hoặc `Received` không nhận thêm được.
- JWT chỉ chứa ID, tên, email, role, hạn 8 giờ cấu hình được. Endpoint đăng nhập dính rate limit trả 429 khi vượt ngưỡng.
- Middleware chuẩn hoá mọi lỗi thành JSON với mã 400/404/409/500, không đưa stack trace ra client. Bổ sung security headers cơ bản (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) ở mọi response.

## Test

```bash
cd Backend/Inventory_Man_Sys_Be.Tests
dotnet test
```

Bộ test gồm unit test cho quy tắc tồn kho (`StockPolicy`: nhập/xuất hợp lệ, chặn số âm, chặn tràn tồn kho) và integration smoke test cho `/health` cùng việc chặn request chưa xác thực ở endpoint sản phẩm. Hai smoke test này không cần SQL Server thật.

## Chạy bằng Docker Compose

Repo có Dockerfile cho từng phía và một compose file ở thư mục gốc gom cả ba dịch vụ: SQL Server, API, UI.

```bash
docker compose up --build -d
```

- UI: http://localhost:4173
- API: http://localhost:5080, Swagger UI: http://localhost:5080/swagger
- SQL Server: `localhost,1433`, database `InventoDb`

API sẽ đợi SQL Server healthy rồi mới khởi động (healthcheck bằng `sqlcmd`), sau đó tự tạo schema và seed như khi chạy trực tiếp. Xem log của API bằng `docker compose logs -f api`.

Trình duyệt truy cập API trực tiếp theo `localhost:5080`, nên CORS đã mở sẵn cho origin `http://localhost:4173` của UI trong compose. Dùng ngoài máy local thì tạo file `.env` cạnh `docker-compose.yml` để đặt `SQLSERVER_SA_PASSWORD` và `JWT_KEY` riêng, file này không commit.

Muốn build từng image riêng:

```bash
docker build -t invento-api Backend/Inventory_Man_Sys_Be
docker build -t invento-ui Frontend
```

## Deploy frontend lên Vercel

Frontend có `vercel.json` cấu hình build bằng pnpm và rewrite mọi path về `index.html` (SPA fallback). Một điều cần nhớ: URL API được nhúng vào bundle lúc build qua `VITE_API_BASE_URL`, cách thay đổi nó sau khi deploy:

- Trên dashboard Vercel của project, qua mục Settings - Environment Variables, khai báo `VITE_API_BASE_URL=https://<domain-api>/api`.
- Deploy lại (biến env chỉ áp dụng lúc build, không áp dụng sau khi bundle đã cháy vào file `dist`).

Backend không deploy lên Vercel (không phù hợp ASP.NET Core chạy dài và cần SQL Server); Render, Azure, Railway hoặc tự host bằng Docker là các lựa chọn hợp lý cho phần API.

## Hướng phát triển tiếp theo

- Chuyển sang EF Core migrations thay cho `EnsureCreated` ở môi trường local.
- Hoàn thiện vòng đời Purchase Order: phê duyệt, huỷ, ghi chú lý do nhận thiếu hàng.
- Đẩy thông báo sinh tự động theo sự kiện (sản phẩm chạm ngưỡng reorder, nhận hàng xong).
- Bổ sung integration test chạy trên SQL Server thật hoặc Testcontainers: rollback, race condition khi xuất cùng SKU, duplicate SKU/email, phân quyền.
- Refresh token/rotation, audit log, phân trang cho bảng dữ liệu lớn và quản lý secret bằng User Secrets hoặc vault khi cần đưa lên staging.
