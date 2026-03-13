using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers;

/// <summary>Các lô hàng đang chờ nhận: đơn đã đặt (Ordered) hoặc nhận một phần (PartiallyReceived).</summary>
[ApiController, Authorize, Route("api/shipments")]
public sealed class ShipmentsController(InventoryDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShipmentDto>>> Get(CancellationToken ct) =>
        Ok(await db.PurchaseOrders.AsNoTracking()
            .Where(x => x.Status == "Ordered" || x.Status == "PartiallyReceived")
            .OrderBy(x => x.ExpectedDate ?? x.CreatedAt)
            .Select(x => new ShipmentDto(x.Id, x.OrderNumber, x.Supplier.Name, x.Warehouse.Name, x.Status,
                x.ExpectedDate, x.CreatedAt,
                x.Items.Sum(i => i.OrderedQuantity), x.Items.Sum(i => i.ReceivedQuantity),
                x.Items.Sum(i => i.UnitCost * i.OrderedQuantity))).ToListAsync(ct));
}
