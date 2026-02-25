using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs;
using Inventory_Man_Sys_Be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers;

[ApiController, Authorize, Route("api/dashboard")]
public sealed class DashboardController(InventoryDbContext db, InventoryService inventory) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken ct)
    {
        var products = await inventory.GetProductsAsync(null, null, null, ct);
        var start = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-11);
        var movements = await db.StockMovements.AsNoTracking().Where(x => x.CreatedAt >= start)
            .Select(x => new { x.Type, x.TotalValue, x.CreatedAt }).ToListAsync(ct);
        var cashFlow = Enumerable.Range(0, 12).Select(i => start.AddMonths(i)).Select(month =>
        {
            var rows = movements.Where(x => x.CreatedAt.Year == month.Year && x.CreatedAt.Month == month.Month);
            return new MonthlyCashFlowDto(month.ToString("MMM"), rows.Where(x => x.Type == "Receive").Sum(x => x.TotalValue),
                rows.Where(x => x.Type == "Issue").Sum(x => x.TotalValue));
        }).ToArray();
        var alerts = new[]
        {
            new InventoryAlertDto("In Stock", products.Count(x => x.Status == "In Stock")),
            new InventoryAlertDto("Low Stock", products.Count(x => x.Status == "Low Stock")),
            new InventoryAlertDto("Out of Stock", products.Count(x => x.Status == "Out of Stock"))
        };
        var recentProducts = products.OrderByDescending(x => x.UpdatedAt).Take(8).ToArray();
        var recentMovements = await inventory.GetMovementsAsync(8, ct);
        return Ok(new DashboardSummaryDto(products.Count, alerts[0].Count, alerts[1].Count, alerts[2].Count,
            products.Sum(x => x.Units), await db.Warehouses.CountAsync(x => x.IsActive, ct),
            await db.Suppliers.CountAsync(x => x.IsActive, ct), cashFlow, alerts, recentProducts, recentMovements));
    }
}
