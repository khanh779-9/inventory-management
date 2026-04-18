using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

public sealed class StockMovementRequest
{
    [Required] public Guid ProductId { get; set; }
    [Range(1, int.MaxValue)] public int WarehouseId { get; set; }
    [Range(1, 100000000)] public int Quantity { get; set; }
    [StringLength(100)] public string? Reference { get; set; }
    [StringLength(1000)] public string? Notes { get; set; }
}
