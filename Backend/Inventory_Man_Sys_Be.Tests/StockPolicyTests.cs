using Inventory_Man_Sys_Be.Services;
using Xunit;

namespace Inventory_Man_Sys_Be.Tests;

public sealed class StockPolicyTests
{
    [Theory]
    [InlineData(10, 5, "Receive", 15)]
    [InlineData(10, 5, "Issue", 5)]
    [InlineData(0, 4, "Receive", 4)]
    public void Apply_ValidMovement_UpdatesQuantity(int current, int quantity, string type, int expected) =>
        Assert.Equal(expected, StockPolicy.Apply(current, quantity, type));

    [Fact]
    public void Apply_RejectsOverflowWhenReceiving() =>
        Assert.Throws<ArgumentOutOfRangeException>(() => StockPolicy.Apply(int.MaxValue, 1, "Receive"));

    [Fact]
    public void Apply_PreventsNegativeStock() =>
        Assert.Throws<InvalidOperationException>(() => StockPolicy.Apply(3, 4, "Issue"));

    [Fact]
    public void Apply_RejectsZeroOrNegativeMovement() =>
        Assert.Throws<ArgumentOutOfRangeException>(() => StockPolicy.Apply(3, 0, "Receive"));
}
