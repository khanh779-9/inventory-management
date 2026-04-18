using System.Security.Claims;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.DTOs.Responses;
using Inventory_Man_Sys_Be.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Man_Sys_Be.Controllers.Inventory;

[ApiController, Authorize]
[Route("api/inventory")]
public sealed class InventoryController(IInventoryService inventory) : ControllerBase
{
    [HttpGet("movements")]
    public async Task<ActionResult<IReadOnlyList<StockMovementDto>>> Movements([FromQuery] int take = 50, CancellationToken ct = default) =>
        Ok(await inventory.GetMovementsAsync(take, ct));

    [HttpPost("receive")]
    public async Task<ActionResult<StockMovementDto>> Receive(StockMovementRequest request, CancellationToken ct) =>
        await Move(request, "Receive", ct);

    [HttpPost("issue")]
    public async Task<ActionResult<StockMovementDto>> Issue(StockMovementRequest request, CancellationToken ct) =>
        await Move(request, "Issue", ct);

    private async Task<ActionResult<StockMovementDto>> Move(StockMovementRequest request, string type, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        return Ok(await inventory.MoveStockAsync(request, userId, type, ct));
    }
}
