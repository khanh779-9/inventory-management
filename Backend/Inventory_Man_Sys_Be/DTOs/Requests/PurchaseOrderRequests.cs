using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

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

public sealed record PurchaseReceiveLineRequest(Guid ProductId, [Range(1, 100000000)] int Quantity);

public sealed class PurchaseReceiveRequest
{
    [MinLength(1)] public List<PurchaseReceiveLineRequest> Lines { get; set; } = new();
}
