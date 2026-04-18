using AutoMapper;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Models;
using Inventory_Man_Sys_Be.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers.Catalog;

[ApiController]
[Authorize]
[Route("api/products")]
public sealed class ProductsController(InventoryDbContext db, IInventoryService inventory, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> Get([FromQuery] string? search, [FromQuery] string? status,
        [FromQuery] int? categoryId, CancellationToken ct) => Ok(await inventory.GetProductsAsync(search, status, categoryId, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken ct)
    {
        var product = (await inventory.GetProductsAsync(null, null, null, ct)).SingleOrDefault(x => x.Id == id);
        return product is null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<ActionResult<ProductDto>> Create(ProductCreateRequest request, CancellationToken ct)
    {
        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct)) return BadRequest(new { message = "Select a valid category." });
        var product = mapper.Map<Product>(request);
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        var result = (await inventory.GetProductsAsync(product.SKU, null, null, ct)).Single(x => x.Id == product.Id);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, result);
    }

    [Authorize(Roles = "Admin"), HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, ProductCreateRequest request, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == id && x.IsActive, ct);
        if (product is null) return NotFound();
        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct)) return BadRequest(new { message = "Select a valid category." });
        mapper.Map(request, product);
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok((await inventory.GetProductsAsync(product.SKU, null, null, ct)).Single(x => x.Id == product.Id));
    }

    [Authorize(Roles = "Admin"), HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == id && x.IsActive, ct);
        if (product is null) return NotFound();
        product.IsActive = false; product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
