using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Inventory_Man_Sys_Be.Tests;

public sealed class ApiSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    public ApiSmokeTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:AutoCreate"] = "false",
                ["ConnectionStrings:DefaultConnection"] = "Server=localhost;Database=InventoTest;User Id=sa;Password=Test_Password_123!;TrustServerCertificate=True;Encrypt=False",
                ["Jwt:Key"] = "TEST_ONLY_CHANGE_ME_TO_A_SECRET_KEY_WITH_32_BYTES_MINIMUM",
                ["Jwt:Issuer"] = "Inventory_Man_Sys_Be",
                ["Jwt:Audience"] = "Invento.Frontend"
            })));
    }

    [Fact]
    public async Task HealthEndpoint_IsPublicAndHealthy()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/health");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task ProductsEndpoint_RequiresAuthentication()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/products");
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
