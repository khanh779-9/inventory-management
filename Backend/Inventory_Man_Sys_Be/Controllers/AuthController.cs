using System.Security.Claims;
using Inventory_Man_Sys_Be.Domain;
using Inventory_Man_Sys_Be.DTOs;
using Inventory_Man_Sys_Be.Data;
using Inventory_Man_Sys_Be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AuthService auth, InventoryDbContext db, IPasswordHasher<AppUser> passwordHasher) : ControllerBase
{
    [AllowAnonymous, HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var response = await auth.LoginAsync(request, ct);
        return response is null ? Unauthorized(new { message = "Email or password is incorrect." }) : Ok(response);
    }

    [Authorize, HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return user is null ? Unauthorized() : Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role));
    }

    [Authorize(Roles = "Admin"), HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<UserListItemDto>>> GetUsers(CancellationToken ct) =>
        Ok(await db.Users.AsNoTracking().OrderBy(x => x.FullName)
            .Select(x => new UserListItemDto(x.Id, x.FullName, x.Email, x.Role, x.IsActive, x.CreatedAt))
            .ToListAsync(ct));

    [Authorize(Roles = "Admin"), HttpGet("users/{id:int}")]
    public async Task<ActionResult<UserDto>> GetUser(int id, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return user is null ? NotFound() : Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role));
    }

    [Authorize(Roles = "Admin"), HttpPost("users")]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request, CancellationToken ct)
    {
        var role = request.Role.Trim();
        if (role is not ("Admin" or "Staff")) return BadRequest(new { message = "Role must be Admin or Staff." });
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email, ct)) return Conflict(new { message = "This email is already in use." });
        var user = new AppUser { FullName = request.FullName.Trim(), Email = email, Role = role };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserDto(user.Id, user.FullName, user.Email, user.Role));
    }
}

public sealed class CreateUserRequest
{
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(100)] public string FullName { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.EmailAddress] public string Email { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.MinLength(10)] public string Password { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required] public string Role { get; set; } = "Staff";
}
