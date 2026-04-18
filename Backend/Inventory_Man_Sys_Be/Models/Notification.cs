namespace Inventory_Man_Sys_Be.Models;

public sealed class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Category { get; set; } = "System"; // System (hệ thống), Admin (quản trị), Order (đơn hàng)
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? SenderUserId { get; set; }            // null = thông báo hệ thống
    public bool IsRead { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public AppUser? Sender { get; set; }
}
