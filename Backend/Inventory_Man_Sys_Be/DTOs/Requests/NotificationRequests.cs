using System.ComponentModel.DataAnnotations;

namespace Inventory_Man_Sys_Be.DTOs.Requests;

public sealed class NotificationCreateRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(2000)] public string Message { get; set; } = string.Empty;
    [Required, StringLength(30)] public string Category { get; set; } = "Admin";
}

public sealed class NotificationFlagRequest
{
    public bool Value { get; set; }
}
