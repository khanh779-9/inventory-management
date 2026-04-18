namespace Inventory_Man_Sys_Be.Models;

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
