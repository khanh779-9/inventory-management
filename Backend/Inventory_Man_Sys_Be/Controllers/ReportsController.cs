using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers;

/// <summary>Tổng hợp dữ liệu thật từ StockMovements (nhập/xuất) và WarehouseStocks (giá trị tồn).</summary>
[ApiController, Authorize, Route("api/reports")]
public sealed class ReportsController(InventoryDbContext db) : ControllerBase
{
    /// <summary>Dòng tiền nhập (chi) / xuất (thu) theo tháng, dựa trên giá trị movements.</summary>
    [HttpGet("cash-flow")]
    public async Task<ActionResult<IReadOnlyList<CashFlowMonthDto>>> CashFlow([FromQuery] int months = 12, CancellationToken ct = default)
    {
        months = Math.Clamp(months, 3, 24);
        var from = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-(months - 1));
        var rows = await db.StockMovements.AsNoTracking()
            .Where(x => x.CreatedAt >= from)
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Expenses = g.Sum(x => x.Type == "Receive" ? x.TotalValue : 0m),
                Income = g.Sum(x => x.Type == "Issue" ? x.TotalValue : 0m)
            })
            .ToListAsync(ct);
        var result = rows.OrderBy(x => x.Year).ThenBy(x => x.Month)
            .Select(x => new CashFlowMonthDto($"T{x.Month:00}/{x.Year}", x.Expenses, x.Income)).ToList();
        return Ok(result);
    }

    /// <summary>Báo cáo tổng hợp: giá trị tồn theo kho, sản phẩm sôi động nhất, tần suất nhập/xuất 30 ngày.</summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ReportSummaryDto>> Summary(CancellationToken ct)
    {
        var since30d = DateTime.UtcNow.AddDays(-30);

        var stockRows = await db.WarehouseStocks.AsNoTracking()
            .Where(x => x.Product.IsActive)
            .Select(x => new { Warehouse = x.Warehouse.Name, Value = (decimal)x.Quantity * x.Product.UnitPrice })
            .ToListAsync(ct);
        var stockByWarehouse = stockRows.GroupBy(x => x.Warehouse)
            .Select(g => new WarehouseStockValueDto(g.Key, g.Sum(x => x.Value), g.Count()))
            .OrderByDescending(x => x.StockValue)
            .ToList();

        var movementRows = await db.StockMovements.AsNoTracking()
            .Where(x => x.CreatedAt >= since30d)
            .Select(x => new { x.Product.SKU, x.Product.Name, x.Type, x.TotalValue, x.Quantity })
            .ToListAsync(ct);
        var topProducts = movementRows.GroupBy(x => new { x.SKU, x.Name })
            .Select(g => new TopProductDto(g.Key.SKU, g.Key.Name,
                g.Where(x => x.Type == "Receive").Sum(x => x.TotalValue),
                g.Where(x => x.Type == "Issue").Sum(x => x.TotalValue),
                g.Sum(x => x.Quantity)))
            .OrderByDescending(x => x.ReceiveValue + x.IssueValue)
            .Take(5)
            .ToList();

        var receiveRows = movementRows.Where(x => x.Type == "Receive").ToList();
        var issueRows = movementRows.Where(x => x.Type == "Issue").ToList();

        return Ok(new ReportSummaryDto(stockByWarehouse, topProducts,
            receiveRows.Count, issueRows.Count,
            receiveRows.Sum(x => x.TotalValue), issueRows.Sum(x => x.TotalValue)));
    }
}
