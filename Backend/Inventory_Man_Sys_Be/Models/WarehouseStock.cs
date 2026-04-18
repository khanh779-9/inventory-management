namespace Inventory_Man_Sys_Be.Models;

public sealed class WarehouseStock
{
    public Guid ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int Quantity { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}
