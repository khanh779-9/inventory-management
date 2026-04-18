namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record NotificationDto(Guid Id, string Category, string Title, string Message,
    string? SenderName, bool IsRead, bool IsArchived, DateTime CreatedAt);

public sealed record NotificationSummaryDto(int Total, int Unread);
