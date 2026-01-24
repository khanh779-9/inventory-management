using Inventory_Man_Sys_Be.Domain;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Data;

public sealed class InventoryDbContext(DbContextOptions<InventoryDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<WarehouseStock> WarehouseStocks => Set<WarehouseStock>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<AppUser>().Property(x => x.FullName).HasMaxLength(100);
        modelBuilder.Entity<AppUser>().Property(x => x.Email).HasMaxLength(256);
        modelBuilder.Entity<AppUser>().Property(x => x.Role).HasMaxLength(30);
        modelBuilder.Entity<Category>().Property(x => x.Name).HasMaxLength(100);
        modelBuilder.Entity<Category>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Warehouse>().Property(x => x.Code).HasMaxLength(20);
        modelBuilder.Entity<Warehouse>().Property(x => x.Name).HasMaxLength(100);
        modelBuilder.Entity<Warehouse>().Property(x => x.Address).HasMaxLength(500);
        modelBuilder.Entity<Warehouse>().Property(x => x.ManagerName).HasMaxLength(150);
        modelBuilder.Entity<Warehouse>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(x => x.SKU).IsUnique();
        modelBuilder.Entity<Product>().Property(x => x.SKU).HasMaxLength(50);
        modelBuilder.Entity<Product>().Property(x => x.Description).HasMaxLength(2000);
        modelBuilder.Entity<Product>().Property(x => x.Name).HasMaxLength(200);
        modelBuilder.Entity<Product>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<WarehouseStock>().HasKey(x => new { x.ProductId, x.WarehouseId });
        modelBuilder.Entity<WarehouseStock>().HasOne(x => x.Product).WithMany(x => x.Stocks).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<WarehouseStock>().HasOne(x => x.Warehouse).WithMany(x => x.Stocks).HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<StockMovement>().Property(x => x.UnitPriceAtMovement).HasPrecision(18, 2);
        modelBuilder.Entity<StockMovement>().Property(x => x.TotalValue).HasPrecision(18, 2);
        modelBuilder.Entity<StockMovement>().HasIndex(x => new { x.ProductId, x.CreatedAt });
        modelBuilder.Entity<StockMovement>().HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<StockMovement>().HasOne(x => x.Product).WithMany(x => x.Movements).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<StockMovement>().HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PurchaseOrder>().Property(x => x.OrderNumber).HasMaxLength(50);
        modelBuilder.Entity<PurchaseOrder>().Property(x => x.Status).HasMaxLength(30);
        modelBuilder.Entity<PurchaseOrder>().HasIndex(x => x.OrderNumber).IsUnique();
        modelBuilder.Entity<PurchaseOrder>().HasOne(x => x.CreatedByUser).WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PurchaseOrderItem>().Property(x => x.UnitCost).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseOrderItem>().HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PurchaseOrderItem>().HasOne(x => x.PurchaseOrder).WithMany(x => x.Items).HasForeignKey(x => x.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Supplier>().Property(x => x.Name).HasMaxLength(200);
        modelBuilder.Entity<Supplier>().Property(x => x.ContactName).HasMaxLength(150);
        modelBuilder.Entity<Supplier>().Property(x => x.Email).HasMaxLength(256);
        modelBuilder.Entity<Supplier>().Property(x => x.Phone).HasMaxLength(30);
        modelBuilder.Entity<Supplier>().Property(x => x.Address).HasMaxLength(500);
        modelBuilder.Entity<Customer>().Property(x => x.Name).HasMaxLength(200);
        modelBuilder.Entity<Customer>().Property(x => x.Email).HasMaxLength(256);
        modelBuilder.Entity<Customer>().Property(x => x.Phone).HasMaxLength(30);
        modelBuilder.Entity<Customer>().HasIndex(x => x.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
        modelBuilder.Entity<Notification>().Property(x => x.Category).HasMaxLength(30);
        modelBuilder.Entity<Notification>().Property(x => x.Title).HasMaxLength(200);
        modelBuilder.Entity<Notification>().Property(x => x.Message).HasMaxLength(2000);
        modelBuilder.Entity<Notification>().HasIndex(x => x.CreatedAt);
        modelBuilder.Entity<Notification>().HasIndex(x => new { x.IsArchived, x.IsRead });
        modelBuilder.Entity<Notification>().HasOne(x => x.Sender).WithMany().HasForeignKey(x => x.SenderUserId).OnDelete(DeleteBehavior.SetNull);
    }
}
