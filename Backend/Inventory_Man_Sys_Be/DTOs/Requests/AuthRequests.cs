using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

public sealed record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);

public sealed class CreateUserRequest
{
    [Required, StringLength(100)] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(10)] public string Password { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = "Staff";
}
