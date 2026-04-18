using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Directory;

[ApiController, Authorize, Route("api/customers")]
public sealed class CustomersController(InventoryDbContext db, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerDto>>> Get(CancellationToken ct) =>
        Ok(await db.Customers.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new CustomerDto(x.Id, x.Name, x.Email, x.Phone, x.CreatedAt)).ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(CustomerCreateRequest request, CancellationToken ct)
    {
        var entity = mapper.Map<Customer>(request);
        if (await db.Customers.AnyAsync(x => x.Name == entity.Name, ct)) return Conflict(new { message = "A customer with this name already exists." });
        db.Customers.Add(entity);
        await db.SaveChangesAsync(ct);
        return Created($"/api/customers/{entity.Id}", new CustomerDto(entity.Id, entity.Name, entity.Email, entity.Phone, entity.CreatedAt));
    }
}
