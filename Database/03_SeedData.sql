/* Demo-only data. Password for both users: Inventory123! Change it before any non-local use. */
/* Idempotent: every block checks before inserting. Ledger design: final WarehouseStocks.Quantity
   equals SUM(Receive) - SUM(Issue) per product/warehouse so stock and history stay consistent. */
USE [InventoDb];
GO

/* ---------- Users ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'admin@invento.local')
    INSERT dbo.Users (FullName, Email, PasswordHash, Role, IsActive, CreatedAt)
    VALUES (N'Rakib Kowshar', N'admin@invento.local', N'AQAAAAIAAYagAAAAEAABAgMEBQYHCAkKCwwNDg/P+eRF59EsAq9Htn0nGSsgLh1Lz1+ssWB5T/w/ntxXJA==', N'Admin', 1, SYSUTCDATETIME());
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'staff@invento.local')
    INSERT dbo.Users (FullName, Email, PasswordHash, Role, IsActive, CreatedAt)
    VALUES (N'Alex Nguyen', N'staff@invento.local', N'AQAAAAIAAYagAAAAEBAREhMUFRYXGBkaGxwdHh8ElJwszEk/dWMsO+Unp2BruyNkj6JEIQRs+pXn4V4++w==', N'Staff', 1, SYSUTCDATETIME());

/* ---------- Categories ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Electronics')
BEGIN
    INSERT dbo.Categories (Name, Description) VALUES
    (N'Electronics', N'Electronic devices and accessories'),
    (N'Apparel', N'Clothing and textile'),
    (N'Accessories', N'Bags and personal accessories'),
    (N'Home & Living', N'Home products');
END;

/* ---------- Warehouses ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Warehouses WHERE Code = N'WH-A')
BEGIN
    INSERT dbo.Warehouses (Code, Name, Address, ManagerName, IsActive) VALUES
    (N'WH-A', N'Warehouse A', N'District 7, Ho Chi Minh City', N'Minh Tran', 1),
    (N'WH-B', N'Warehouse B', N'Thu Duc City, Ho Chi Minh City', N'Linh Pham', 1),
    (N'WH-C', N'Warehouse C', N'Binh Tan District, Ho Chi Minh City', N'Tuan Le', 1);
END;

/* ---------- Suppliers ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Suppliers WHERE Name = N'Northstar Electronics')
BEGIN
    INSERT dbo.Suppliers (Name, ContactName, Email, Phone, Address, IsActive) VALUES
    (N'Northstar Electronics', N'Linh Vu', N'sales@northstar.example', N'+84 28 3822 1040', N'District 1, Ho Chi Minh City', 1),
    (N'Loom & Thread Co.', N'Anna Pham', N'orders@loomthread.example', N'+84 28 3920 2560', N'Tan Binh District, Ho Chi Minh City', 1),
    (N'Urban Goods', N'Khoa Nguyen', N'hello@urbangoods.example', N'+84 28 3930 6688', N'Thu Duc City, Ho Chi Minh City', 1);
END;

/* ---------- Products ---------- */
DECLARE @Electronics int = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Electronics');
DECLARE @Apparel int = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Apparel');
DECLARE @Accessories int = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Accessories');
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE SKU = N'HP-401')
BEGIN
    INSERT dbo.Products (Id, SKU, Name, CategoryId, Description, UnitPrice, ReorderLevel, IsActive, CreatedAt, UpdatedAt) VALUES
    ('10000000-0000-0000-0000-000000000001', N'HP-401', N'Wireless Headphones', @Electronics, N'Over-ear wireless headphones', 1250000, 20, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000002', N'HB-552', N'Women''s Pleated Dress', @Apparel, N'Pleated midi dress', 890000, 40, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000003', N'WD-218', N'Leather Handbag', @Accessories, N'Everyday leather handbag', 1490000, 15, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000004', N'SW-309', N'Graphic Sweatshirt', @Apparel, N'Cotton graphic sweatshirt', 590000, 25, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000005', N'KD-114', N'Kids Party Dress', @Apparel, N'Kids occasion dress', 450000, 30, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000006', N'KB-233', N'Bluetooth Keyboard', @Electronics, N'Compact Bluetooth keyboard', 720000, 12, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000007', N'MG-081', N'Ceramic Mug Set', @Accessories, N'Set of two ceramic mugs', 250000, 10, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000008', N'CH-602', N'Desk Lamp', @Electronics, N'Adjustable LED desk lamp', 630000, 8, 1, SYSUTCDATETIME(), SYSUTCDATETIME());
END;

/* ---------- Warehouse stocks ----------
   HP-401  7  / 20  -> Low Stock   (PO-2026-105 Ordered đang về)
   HB-552 346 / 40  -> In Stock    (gồm 20 nhận một phần từ PO-2026-104)
   WD-218   0  / 15 -> Out of Stock (PO-2026-106 Ordered đang về)
   SW-309 246 / 25  -> In Stock
   KD-114  18 / 30  -> Low Stock
   KB-233  63 / 12  -> In Stock
   MG-081 102 / 10  -> In Stock
   CH-602  22 / 8   -> In Stock   */
IF NOT EXISTS (SELECT 1 FROM dbo.WarehouseStocks)
BEGIN
    INSERT dbo.WarehouseStocks (ProductId, WarehouseId, Quantity, UpdatedAt) VALUES
    ('10000000-0000-0000-0000-000000000001', 1, 7,   SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000002', 2, 346, SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000003', 3, 0,   SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000004', 1, 246, SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000005', 2, 18,  SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000006', 3, 63,  SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000007', 1, 102, SYSUTCDATETIME()),
    ('10000000-0000-0000-0000-000000000008', 2, 22,  SYSUTCDATETIME());
END;

/* ---------- Stock movements ledger ----------
   Balance per product/sau tất cả các dòng:
   HP-401  WH-A: +7                                   = 7
   HB-552  WH-B: +300 −94 +120 +20                    = 346
   SW-309  WH-A: +240 +66 −60                         = 246
   KD-114  WH-B: +12 +30 −24                          = 18
   MG-081  WH-A: +90 +44 −32                          = 102
   KB-233  WH-C: +63                                  = 63
   CH-602  WH-B: +22                                  = 22
   WD-218  WH-C: (chưa từng nhập)                     = 0       */
IF NOT EXISTS (SELECT 1 FROM dbo.StockMovements)
BEGIN
    INSERT dbo.StockMovements (Id, ProductId, WarehouseId, UserId, Type, Quantity, UnitPriceAtMovement, TotalValue, Reference, Notes, CreatedAt) VALUES
    /* HP-401: tồn đầu */
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 1, N'Receive', 7,  1250000, 8750000,   N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -30,  SYSUTCDATETIME())),
    /* HB-552: nhập 300, xuất 94, nhập 120 (PO-096), nhận 20 (PO-104) */
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2, 1, N'Receive', 300, 700000,  210000000, N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -170, SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 2, 2, N'Issue',   94,  890000,  83660000,  N'OUT-INV-2026-032', N'Bán cho Saigon Lifestyle',            DATEADD(day, -160, SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 2, 1, N'Receive', 120, 700000,  84000000,  N'PO-2026-096',      N'Nhập đủ đơn PO-2026-096',             DATEADD(day, -88,  SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 2, 1, N'Receive', 20,  700000,  14000000,  N'PO-2026-104',      N'Nhận một phần đơn PO-2026-104',       DATEADD(day, -1,   SYSUTCDATETIME())),
    /* SW-309: nhập 240, nhập 66 (PO-099), xuất 60 */
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 1, 1, N'Receive', 240, 520000,  124800000, N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -140, SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 1, 2, N'Receive', 66,  520000,  34320000,  N'PO-2026-099',      N'Nhập đủ đơn PO-2026-099',             DATEADD(day, -70,  SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 1, 2, N'Issue',   60,  590000,  35400000,  N'OUT-INV-2026-041', N'Bán cho Bluebird Store',              DATEADD(day, -45,  SYSUTCDATETIME())),
    /* KD-114: nhập 12, nhập 30 (PO-101), xuất 24 */
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 2, 1, N'Receive', 12,  450000,  5400000,   N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -120, SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000005', 2, 2, N'Receive', 30,  450000,  13500000,  N'PO-2026-101',      N'Nhập đủ đơn PO-2026-101',             DATEADD(day, -24,  SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000005', 2, 1, N'Issue',   24,  450000,  10800000,  N'OUT-INV-2026-048', N'Bán cho Cửa hàng Hòa Lan',            DATEADD(day, -3,   SYSUTCDATETIME())),
    /* MG-081: nhập 90, nhập 44 (PO-098), xuất 32 */
    ('20000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000007', 1, 1, N'Receive', 90,  210000,  18900000,  N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -75,  SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000007', 1, 2, N'Receive', 44,  210000,  9240000,   N'PO-2026-098',      N'Nhập đủ đơn PO-2026-098',             DATEADD(day, -40,  SYSUTCDATETIME())),
    ('20000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000007', 1, 2, N'Issue',   32,  250000,  8000000,   N'OUT-INV-2026-045', N'Bán chuyển qua đại lý' ,              DATEADD(day, -20,  SYSUTCDATETIME())),
    /* KB-233: tồn đầu */
    ('20000000-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000006', 3, 1, N'Receive', 63,  660000,  41580000,  N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -15,  SYSUTCDATETIME())),
    /* CH-602: tồn đầu */
    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000008', 2, 1, N'Receive', 22,  630000,  13860000,  N'OPENING-STOCK',    N'Tồn kho ban đầu',                     DATEADD(day, -9,   SYSUTCDATETIME()));
