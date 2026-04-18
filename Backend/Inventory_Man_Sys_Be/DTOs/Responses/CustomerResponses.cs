namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record CustomerDto(int Id, string Name, string? Email, string? Phone, DateTime CreatedAt);
