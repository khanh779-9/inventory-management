namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record StockMovementDto(Guid Id, string Type, string SKU, string ProductName,
    string Warehouse, int Quantity, decimal TotalValue, string? Reference, string? Notes,
    string PerformedBy, DateTime CreatedAt);