END;

/* ---------- Purchase orders ----------
   8 đơn đủ 4 trạng thái -> demo phân trang 7/trang (7 + 1):
   PO-2026-107 Draft · PO-2026-106 Ordered · PO-2026-105 Ordered · PO-2026-104 PartiallyReceived
   PO-2026-101 Received · PO-2026-099 Received · PO-2026-098 Received · PO-2026-096 Received */
IF NOT EXISTS (SELECT 1 FROM dbo.PurchaseOrders WHERE OrderNumber = N'PO-2026-104')
BEGIN
    INSERT dbo.PurchaseOrders (Id, OrderNumber, SupplierId, WarehouseId, Status, ExpectedDate, CreatedAt, CreatedByUserId) VALUES
    ('30000000-0000-0000-0000-000000000001', N'PO-2026-096', 2, 2, N'Received',           DATEADD(day, -90, SYSUTCDATETIME()), DATEADD(day, -95, SYSUTCDATETIME()), 1),
    ('30000000-0000-0000-0000-000000000002', N'PO-2026-098', 1, 1, N'Received',           DATEADD(day, -40, SYSUTCDATETIME()), DATEADD(day, -42, SYSUTCDATETIME()), 2),
    ('30000000-0000-0000-0000-000000000003', N'PO-2026-099', 3, 1, N'Received',           DATEADD(day, -70, SYSUTCDATETIME()), DATEADD(day, -72, SYSUTCDATETIME()), 2),
    ('30000000-0000-0000-0000-000000000004', N'PO-2026-101', 2, 2, N'Received',           DATEADD(day, -24, SYSUTCDATETIME()), DATEADD(day, -26, SYSUTCDATETIME()), 1),
    ('30000000-0000-0000-0000-000000000005', N'PO-2026-104', 2, 2, N'PartiallyReceived', '2026-10-28',                        DATEADD(hour, -96, SYSUTCDATETIME()), 1),
    ('30000000-0000-0000-0000-000000000006', N'PO-2026-105', 1, 1, N'Ordered',            DATEADD(day, +5,  SYSUTCDATETIME()), DATEADD(day, -1,  SYSUTCDATETIME()), 2),
    ('30000000-0000-0000-0000-000000000007', N'PO-2026-106', 3, 3, N'Ordered',            DATEADD(day, +7,  SYSUTCDATETIME()), DATEADD(day, -2,  SYSUTCDATETIME()), 1),
    ('30000000-0000-0000-0000-000000000008', N'PO-2026-107', 2, 2, N'Draft',              NULL,                                DATEADD(day, -3,  SYSUTCDATETIME()), 1);

    INSERT dbo.PurchaseOrderItems (Id, PurchaseOrderId, ProductId, OrderedQuantity, ReceivedQuantity, UnitCost) VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 120, 120, 700000),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 44,  44,  210000),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 66,  66,  520000),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 30,  30,  450000),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 40,  20,  700000),
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 12,  0,   950000),
    ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 15,  0,   950000),
    ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 25,  0,   1150000),
    ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 40,  0,   410000);
