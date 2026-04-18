namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);

public sealed record UserDto(int Id, string FullName, string Email, string Role);

public sealed record UserListItemDto(int Id, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt);
