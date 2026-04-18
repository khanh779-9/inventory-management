namespace Inventory_Man_Sys_Be.DTOs.Responses;

public sealed record CashFlowMonthDto(string Label, decimal Expenses, decimal Income);

public sealed record WarehouseStockValueDto(string Warehouse, decimal StockValue, int DistinctProducts);

public sealed record TopProductDto(string SKU, string Name, decimal ReceiveValue, decimal IssueValue, int TotalUnitsMoved);

public sealed record ReportSummaryDto(IReadOnlyList<WarehouseStockValueDto> StockValueByWarehouse,
    IReadOnlyList<TopProductDto> TopProducts, int ReceiveCount30d, int IssueCount30d,
    decimal ReceiveValue30d, decimal IssueValue30d);
