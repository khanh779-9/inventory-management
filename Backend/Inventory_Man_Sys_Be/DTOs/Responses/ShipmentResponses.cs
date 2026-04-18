namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record ShipmentDto(Guid Id, string OrderNumber, string Supplier, string Warehouse,
    string Status, DateTime? ExpectedDate, DateTime CreatedAt,
    int OrderedQuantity, int ReceivedQuantity, decimal TotalValue);
