namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record PurchaseOrderDto(Guid Id, string OrderNumber, string Supplier, string Warehouse,
    string Status, DateTime? ExpectedDate, DateTime CreatedAt, decimal TotalValue, int ItemsCount,
    int OrderedQuantity, int ReceivedQuantity);

public sealed record PurchaseOrderItemDto(Guid Id, Guid ProductId, string SKU, string ProductName,
    int OrderedQuantity, int ReceivedQuantity, decimal UnitCost);
