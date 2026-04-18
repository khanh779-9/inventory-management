using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

public sealed class WarehouseCreateRequest
{
    [Required, StringLength(20)] public string Code { get; set; } = string.Empty;
    [Required, StringLength(100)] public string Name { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Address { get; set; } = string.Empty;
    [StringLength(150)] public string? ManagerName { get; set; }
}

public sealed class SupplierCreateRequest
{
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [StringLength(150)] public string? ContactName { get; set; }
    [EmailAddress, StringLength(256)] public string? Email { get; set; }
    [Phone, StringLength(30)] public string? Phone { get; set; }
    [StringLength(500)] public string? Address { get; set; }
}

public sealed class CustomerCreateRequest
{
    [Required, StringLength(200)] public string Name { get; set; } = string.Empty;
    [EmailAddress, StringLength(256)] public string? Email { get; set; }
    [Phone, StringLength(30)] public string? Phone { get; set; }
}