END;

/* ---------- Notifications ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Notifications)
BEGIN
    INSERT dbo.Notifications (Id, Category, Title, Message, SenderUserId, IsRead, IsArchived, CreatedAt) VALUES
    ('50000000-0000-0000-0000-000000000001', N'System', N'HP-401 sắp hết hàng', N'Wireless Headphones còn 7/20 (mức tồn tối thiểu) tại Warehouse A. Đơn PO-2026-105 đang chờ nhận.', NULL, 0, 0, DATEADD(hour, -2, SYSUTCDATETIME())),
    ('50000000-0000-0000-0000-000000000002', N'System', N'Leather Handbag đã hết hàng', N'WD-218 tại Warehouse C về 0. Đơn PO-2026-106 (25 chiếc) dự kiến giao sau 7 ngày.', NULL, 0, 0, DATEADD(hour, -5, SYSUTCDATETIME())),
    ('50000000-0000-0000-0000-000000000003', N'Order', N'PO-2026-104 nhận một phần', N'Đơn với Loom & Thread Co.: HB-552 đã nhận 20/40, còn 20 chờ giao. HP-401 chưa nhận.', 1, 0, 0, DATEADD(hour, -26, SYSUTCDATETIME())),
    ('50000000-0000-0000-0000-000000000004', N'Admin', N'Thêm nhân viên mới', N'Alex Nguyen (staff@invento.local) vừa được cấp quyền Staff.', 1, 1, 0, DATEADD(day, -12, SYSUTCDATETIME())),
    ('50000000-0000-0000-0000-000000000005', N'Order', N'PO-2026-101 đã nhập đủ', N'30 Kids Party Dress về Warehouse B, kho đã ghi nhận giao dịch nhập.', 1, 1, 0, DATEADD(day, -24, SYSUTCDATETIME()));
END;
GO

/* ---------- Customers ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Name = N'Minh Anh Retail')
    INSERT dbo.Customers (Name, Email, Phone, CreatedAt) VALUES
    (N'Minh Anh Retail',     N'contact@minhanh.example',    N'+84 90 100 2200', DATEADD(day, -60, SYSUTCDATETIME())),
    (N'Saigon Lifestyle',    N'hello@saigonlifestyle.example', N'+84 91 310 4400', DATEADD(day, -45, SYSUTCDATETIME())),
    (N'Bluebird Store',      N'orders@bluebird.example',    N'+84 98 800 9900', DATEADD(day, -30, SYSUTCDATETIME())),
    (N'Cửa hàng Hòa Lan',    N'hoalan@shop.example',        N'+84 92 555 0011', DATEADD(day, -12, SYSUTCDATETIME()));
GO
