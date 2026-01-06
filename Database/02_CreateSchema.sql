/* Run after 01_CreateDatabase.sql. Safe to re-run on an existing InventoDb database. */
USE [InventoDb];
GO
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
        FullName nvarchar(100) NOT NULL,
        Email nvarchar(256) NOT NULL,
        PasswordHash nvarchar(max) NOT NULL,
        Role nvarchar(30) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'Staff',
        IsActive bit NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
    );
    CREATE UNIQUE INDEX IX_Users_Email ON dbo.Users(Email);
END;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Categories PRIMARY KEY,
        Name nvarchar(100) NOT NULL,
        Description nvarchar(max) NULL
    );
    CREATE UNIQUE INDEX IX_Categories_Name ON dbo.Categories(Name);
END;
IF OBJECT_ID(N'dbo.Warehouses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Warehouses (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Warehouses PRIMARY KEY,
        Code nvarchar(20) NOT NULL,
        Name nvarchar(100) NOT NULL,
        Address nvarchar(500) NOT NULL,
        ManagerName nvarchar(150) NULL,
        IsActive bit NOT NULL CONSTRAINT DF_Warehouses_IsActive DEFAULT 1
    );
    CREATE UNIQUE INDEX IX_Warehouses_Code ON dbo.Warehouses(Code);
END;
IF OBJECT_ID(N'dbo.Suppliers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Suppliers (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Suppliers PRIMARY KEY,
        Name nvarchar(200) NOT NULL,
        ContactName nvarchar(150) NULL,
        Email nvarchar(256) NULL,
        Phone nvarchar(30) NULL,
        Address nvarchar(500) NULL,
        IsActive bit NOT NULL CONSTRAINT DF_Suppliers_IsActive DEFAULT 1,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_Suppliers_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
        SKU nvarchar(50) NOT NULL,
        Name nvarchar(200) NOT NULL,
        CategoryId int NOT NULL,
        Description nvarchar(2000) NULL,
        UnitPrice decimal(18,2) NOT NULL,
        ReorderLevel int NOT NULL CONSTRAINT DF_Products_ReorderLevel DEFAULT 10,
        IsActive bit NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
        CreatedAt datetime2 NOT NULL,
        UpdatedAt datetime2 NOT NULL,
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id)
    );
    CREATE UNIQUE INDEX IX_Products_SKU ON dbo.Products(SKU);
END;
IF OBJECT_ID(N'dbo.WarehouseStocks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WarehouseStocks (
        ProductId uniqueidentifier NOT NULL,
        WarehouseId int NOT NULL,
        Quantity int NOT NULL,
        UpdatedAt datetime2 NOT NULL,
        CONSTRAINT PK_WarehouseStocks PRIMARY KEY (ProductId, WarehouseId),
        CONSTRAINT FK_WarehouseStocks_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
        CONSTRAINT FK_WarehouseStocks_Warehouses FOREIGN KEY (WarehouseId) REFERENCES dbo.Warehouses(Id),
        CONSTRAINT CK_WarehouseStocks_Quantity CHECK (Quantity >= 0)
    );
END;
IF OBJECT_ID(N'dbo.StockMovements', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.StockMovements (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_StockMovements PRIMARY KEY,
        ProductId uniqueidentifier NOT NULL,
        WarehouseId int NOT NULL,
        UserId int NOT NULL,
        Type nvarchar(max) NOT NULL,
        Quantity int NOT NULL,
        UnitPriceAtMovement decimal(18,2) NOT NULL,
        TotalValue decimal(18,2) NOT NULL,
        Reference nvarchar(max) NULL,
        Notes nvarchar(max) NULL,
        CreatedAt datetime2 NOT NULL,
        CONSTRAINT FK_StockMovements_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
        CONSTRAINT FK_StockMovements_Warehouses FOREIGN KEY (WarehouseId) REFERENCES dbo.Warehouses(Id),
        CONSTRAINT FK_StockMovements_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
        CONSTRAINT CK_StockMovements_Quantity CHECK (Quantity > 0)
    );
    CREATE INDEX IX_StockMovements_ProductId_CreatedAt ON dbo.StockMovements(ProductId, CreatedAt);
END;
IF OBJECT_ID(N'dbo.PurchaseOrders', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PurchaseOrders (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_PurchaseOrders PRIMARY KEY,
        OrderNumber nvarchar(50) NOT NULL,
        SupplierId int NOT NULL,
        WarehouseId int NOT NULL,
        Status nvarchar(30) NOT NULL,
        ExpectedDate datetime2 NULL,
        CreatedAt datetime2 NOT NULL,
        CreatedByUserId int NOT NULL,
        CONSTRAINT FK_PurchaseOrders_Suppliers FOREIGN KEY (SupplierId) REFERENCES dbo.Suppliers(Id),
        CONSTRAINT FK_PurchaseOrders_Warehouses FOREIGN KEY (WarehouseId) REFERENCES dbo.Warehouses(Id),
        CONSTRAINT FK_PurchaseOrders_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id)
    );
    CREATE UNIQUE INDEX IX_PurchaseOrders_OrderNumber ON dbo.PurchaseOrders(OrderNumber);
END;
IF OBJECT_ID(N'dbo.PurchaseOrderItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PurchaseOrderItems (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_PurchaseOrderItems PRIMARY KEY,
        PurchaseOrderId uniqueidentifier NOT NULL,
        ProductId uniqueidentifier NOT NULL,
        OrderedQuantity int NOT NULL,
        ReceivedQuantity int NOT NULL,
        UnitCost decimal(18,2) NOT NULL,
        CONSTRAINT FK_PurchaseOrderItems_PurchaseOrders FOREIGN KEY (PurchaseOrderId) REFERENCES dbo.PurchaseOrders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PurchaseOrderItems_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
        CONSTRAINT CK_PurchaseOrderItems_Quantity CHECK (OrderedQuantity > 0 AND ReceivedQuantity >= 0)
    );
END;
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
        Category nvarchar(30) NOT NULL CONSTRAINT DF_Notifications_Category DEFAULT N'System',
        Title nvarchar(200) NOT NULL,
        Message nvarchar(2000) NOT NULL,
        SenderUserId int NULL,
        IsRead bit NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
        IsArchived bit NOT NULL CONSTRAINT DF_Notifications_IsArchived DEFAULT 0,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (SenderUserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL
    );
    CREATE INDEX IX_Notifications_CreatedAt ON dbo.Notifications(CreatedAt DESC);
    CREATE INDEX IX_Notifications_Archived_Read ON dbo.Notifications(IsArchived, IsRead);
END;
GO

IF OBJECT_ID(N'dbo.Customers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Customers (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Customers PRIMARY KEY,
        Name nvarchar(200) NOT NULL,
        Email nvarchar(256) NULL,
        Phone nvarchar(30) NULL,
        CreatedAt datetime2 NOT NULL
    );
    CREATE UNIQUE INDEX IX_Customers_Email ON dbo.Customers(Email) WHERE Email IS NOT NULL;
END;
GO
