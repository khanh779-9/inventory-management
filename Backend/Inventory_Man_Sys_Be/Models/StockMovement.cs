namespace Inventory_Man_Sys_Be.Models;

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
