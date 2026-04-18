namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record DashboardSummaryDto(int TotalProducts, int InStockProducts, int LowStockProducts,
    int OutOfStockProducts, int TotalUnits, int WarehouseCount, int SupplierCount,
    IReadOnlyList<MonthlyCashFlowDto> CashFlow, IReadOnlyList<InventoryAlertDto> Alerts,
    IReadOnlyList<ProductDto> RecentProducts, IReadOnlyList<StockMovementDto> RecentMovements);

public sealed record MonthlyCashFlowDto(string Month, decimal Expenses, decimal Income);

public sealed record InventoryAlertDto(string Status, int Count);
