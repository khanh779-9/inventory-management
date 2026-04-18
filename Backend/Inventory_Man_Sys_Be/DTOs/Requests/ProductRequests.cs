using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

public sealed class ProductCreateRequest
{
    [Required, StringLength(50)] public string SKU { get; set; } = string.Empty;
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [StringLength(2000)] public string? Description { get; set; }
    [Range(typeof(decimal), "0", "999999999999")] public decimal UnitPrice { get; set; }
    [Range(0, 1000000)] public int ReorderLevel { get; set; } = 10;
}
