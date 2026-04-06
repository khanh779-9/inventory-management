using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs;

public sealed record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
public sealed record UserDto(int Id, string FullName, string Email, string Role);

public sealed record ProductDto(Guid Id, string SKU, string Name, string Category, int CategoryId,
    string? Description, decimal UnitPrice, int ReorderLevel, int Units, string Status,
    string Location, DateTime UpdatedAt);

public sealed class ProductCreateRequest
{
    [Required, StringLength(50)] public string SKU { get; set; } = string.Empty;
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [StringLength(2000)] public string? Description { get; set; }
    [Range(typeof(decimal), "0", "999999999999")] public decimal UnitPrice { get; set; }
    [Range(0, 1000000)] public int ReorderLevel { get; set; } = 10;
}

public sealed class StockMovementRequest
{
    [Required] public Guid ProductId { get; set; }
    [Range(1, int.MaxValue)] public int WarehouseId { get; set; }
    [Range(1, 100000000)] public int Quantity { get; set; }
    [StringLength(100)] public string? Reference { get; set; }
    [StringLength(1000)] public string? Notes { get; set; }
}

public sealed record StockMovementDto(Guid Id, string Type, string SKU, string ProductName,
    string Warehouse, int Quantity, decimal TotalValue, string? Reference, string? Notes,
    string PerformedBy, DateTime CreatedAt);

public sealed record DashboardSummaryDto(int TotalProducts, int InStockProducts, int LowStockProducts,
    int OutOfStockProducts, int TotalUnits, int WarehouseCount, int SupplierCount,
    IReadOnlyList<MonthlyCashFlowDto> CashFlow, IReadOnlyList<InventoryAlertDto> Alerts,
    IReadOnlyList<ProductDto> RecentProducts, IReadOnlyList<StockMovementDto> RecentMovements);
public sealed record MonthlyCashFlowDto(string Month, decimal Expenses, decimal Income);
public sealed record InventoryAlertDto(string Status, int Count);

public sealed class WarehouseCreateRequest
{
    [Required, StringLength(20)] public string Code { get; set; } = string.Empty;
    [Required, StringLength(100)] public string Name { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Address { get; set; } = string.Empty;
    [StringLength(150)] public string? ManagerName { get; set; }
}
public sealed class SupplierCreateRequest
{
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [StringLength(150)] public string? ContactName { get; set; }
    [EmailAddress, StringLength(256)] public string? Email { get; set; }
    [Phone, StringLength(30)] public string? Phone { get; set; }
    [StringLength(500)] public string? Address { get; set; }
}
public sealed class PurchaseOrderCreateRequest
{
    [Range(1, int.MaxValue)] public int SupplierId { get; set; }
    [Range(1, int.MaxValue)] public int WarehouseId { get; set; }
    public DateTime? ExpectedDate { get; set; }
    [MinLength(1)] public List<PurchaseOrderItemRequest> Items { get; set; } = new();
}
public sealed class PurchaseOrderItemRequest
{
    public Guid ProductId { get; set; }
    [Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Range(typeof(decimal), "0", "999999999999")] public decimal UnitCost { get; set; }
}
public sealed record PurchaseOrderDto(Guid Id, string OrderNumber, string Supplier, string Warehouse,
    string Status, DateTime? ExpectedDate, DateTime CreatedAt, decimal TotalValue, int ItemsCount,
    int OrderedQuantity, int ReceivedQuantity);
public sealed record LookupDto(int Id, string Name, string? Code = null, string? Address = null);

public sealed record PurchaseOrderItemDto(Guid Id, Guid ProductId, string SKU, string ProductName,
    int OrderedQuantity, int ReceivedQuantity, decimal UnitCost);

public sealed record PurchaseReceiveLineRequest(Guid ProductId, [Range(1, 100000000)] int Quantity);

public sealed class PurchaseReceiveRequest
{
    [MinLength(1)] public List<PurchaseReceiveLineRequest> Lines { get; set; } = new();
}

public sealed record ShipmentDto(Guid Id, string OrderNumber, string Supplier, string Warehouse,
    string Status, DateTime? ExpectedDate, DateTime CreatedAt,
    int OrderedQuantity, int ReceivedQuantity, decimal TotalValue);

public sealed record CustomerDto(int Id, string Name, string? Email, string? Phone, DateTime CreatedAt);
public sealed class CustomerCreateRequest
{
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [EmailAddress, StringLength(256)] public string? Email { get; set; }
    [Phone, StringLength(30)] public string? Phone { get; set; }
}

public sealed record CashFlowMonthDto(string Label, decimal Expenses, decimal Income);
public sealed record WarehouseStockValueDto(string Warehouse, decimal StockValue, int DistinctProducts);
public sealed record TopProductDto(string SKU, string Name, decimal ReceiveValue, decimal IssueValue, int TotalUnitsMoved);
public sealed record ReportSummaryDto(IReadOnlyList<WarehouseStockValueDto> StockValueByWarehouse,
    IReadOnlyList<TopProductDto> TopProducts, int ReceiveCount30d, int IssueCount30d,
    decimal ReceiveValue30d, decimal IssueValue30d);

public sealed record UserListItemDto(int Id, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt);

public sealed record NotificationDto(Guid Id, string Category, string Title, string Message,
    string? SenderName, bool IsRead, bool IsArchived, DateTime CreatedAt);
public sealed record NotificationSummaryDto(int Total, int Unread);

public sealed class NotificationCreateRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(2000)] public string Message { get; set; } = string.Empty;
    [Required, StringLength(30)] public string Category { get; set; } = "Admin";
}

public sealed class NotificationFlagRequest
{
    public bool Value { get; set; }
}
