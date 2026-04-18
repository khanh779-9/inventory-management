# Inventory Management Clean Architecture — Design

> **Status: OBSOLETE (2026-10-29)** — Plan này đã bị thay thế bởi phương án refactor theo cấu trúc backend
> của dự án `e-commerce-book-platform` (single-project, folder-based: `Models/`, `DTOs/{Requests,Responses}`,
> `Services/{Interfaces,Implementations}`, `Mapping/`, `Controllers/<domain>/`).
> Không thực thi plan/spec bên dưới nữa.
## Intent

Refactor the inventory backend from one ASP.NET Core project, where controllers commonly use `InventoryDbContext` directly, into a complete Clean Architecture solution. The goal is to make business rules and use cases independent of ASP.NET Core, Entity Framework Core, SQL Server, JWT, password hashing, and configuration. This enables focused unit tests, replaceable infrastructure, and feature work that does not leak persistence concerns into the API layer.

The refactor applies to the backend under `Backend/`; the existing frontend and public API routes are out of scope.

## Goals

- Create a .NET 10 solution with four production projects: `Domain`, `Application`, `Infrastructure`, and `WebApi`.
- Preserve existing HTTP routes, request/response JSON contracts, authorization behavior, and status-code semantics unless a current response is accidental or unsafe.
- Move every existing endpoint into an explicit Application use case; Web API controllers must not reference EF Core, the persistence context, entity types, or configuration directly.
- Keep domain invariants (positive stock movement, no negative stock, non-negative product data, valid purchase-order receiving) in Domain code.
- Access persistence, token generation, password hashing, clock, and database initialization only through Application-defined ports and Infrastructure implementations.
- Retain SQL Server, JWT authentication, Swagger, CORS, rate limiting, security headers, global exception handling, health endpoint, and development seed data.
- Add executable unit and integration coverage at each architectural boundary.

## Non-goals

- Redesigning UI or changing frontend request formats.
- Adding e-commerce concerns such as cart, payment, Redis, or employee/customer API namespaces.
- Introducing microservices, a message broker, CQRS infrastructure, or a generic repository abstraction merely for pattern compliance.
- Automatically migrating an existing `EnsureCreated` database without an explicit operator-approved baseline procedure.

## Current-state constraints

- The current backend is a single `Inventory_Man_Sys_Be` project plus a test project. It stores all entities in `Domain/Entities.cs`, most contracts in `DTOs/Contracts.cs`, and lets nine controllers inject `InventoryDbContext` directly.
- `InventoryService` owns inventory mutation/query logic and `StockPolicy` already captures basic stock invariants; authentication is coupled to EF Core, ASP.NET Identity's hasher, JWT types, and `IConfiguration`.
- The current schema originates from `Database.EnsureCreatedAsync`; there is no migrations source in the repository. A migration-first system must protect existing development data.
- The current `ApiSmokeTests` boot the API without connecting to the database and must continue to validate the public health endpoint and protected product endpoint.

## Chosen approach

The chosen approach is a full four-project Clean Architecture refactor. Dependencies flow only inward:

```text
WebApi ──────> Application <────── Infrastructure
   │                │                    │
   └────────────> Domain <────────────────┘
```

- `Domain` contains entities, value rules, domain exceptions, and pure domain services only. It references no other project or framework package.
- `Application` contains feature use cases, commands/queries, result models, validators, and ports. It references only `Domain`.
- `Infrastructure` contains EF Core mappings and repositories, SQL Server setup, JWT and password adapters, clock, and seeding. It references `Application` and `Domain`.
- `WebApi` contains controllers, API contracts/mapping, middleware, authentication/authorization configuration, OpenAPI, and composition-root registrations. It references `Application` and `Infrastructure`; it does not reference EF Core implementation types.

Focused repository ports are preferred over a generic repository. For example, `IProductRepository`, `IWarehouseStockRepository`, `IPurchaseOrderRepository`, and read-query ports express the operations their feature needs. `IUnitOfWork` coordinates persistence and transactions. This keeps EF Core expressions and `DbSet` out of Application while avoiding a leaky generic abstraction.

Application use cases will be organized by feature (`Identity`, `Catalog`, `Directory`, `Inventory`, `Procurement`, `Notifications`, `Reporting`) rather than a single global `Services` folder. Each use case owns its command/query model, handler, validation, and result model.

## Public API compatibility

Existing public endpoints remain at their current locations:

- `/api/auth`, `/api/products`, `/api/inventory`, `/api/purchase-orders`, `/api/shipments`
- `/api/warehouses`, `/api/suppliers`, `/api/customers`, `/api/notifications`
- `/api/dashboard`, `/api/reports`, and `/health`

The external request and response shapes currently declared in `DTOs/Contracts.cs` will be moved to `WebApi/Contracts` and split by feature into `Requests` and `Responses`. Controllers map these HTTP contracts to Application commands/queries and map Application results back to the preserved API DTOs. This keeps HTTP and serialization details out of Application while avoiding frontend changes.

Role policy behavior remains: authenticated users can use protected routes; `Admin` retains restricted management actions. The API will retain its JWT issuer, audience, expiry, and claims names so previously issued compatible tokens work until expiry.

## Domain design

Entities will be moved from `Entities.cs` into one file per aggregate or closely related child entity. The aggregate roots are `AppUser`, `Product`, `Warehouse`, `Supplier`, `Customer`, `PurchaseOrder`, and `Notification`.

