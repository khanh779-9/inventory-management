namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record ProductDto(Guid Id, string SKU, string Name, string Category, int CategoryId,
    string? Description, decimal UnitPrice, int ReorderLevel, int Units, string Status,
    string Location, DateTime UpdatedAt);
