namespace Inventory_Man_Sys_Be.Domain;

public sealed class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public sealed class Warehouse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<WarehouseStock> Stocks { get; set; } = new List<WarehouseStock>();
}

public sealed class Supplier
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Category Category { get; set; } = null!;
    public ICollection<WarehouseStock> Stocks { get; set; } = new List<WarehouseStock>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
}

public sealed class WarehouseStock
{
    public Guid ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int Quantity { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}

public sealed class StockMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = "Receive"; // Receive, Issue, Adjustment
    public int Quantity { get; set; }
    public decimal UnitPriceAtMovement { get; set; }
    public decimal TotalValue { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}

public sealed class PurchaseOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public int WarehouseId { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Ordered, PartiallyReceived, Received, Cancelled
    public DateTime? ExpectedDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CreatedByUserId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public AppUser CreatedByUser { get; set; } = null!;
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}

public sealed class PurchaseOrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PurchaseOrderId { get; set; }
    public Guid ProductId { get; set; }
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

public sealed class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Category { get; set; } = "System"; // System (hệ thống), Admin (quản trị), Order (đơn hàng)
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? SenderUserId { get; set; }            // null = thông báo hệ thống
    public bool IsRead { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public AppUser? Sender { get; set; }
}
