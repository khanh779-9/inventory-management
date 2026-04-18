using System.Security.Claims;
using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Inventory_Man_Sys_Be.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Procurement;

[ApiController, Authorize, Route("api/purchase-orders")]
public sealed class PurchaseOrdersController(InventoryDbContext db, IInventoryService inventory, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PurchaseOrderDto>>> Get(CancellationToken ct)
    {
        var orders = await db.PurchaseOrders.AsNoTracking().OrderByDescending(x => x.CreatedAt)
            .Select(x => new PurchaseOrderDto(x.Id, x.OrderNumber, x.Supplier.Name, x.Warehouse.Name, x.Status,
                x.ExpectedDate, x.CreatedAt, x.Items.Sum(i => i.UnitCost * i.OrderedQuantity), x.Items.Count,
                x.Items.Sum(i => i.OrderedQuantity), x.Items.Sum(i => i.ReceivedQuantity)))
            .ToListAsync(ct);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PurchaseOrderDto>> GetById(Guid id, CancellationToken ct)
    {
        var order = await db.PurchaseOrders.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new PurchaseOrderDto(x.Id, x.OrderNumber, x.Supplier.Name, x.Warehouse.Name, x.Status,
                x.ExpectedDate, x.CreatedAt, x.Items.Sum(i => i.UnitCost * i.OrderedQuantity), x.Items.Count,
                x.Items.Sum(i => i.OrderedQuantity), x.Items.Sum(i => i.ReceivedQuantity)))
            .SingleOrDefaultAsync(ct);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("{id:guid}/items")]
    public async Task<ActionResult<IReadOnlyList<PurchaseOrderItemDto>>> GetItems(Guid id, CancellationToken ct)
    {
        var orderExists = await db.PurchaseOrders.AsNoTracking().AnyAsync(x => x.Id == id, ct);
        if (!orderExists) return NotFound();
        var items = await db.PurchaseOrderItems.AsNoTracking().Where(x => x.PurchaseOrderId == id)
            .Select(x => new PurchaseOrderItemDto(x.Id, x.ProductId, x.Product.SKU, x.Product.Name,
                x.OrderedQuantity, x.ReceivedQuantity, x.UnitCost))
            .ToListAsync(ct);
        return Ok(items);
    }

    /// <summary>Nhận hàng cho đơn: cộng tồn kho, ghi movements và cập nhật tiến độ.</summary>
    [HttpPost("{id:guid}/receive")]
    public async Task<ActionResult<ShipmentDto>> Receive(Guid id, PurchaseReceiveRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        var shipment = await inventory.ReceivePurchaseOrderAsync(id, request, userId, ct);
        return Ok(shipment);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseOrderDto>> Create(PurchaseOrderCreateRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        var supplier = await db.Suppliers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.SupplierId && x.IsActive, ct);
        if (supplier is null) return BadRequest(new { message = "Select a valid supplier." });
        var warehouse = await db.Warehouses.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.WarehouseId && x.IsActive, ct);
        if (warehouse is null) return BadRequest(new { message = "Select a valid warehouse." });
        var productIds = request.Items.Select(x => x.ProductId).Distinct().ToArray();
        if (productIds.Length != request.Items.Count || await db.Products.CountAsync(x => productIds.Contains(x.Id) && x.IsActive, ct) != productIds.Length)
            return BadRequest(new { message = "Each order line must reference a unique active product." });
        var order = new PurchaseOrder
        {
            OrderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd-HHmmssfff}", SupplierId = request.SupplierId,
            WarehouseId = request.WarehouseId, ExpectedDate = request.ExpectedDate, CreatedByUserId = userId, Status = "Draft",
            Items = mapper.Map<List<PurchaseOrderItem>>(request.Items)
        };
        db.PurchaseOrders.Add(order); await db.SaveChangesAsync(ct);
        var result = new PurchaseOrderDto(order.Id, order.OrderNumber, supplier.Name, warehouse.Name, order.Status,
            order.ExpectedDate, order.CreatedAt, order.Items.Sum(i => i.UnitCost * i.OrderedQuantity), order.Items.Count,
            order.Items.Sum(i => i.OrderedQuantity), order.Items.Sum(i => i.ReceivedQuantity));
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, result);
    }
}
