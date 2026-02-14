using System.Data;
using System.Security.Claims;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.Domain;
using Inventory_Man_Sys_Be.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Services;

public sealed class InventoryService(InventoryDbContext db)
{
    public async Task<StockMovementDto> MoveStockAsync(StockMovementRequest request, int userId, string type, CancellationToken ct)
    {
        StockPolicy.ValidateQuantity(request.Quantity);
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == request.ProductId && x.IsActive, ct)
            ?? throw new KeyNotFoundException("Product was not found or is inactive.");
        var warehouse = await db.Warehouses.SingleOrDefaultAsync(x => x.Id == request.WarehouseId && x.IsActive, ct)
            ?? throw new KeyNotFoundException("Warehouse was not found or is inactive.");
        var performedBy = await db.Users.AsNoTracking().Where(x => x.Id == userId).Select(x => x.FullName).SingleOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Authenticated user was not found.");
        var stock = await db.WarehouseStocks.SingleOrDefaultAsync(x => x.ProductId == request.ProductId && x.WarehouseId == request.WarehouseId, ct);
        if (stock is null)
        {
            if (type == "Issue") throw new InvalidOperationException("This warehouse has no stock for the selected product.");
            stock = new WarehouseStock { ProductId = product.Id, WarehouseId = warehouse.Id, Quantity = 0 };
            db.WarehouseStocks.Add(stock);
        }

        stock.Quantity = StockPolicy.Apply(stock.Quantity, request.Quantity, type);
        stock.UpdatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        var movement = new StockMovement
        {
            ProductId = product.Id,
            WarehouseId = warehouse.Id,
            UserId = userId,
            Type = type,
            Quantity = request.Quantity,
            UnitPriceAtMovement = product.UnitPrice,
            TotalValue = product.UnitPrice * request.Quantity,
            Reference = request.Reference?.Trim(),
            Notes = request.Notes?.Trim()
        };
        db.StockMovements.Add(movement);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return new StockMovementDto(movement.Id, movement.Type, product.SKU, product.Name, warehouse.Name,
            movement.Quantity, movement.TotalValue, movement.Reference, movement.Notes, performedBy, movement.CreatedAt);
    }

    public async Task<IReadOnlyList<StockMovementDto>> GetMovementsAsync(int take, CancellationToken ct)
    {
        take = Math.Clamp(take, 1, 200);
        return await db.StockMovements.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt).Take(take)
            .Select(x => new StockMovementDto(x.Id, x.Type, x.Product.SKU, x.Product.Name, x.Warehouse.Name,
                x.Quantity, x.TotalValue, x.Reference, x.Notes, x.User.FullName, x.CreatedAt))
            .ToListAsync(ct);
    }

    /// <summary>Nhận hàng cho đơn đặt hàng: cộng tồn kho, ghi movements và cập nhật tiến độ từng dòng.</summary>
    public async Task<ShipmentDto> ReceivePurchaseOrderAsync(Guid orderId, PurchaseReceiveRequest request, int userId, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var order = await db.PurchaseOrders.Include(x => x.Items).Include(x => x.Supplier).Include(x => x.Warehouse)
            .SingleOrDefaultAsync(x => x.Id == orderId, ct)
            ?? throw new KeyNotFoundException("Purchase order was not found.");
        if (order.Status is "Cancelled" or "Received") throw new InvalidOperationException($"Order {order.OrderNumber} is already {order.Status.ToLowerInvariant()}.");

        if (request.Lines.Any(x => x.Quantity < 1)) throw new InvalidOperationException("Each received quantity must be at least 1.");
        if (request.Lines.Select(x => x.ProductId).Distinct().Count() != request.Lines.Count)
            throw new InvalidOperationException("Each line must reference a unique product.");

        foreach (var line in request.Lines)
        {
            var item = order.Items.SingleOrDefault(x => x.ProductId == line.ProductId)
                ?? throw new InvalidOperationException("Product does not belong to this purchase order.");
            var remaining = item.OrderedQuantity - item.ReceivedQuantity;
            if (line.Quantity > remaining)
                throw new InvalidOperationException($"Product {item.Product.SKU} only has {remaining} unit(s) remaining to receive.");
        }

        var lastWarehouseName = order.Warehouse.Name;
        foreach (var line in request.Lines)
        {
            var item = order.Items.Single(x => x.ProductId == line.ProductId);
            item.ReceivedQuantity += line.Quantity;
            var stock = await db.WarehouseStocks.SingleOrDefaultAsync(x => x.ProductId == item.ProductId && x.WarehouseId == order.WarehouseId, ct);
            if (stock is null)
            {
                stock = new WarehouseStock { ProductId = item.ProductId, WarehouseId = order.WarehouseId, Quantity = 0 };
                db.WarehouseStocks.Add(stock);
            }
            stock.Quantity += line.Quantity;
            stock.UpdatedAt = DateTime.UtcNow;
            db.StockMovements.Add(new StockMovement
            {
                ProductId = item.ProductId, WarehouseId = order.WarehouseId, UserId = userId,
                Type = "Receive", Quantity = line.Quantity, UnitPriceAtMovement = item.UnitCost,
                TotalValue = item.UnitCost * line.Quantity, Reference = order.OrderNumber,
                Notes = "Received against purchase order"
            });
        }

        order.Status = order.Items.All(x => x.ReceivedQuantity >= x.OrderedQuantity) ? "Received" : "PartiallyReceived";
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ShipmentDto(order.Id, order.OrderNumber, order.Supplier.Name, lastWarehouseName, order.Status,
            order.ExpectedDate, order.CreatedAt, order.Items.Sum(x => x.OrderedQuantity),
            order.Items.Sum(x => x.ReceivedQuantity), order.Items.Sum(x => x.UnitCost * x.OrderedQuantity));
    }

    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync(string? search, string? status, int? categoryId, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking().Where(x => x.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.Name.Contains(term) || x.SKU.Contains(term));
        }
        if (categoryId is not null) query = query.Where(x => x.CategoryId == categoryId);
        var items = await query.OrderBy(x => x.Name).Select(x => new ProductDto(x.Id, x.SKU, x.Name,
            x.Category.Name, x.CategoryId, x.Description, x.UnitPrice, x.ReorderLevel,
            x.Stocks.Sum(s => (int?)s.Quantity) ?? 0, "", x.Stocks.OrderBy(s => s.Warehouse.Name).Select(s => s.Warehouse.Name).FirstOrDefault() ?? "Unassigned", x.UpdatedAt)).ToListAsync(ct);
        var result = items.Select(x => x with { Status = x.Units <= 0 ? "Out of Stock" : x.Units <= x.ReorderLevel ? "Low Stock" : "In Stock" });
        if (!string.IsNullOrWhiteSpace(status)) result = result.Where(x => string.Equals(x.Status, status, StringComparison.OrdinalIgnoreCase));
        return result.ToList();
    }
}
