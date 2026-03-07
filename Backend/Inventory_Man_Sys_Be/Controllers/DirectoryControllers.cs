using System.Security.Claims;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.Domain;
using Inventory_Man_Sys_Be.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers;

[ApiController, Authorize, Route("api/warehouses")]
public sealed class WarehousesController(InventoryDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> Get(CancellationToken ct) =>
        Ok(await db.Warehouses.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name)
            .Select(x => new LookupDto(x.Id, x.Name, x.Code, x.Address)).ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<IActionResult> Create(WarehouseCreateRequest request, CancellationToken ct)
    {
        var entity = new Warehouse { Code = request.Code.Trim().ToUpperInvariant(), Name = request.Name.Trim(), Address = request.Address.Trim(), ManagerName = request.ManagerName?.Trim() };
        db.Warehouses.Add(entity); await db.SaveChangesAsync(ct);
        return Created($"/api/warehouses/{entity.Id}", new LookupDto(entity.Id, entity.Name, entity.Code, entity.Address));
    }
}

[ApiController, Authorize, Route("api/suppliers")]
public sealed class SuppliersController(InventoryDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SupplierDto>>> Get(CancellationToken ct) =>
        Ok(await db.Suppliers.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name)
            .Select(x => new SupplierDto(x.Id, x.Name, x.ContactName, x.Email, x.Phone, x.Address)).ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<IActionResult> Create(SupplierCreateRequest request, CancellationToken ct)
    {
        var entity = new Supplier { Name = request.Name.Trim(), ContactName = request.ContactName?.Trim(), Email = request.Email?.Trim().ToLowerInvariant(), Phone = request.Phone?.Trim(), Address = request.Address?.Trim() };
        db.Suppliers.Add(entity); await db.SaveChangesAsync(ct);
        return Created($"/api/suppliers/{entity.Id}", new SupplierDto(entity.Id, entity.Name, entity.ContactName, entity.Email, entity.Phone, entity.Address));
    }
}

public sealed record SupplierDto(int Id, string Name, string? ContactName, string? Email, string? Phone, string? Address);
