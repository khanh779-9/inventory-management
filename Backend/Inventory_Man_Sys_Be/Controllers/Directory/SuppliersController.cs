using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Directory;

[ApiController, Authorize, Route("api/suppliers")]
public sealed class SuppliersController(InventoryDbContext db, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SupplierDto>>> Get(CancellationToken ct) =>
        Ok(await db.Suppliers.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name)
            .Select(x => new SupplierDto(x.Id, x.Name, x.ContactName, x.Email, x.Phone, x.Address)).ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<IActionResult> Create(SupplierCreateRequest request, CancellationToken ct)
    {
        var entity = mapper.Map<Supplier>(request);
        db.Suppliers.Add(entity);
        await db.SaveChangesAsync(ct);
        return Created($"/api/suppliers/{entity.Id}", new SupplierDto(entity.Id, entity.Name, entity.ContactName, entity.Email, entity.Phone, entity.Address));
    }
}
