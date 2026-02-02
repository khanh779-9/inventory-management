using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Man_Sys_Be.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            var (status, message) = ex switch
            {
                ArgumentOutOfRangeException => (HttpStatusCode.BadRequest, ex.Message),
                OverflowException => (HttpStatusCode.BadRequest, "The requested quantity exceeds the supported limit."),
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
                InvalidOperationException => (HttpStatusCode.Conflict, ex.Message),
                DbUpdateException => (HttpStatusCode.Conflict, "The change conflicts with existing data. Check unique values and related records."),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
            };
            if ((int)status >= 500) logger.LogError(ex, "Unhandled API exception");
            context.Response.StatusCode = (int)status;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { message }));
        }
    }
}
