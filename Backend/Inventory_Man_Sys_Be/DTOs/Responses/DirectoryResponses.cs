namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record LookupDto(int Id, string Name, string? Code = null, string? Address = null);

public sealed record SupplierDto(int Id, string Name, string? ContactName, string? Email, string? Phone, string? Address);
