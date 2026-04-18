using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Directory;

[ApiController, Authorize, Route("api/warehouses")]
public sealed class WarehousesController(InventoryDbContext db, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> Get(CancellationToken ct) =>
        Ok(await db.Warehouses.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name)
            .Select(x => new LookupDto(x.Id, x.Name, x.Code, x.Address)).ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<IActionResult> Create(WarehouseCreateRequest request, CancellationToken ct)
    {
        var entity = mapper.Map<Warehouse>(request);
        db.Warehouses.Add(entity);
        await db.SaveChangesAsync(ct);
        return Created($"/api/warehouses/{entity.Id}", new LookupDto(entity.Id, entity.Name, entity.Code, entity.Address));
    }
}
