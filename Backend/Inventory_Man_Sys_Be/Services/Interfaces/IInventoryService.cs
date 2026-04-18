using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;

namespace Inventory_Man_Sys_Be.Services.Interfaces;

public interface IInventoryService
{
    Task<StockMovementDto> MoveStockAsync(StockMovementRequest request, int userId, string type, CancellationToken ct);
    Task<IReadOnlyList<StockMovementDto>> GetMovementsAsync(int take, CancellationToken ct);
    Task<ShipmentDto> ReceivePurchaseOrderAsync(Guid orderId, PurchaseReceiveRequest request, int userId, CancellationToken ct);
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(string? search, string? status, int? categoryId, CancellationToken ct);
}