- `Product` owns activation/deactivation and mutable catalog values.
- `WarehouseStock` owns receive/issue quantity transitions and rejects invalid or insufficient changes.
- `StockMovement` is created only from validated stock transitions and records its unit price/value snapshot.
- `PurchaseOrder` owns item creation and receiving state transitions; it cannot receive beyond ordered quantities.
- Stateless calculations presently in `StockPolicy` remain pure domain code, folded into `WarehouseStock` or a small domain policy when that makes the invariant clearer.

Domain exceptions represent business failures such as an invalid movement quantity, insufficient stock, unknown state transition, or invalid receipt. Application translates them to stable application failures; WebApi's exception middleware maps them to appropriate HTTP responses without exposing framework or database details.

## Application design

`Application` exposes one handler-oriented use-case interface per feature and depends on ports such as:

- persistence: focused repositories/read-query ports plus `IUnitOfWork`;
- identity: `IPasswordHasher`, `IAccessTokenGenerator`, and `ICurrentUser`;
- system: `IClock` and `ITransactionRunner` only where a transaction boundary is needed.

No Application source may import `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore.*`, `Microsoft.IdentityModel.*`, `System.IdentityModel.Tokens.Jwt`, or read configuration.

Features and use cases cover all current behavior:

- `Identity`: log in, get current user, list/get/create users.
- `Catalog`: list/get/create/update/deactivate products.
- `Directory`: list/create warehouses and suppliers; list/create customers.
- `Inventory`: list movements; receive and issue stock.
- `Procurement`: list/get purchase orders, list items, create order, receive order, list shipments.
- `Notifications`: list/filter, summary, create, mark read, archive.
- `Reporting`: dashboard summary, cash flow, and report summary.

Commands validate external input before persistence and queries return immutable application read models. Application handlers are registered through a single `AddApplication()` extension method. They remain asynchronous and accept `CancellationToken` consistently.

## Infrastructure design

`Infrastructure` implements every Application port. `InventoryDbContext` moves here, as do per-entity EF Core configurations under `Persistence/Configurations`; neither belongs in Domain or Application. Repositories use `AsNoTracking` for read paths and load write aggregates with only the navigation data required for their invariants.

`JwtAccessTokenGenerator` and `AspNetPasswordHasher` implement the identity ports. JWT options bind from configuration in Infrastructure, but validation setup remains in the WebApi composition root. `SystemClock` provides UTC time.

Development initialization becomes migration-first. The normal startup path uses `Database.MigrateAsync` only when explicitly enabled by configuration. `DevelopmentDataSeeder` seeds only an empty migrated database. For databases created previously with `EnsureCreated`, the application must fail with clear operator guidance rather than attempting a destructive migration; the documented upgrade procedure is: back up the database, verify it matches the initial migration schema, create the EF migration-history baseline, then enable migrations. Production startup never auto-creates a database.

`AddInfrastructure(configuration)` owns SQL Server, port implementation registration, and database initializer registration. It exposes only this composition extension to WebApi.

## Web API design

`WebApi` becomes the host executable and composition root. Controllers become thin endpoint adapters: resolve `ICurrentUser` from claims, map HTTP request DTOs to Application input, call one use case, and return the mapped HTTP result. No controller receives a repository, `DbContext`, or an entity.

Existing exception behavior is consolidated in middleware using RFC 7807-compatible `ProblemDetails`, preserving explicit endpoint-level `401`, `403`, `404`, `400`, and `201/204` outcomes. Authentication, rate limiting, CORS, Swagger, security headers, and health endpoint configuration remain here. Health checks must never require authentication.

`WebApi` refers only to the `IServiceCollection` extensions from Application and Infrastructure. It does not use a service-locator pattern outside the narrowly scoped database initialization hosted service.

## Test strategy

The existing test project splits into focused projects:

- `Domain.Tests`: pure xUnit tests for stock, purchase-order, and entity invariants; no database/framework setup.
- `Application.Tests`: use-case tests with hand-written fake ports that confirm commands, authorization-sensitive input, errors, and cancellation propagation without EF Core.
- `Infrastructure.IntegrationTests`: EF Core SQL Server/SQLite-compatible tests for mappings, repository queries, transaction boundaries, and seed behavior. SQL Server-specific configuration remains tested where needed.
- `WebApi.IntegrationTests`: `WebApplicationFactory` tests for route compatibility, authentication, authorization, validation, error mapping, and `/health`.

New production behavior is implemented test-first: each test must be observed failing before its implementation is written. The full solution test suite must be green before the refactor is considered complete.

## Migration and delivery constraints

- Target framework remains `net10.0`; package versions remain compatible with the existing .NET 10 stack.
- The old `Inventory_Man_Sys_Be` project is replaced rather than retained as a duplicate host. Git history preserves it; no parallel legacy runtime is kept.
- A root `.sln` is added and all production/test projects are included.
- No secret moves into source control. Development defaults remain explicitly marked as local-only; JWT/connection configuration continues to allow environment-variable overrides.
- Documentation will include solution layout, dependency rules, local development/test commands, and the migration-baseline procedure.

## Success criteria

- `dotnet test` from the solution root passes all Domain, Application, Infrastructure, and WebApi tests.
- The production projects compile with the permitted reference graph only: `Domain` none; `Application -> Domain`; `Infrastructure -> Application, Domain`; `WebApi -> Application, Infrastructure`.
- `rg "InventoryDbContext|DbContext|DbSet" Backend/InventoryManagement.WebApi` returns no controller/presentation usage.
- Existing API smoke tests and representative endpoint compatibility tests pass.
- Domain and Application projects have no EF Core, JWT, ASP.NET MVC, or configuration dependency.
- A developer can locate each business operation by its feature/use case and test it without starting the web host or SQL Server.
