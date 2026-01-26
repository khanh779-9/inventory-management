using Inventory_Man_Sys_Be.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Data;

public static class DbSeeder
{
    public static async Task InitializeAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        await db.Database.EnsureCreatedAsync(ct);
        if (await db.Users.AnyAsync(ct)) return;

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();
        var admin = new AppUser
        {
            FullName = configuration["Seed:AdminName"] ?? "Rakib Kowshar",
            Email = configuration["Seed:AdminEmail"] ?? "admin@invento.local",
            Role = "Admin"
        };
        admin.PasswordHash = hasher.HashPassword(admin, configuration["Seed:AdminPassword"] ?? "Inventory123!");
        var staff = new AppUser
        {
            FullName = configuration["Seed:StaffName"] ?? "Alex Nguyen",
            Email = configuration["Seed:StaffEmail"] ?? "staff@invento.local",
            Role = "Staff"
        };
        staff.PasswordHash = hasher.HashPassword(staff, configuration["Seed:StaffPassword"] ?? "Inventory123!");
        db.Users.AddRange(admin, staff);

        var categories = new[]
        {
            new Category { Name = "Electronics", Description = "Electronic devices and accessories" },
            new Category { Name = "Apparel", Description = "Clothing and textile" },
            new Category { Name = "Accessories", Description = "Bags and personal accessories" },
            new Category { Name = "Home & Living", Description = "Home products" }
        };
        db.Categories.AddRange(categories);
        var warehouses = new[]
        {
            new Warehouse { Code = "WH-A", Name = "Warehouse A", Address = "District 7, Ho Chi Minh City", ManagerName = "Minh Tran" },
            new Warehouse { Code = "WH-B", Name = "Warehouse B", Address = "Thu Duc City, Ho Chi Minh City", ManagerName = "Linh Pham" },
            new Warehouse { Code = "WH-C", Name = "Warehouse C", Address = "Binh Tan District, Ho Chi Minh City", ManagerName = "Tuan Le" }
        };
        db.Warehouses.AddRange(warehouses);
        var suppliers = new[]
        {
            new Supplier { Name = "Northstar Electronics", ContactName = "Linh Vu", Email = "sales@northstar.example", Phone = "+84 28 3822 1040", Address = "District 1, Ho Chi Minh City" },
            new Supplier { Name = "Loom & Thread Co.", ContactName = "Anna Pham", Email = "orders@loomthread.example", Phone = "+84 28 3920 2560", Address = "Tan Binh District, Ho Chi Minh City" },
            new Supplier { Name = "Urban Goods", ContactName = "Khoa Nguyen", Email = "hello@urbangoods.example", Phone = "+84 28 3930 6688", Address = "Thu Duc City, Ho Chi Minh City" }
        };
        db.Suppliers.AddRange(suppliers);
        await db.SaveChangesAsync(ct);

        var electronics = categories.Single(x => x.Name == "Electronics");
        var apparel = categories.Single(x => x.Name == "Apparel");
        var accessories = categories.Single(x => x.Name == "Accessories");
        var products = new[]
        {
            new Product { SKU = "HP-401", Name = "Wireless Headphones", CategoryId = electronics.Id, UnitPrice = 1250000m, ReorderLevel = 20, Description = "Over-ear wireless headphones" },
            new Product { SKU = "HB-552", Name = "Women's Pleated Dress", CategoryId = apparel.Id, UnitPrice = 890000m, ReorderLevel = 40, Description = "Pleated midi dress" },
            new Product { SKU = "WD-218", Name = "Leather Handbag", CategoryId = accessories.Id, UnitPrice = 1490000m, ReorderLevel = 15, Description = "Everyday leather handbag" },
            new Product { SKU = "SW-309", Name = "Graphic Sweatshirt", CategoryId = apparel.Id, UnitPrice = 590000m, ReorderLevel = 25, Description = "Cotton graphic sweatshirt" },
            new Product { SKU = "KD-114", Name = "Kids Party Dress", CategoryId = apparel.Id, UnitPrice = 450000m, ReorderLevel = 30, Description = "Kids occasion dress" },
            new Product { SKU = "KB-233", Name = "Bluetooth Keyboard", CategoryId = electronics.Id, UnitPrice = 720000m, ReorderLevel = 12, Description = "Compact Bluetooth keyboard" },
            new Product { SKU = "MG-081", Name = "Ceramic Mug Set", CategoryId = accessories.Id, UnitPrice = 250000m, ReorderLevel = 10, Description = "Set of two ceramic mugs" },
            new Product { SKU = "CH-602", Name = "Desk Lamp", CategoryId = electronics.Id, UnitPrice = 630000m, ReorderLevel = 8, Description = "Adjustable LED desk lamp" }
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);

        var quantities = new[] { 7, 346, 0, 246, 18, 63, 102, 22 };
        for (var i = 0; i < products.Length; i++)
        {
            var warehouse = warehouses[i % warehouses.Length];
            db.WarehouseStocks.Add(new WarehouseStock { ProductId = products[i].Id, WarehouseId = warehouse.Id, Quantity = quantities[i] });
            if (quantities[i] > 0)
            {
                db.StockMovements.Add(new StockMovement
                {
                    ProductId = products[i].Id, WarehouseId = warehouse.Id, UserId = admin.Id,
                    Type = "Receive", Quantity = quantities[i], UnitPriceAtMovement = products[i].UnitPrice,
                    TotalValue = quantities[i] * products[i].UnitPrice, Reference = "OPENING-STOCK", Notes = "Opening inventory seed",
                    CreatedAt = DateTime.UtcNow.AddDays(-i * 3)
                });
            }
        }
        db.Customers.AddRange(
            new Customer { Name = "Minh Anh Retail", Email = "contact@minhanh.example", Phone = "+84 90 100 2200" },
            new Customer { Name = "Saigon Lifestyle", Email = "hello@saigonlifestyle.example", Phone = "+84 91 310 4400" },
            new Customer { Name = "Bluebird Store", Email = "orders@bluebird.example", Phone = "+84 98 800 9900" });
        await db.SaveChangesAsync(ct);
    }
}
