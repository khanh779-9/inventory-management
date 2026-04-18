namespace Inventory_Man_Sys_Be.Services.Implementations;

/// <summary>Quy tắc nghiệp vụ tồn kho: nhận thêm, xuất kho và các bất biến về số lượng.</summary>
public static class StockPolicy
{
    public static void ValidateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
    }

    public static int Apply(int currentQuantity, int quantity, string type)
    {
        ValidateQuantity(quantity);
        var next = type switch
        {
            "Receive" => AddQuantity(currentQuantity, quantity),
            "Issue" => currentQuantity - quantity,
            _ => throw new ArgumentException("Movement type must be Receive or Issue.", nameof(type))
        };
        if (next < 0)
            throw new InvalidOperationException("Not enough stock in the selected warehouse.");
        return next;
    }

    private static int AddQuantity(int currentQuantity, int quantity)
    {
        var next = (long)currentQuantity + quantity;
        if (next > int.MaxValue)
            throw new ArgumentOutOfRangeException(nameof(quantity), "The resulting stock exceeds the supported limit.");
        return (int)next;
    }
}
