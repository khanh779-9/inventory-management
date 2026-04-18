using System.Security.Claims;
using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Notifications;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController(InventoryDbContext db, IMapper mapper) : ControllerBase
{
    // GET api/notifications?category=System&archived=false&unreadOnly=true&limit=100
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> Get(
        [FromQuery] string? category, [FromQuery] bool archived = false,
        [FromQuery] bool unreadOnly = false, [FromQuery] int limit = 200, CancellationToken ct = default)
    {
        var query = db.Notifications.AsNoTracking().Where(x => x.IsArchived == archived);
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(x => x.Category == category);
        if (unreadOnly) query = query.Where(x => !x.IsRead);
        var rows = await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(Math.Clamp(limit, 1, 500))
            .Select(x => new NotificationDto(x.Id, x.Category, x.Title, x.Message,
                x.Sender == null ? null : x.Sender.FullName, x.IsRead, x.IsArchived, x.CreatedAt))
            .ToListAsync(ct);
        return Ok(rows);
    }

    // GET api/notifications/summary — đếm tổng + chưa đọc (bỏ qua lưu trữ)
    [HttpGet("summary")]
    public async Task<ActionResult<NotificationSummaryDto>> GetSummary(CancellationToken ct)
    {
        var rows = await db.Notifications.AsNoTracking()
            .Where(x => !x.IsArchived)
            .Select(x => x.IsRead)
            .ToListAsync(ct);
        return Ok(new NotificationSummaryDto(rows.Count, rows.Count(x => !x)));
    }

    // POST api/notifications — gửi thông báo (gán người gửi là user hiện tại)
    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create(NotificationCreateRequest request, CancellationToken ct)
    {
        var category = request.Category.Trim();
        if (category is not ("System" or "Admin" or "Order"))
            return BadRequest(new { message = "Category must be System, Admin or Order." });
        var notification = mapper.Map<Notification>(request);
        notification.SenderUserId = CurrentUserId();
        notification.CreatedAt = DateTime.UtcNow;
        db.Notifications.Add(notification);
        await db.SaveChangesAsync(ct);
        return Created("", new NotificationDto(notification.Id, notification.Category, notification.Title,
            notification.Message, null, notification.IsRead, notification.IsArchived, notification.CreatedAt));
    }

    // PATCH api/notifications/{id}/read — body { "value": true|false }
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> SetRead(Guid id, NotificationFlagRequest request, CancellationToken ct)
    {
        var notification = await db.Notifications.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (notification is null) return NotFound();
        notification.IsRead = request.Value;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // PATCH api/notifications/{id}/archive — body { "value": true|false }
    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> SetArchived(Guid id, NotificationFlagRequest request, CancellationToken ct)
    {
        var notification = await db.Notifications.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (notification is null) return NotFound();
        notification.IsArchived = request.Value;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private int? CurrentUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
