# Inventory Management Clean Architecture Implementation Plan

> **Status: OBSOLETE (2026-10-29)** — Plan này bị đóng theo quyết định refactor backend theo cấu trúc
> của dự án `e-commerce-book-platform` thay vì tách 4 project Clean Architecture. See
> `docs/superpowers/specs/2026-10-28-inventory-clean-architecture-design.md`. Refactor đã hoàn thành
> (AutoMapper, Models, DTOs/Requests+Responses, Services/Interfaces+Implementations, Controllers theo domain folder).

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the inventory backend single-layer API with a testable .NET 10 Clean Architecture solution while preserving its public HTTP contract.

**Architecture:** Create Domain, Application, Infrastructure, and WebApi projects with dependencies directed inwards. Domain holds business invariants, Application owns feature use cases and ports, Infrastructure implements persistence/security ports, and WebApi adapts HTTP contracts to Application without EF Core references in controllers.

**Tech Stack:** .NET 10, ASP.NET Core, Entity Framework Core SQL Server, JWT bearer authentication, xUnit, FluentValidation, Swashbuckle.

**Spec:** docs/superpowers/specs/2026-10-28-inventory-clean-architecture-design.md

## Global Constraints

- Preserve existing /api/* routes, JSON fields, role semantics, and successful HTTP status codes.
- Target net10.0; keep secrets outside source control and retain environment-variable configuration overrides.
- Domain has no project/package dependency; Application references only Domain; Infrastructure references Application and Domain; WebApi references Application and Infrastructure.
- Application and Domain must not reference EF Core, ASP.NET MVC, JWT libraries, or IConfiguration.
- Controllers must not inject DbContext, repositories, or entity types.
- Use focused feature ports and IUnitOfWork; do not introduce a generic repository.
- Use migrations for new databases; do not automatically alter a database created by EnsureCreated.
- Implement each production behavior test-first and observe its test fail before writing its implementation.

## Review Focus

- A stock issue greater than available quantity must fail without changing stock or recording a movement (Task 4).
- A receipt whose combined quantities exceed an ordered line must fail atomically, including no partial stock updates (Tasks 4 and 6).
- A non-admin user must be rejected from admin-only management endpoints even with a valid JWT (Task 8).
- Invalid external input must yield 400 with current request field names rather than a server error (Task 8).
- An existing EnsureCreated database must not be silently migrated or reseeded (Task 7).

---

## File Structure

    Backend/
      InventoryManagement.sln
      InventoryManagement.Domain/{Entities,Exceptions,Policies}/
      InventoryManagement.Application/{Abstractions,Features}/
      InventoryManagement.Infrastructure/{Persistence,Security,System,Initialization}/
      InventoryManagement.WebApi/{Contracts,Controllers,Middleware,Services}/
      InventoryManagement.{Domain.Tests,Application.Tests,Infrastructure.IntegrationTests,WebApi.IntegrationTests}/

### Task 1: Establish solution and dependency graph

**Files:**
- Create: Backend/InventoryManagement.sln
- Create: Backend/InventoryManagement.{Domain,Application,Infrastructure,WebApi}/*.csproj
- Create: Backend/InventoryManagement.{Domain.Tests,Application.Tests,Infrastructure.IntegrationTests,WebApi.IntegrationTests}/*.csproj
- Test: Backend/InventoryManagement.Application.Tests/DependencyBoundaryTests.cs

**Interfaces:** Produces the enforced graph: Application -> Domain, Infrastructure -> Application and Domain, and WebApi -> Application and Infrastructure.

- [ ] Write a failing source/reference-graph test asserting Domain has no framework imports and Application references only Domain.
- [ ] Run: dotnet test Backend/InventoryManagement.Application.Tests --filter FullyQualifiedName~DependencyBoundaryTests. Expect failure because projects do not exist.
- [ ] Create the solution, nine projects, package references, and only permitted project references.
- [ ] Re-run the focused test. Expect pass.
- [ ] Commit: chore: create clean architecture solution.

### Task 2: Build framework-free domain aggregates and invariants

**Files:**
- Create: Backend/InventoryManagement.Domain/Entities/{AppUser,Category,Customer,Notification,Product,Supplier,Warehouse,WarehouseStock,StockMovement,PurchaseOrder,PurchaseOrderItem}.cs
- Create: Backend/InventoryManagement.Domain/Exceptions/{DomainException,InsufficientStockException,InvalidStockMovementException}.cs
- Create: Backend/InventoryManagement.Domain/Policies/StockPolicy.cs
- Test: Backend/InventoryManagement.Domain.Tests/{WarehouseStockTests,PurchaseOrderTests,ProductTests}.cs

**Interfaces:** Produces WarehouseStock Receive/Issue operations, PurchaseOrder receipt behavior, and aggregate mutation methods consumed by Application.

- [ ] Write failing tests for valid receive/issue, zero/negative quantities, insufficient issue, integer overflow, product deactivation, exact purchase receipt, and over-receipt.
- [ ] Run: dotnet test Backend/InventoryManagement.Domain.Tests. Expect failure because domain types do not exist.
- [ ] Move one entity per file and implement invariants without EF attributes or framework imports.
- [ ] Re-run Domain tests. Expect pass.
- [ ] Commit: feat: add framework-free inventory domain.

### Task 3: Add Application ports and identity/catalog/directory use cases

**Files:**
- Create: Backend/InventoryManagement.Application/Abstractions/Persistence/{IUnitOfWork,IUserRepository,IProductRepository,ICatalogReadStore,IDirectoryRepository}.cs
- Create: Backend/InventoryManagement.Application/Abstractions/{Security,System}/{IPasswordHasher,IAccessTokenGenerator,ICurrentUser,IClock}.cs
- Create: Backend/InventoryManagement.Application/Features/{Identity,Catalog,Directory}/*.cs
- Create: Backend/InventoryManagement.Application/DependencyInjection.cs
- Test: Backend/InventoryManagement.Application.Tests/{Identity,Catalog,Directory}/*Tests.cs

**Interfaces:** Produces IIdentityUseCases, ICatalogUseCases, and IDirectoryUseCases with HTTP-neutral inputs/results and CancellationToken.

- [ ] Write failing fake-port tests for login success/failure/inactive user, current-user lookup, duplicate SKU/category rejection, product create/update/deactivate, and warehouse/supplier/customer creation.
- [ ] Run focused Application tests. Expect failure.
- [ ] Implement ports, handlers, validators, immutable read models, and AddApplication; handlers call IUnitOfWork.SaveChangesAsync after valid mutations.
- [ ] Run all Application tests. Expect pass.
- [ ] Commit: feat: add identity catalog and directory use cases.

### Task 4: Add inventory and procurement transactional use cases

**Files:**
- Create: Backend/InventoryManagement.Application/Abstractions/Persistence/{IInventoryRepository,IPurchaseOrderRepository,ITransactionRunner}.cs
- Create: Backend/InventoryManagement.Application/Features/{Inventory,Procurement}/*.cs
- Test: Backend/InventoryManagement.Application.Tests/{Inventory,Procurement}/*Tests.cs

**Interfaces:** Produces IInventoryUseCases for movements/receive/issue and IProcurementUseCases for purchase orders and shipments.

- [ ] Write failing tests proving invalid issues never save, valid receipts record stock valuation, and an over-receipt restores all aggregate state.
- [ ] Run focused Application tests. Expect failure.
- [ ] Implement handlers behind the transaction port; create movements with current actor/time and commit once.
- [ ] Run all Application tests. Expect pass.
- [ ] Commit: feat: add inventory and procurement use cases.

### Task 5: Add notification and reporting use cases

**Files:**
- Create: Backend/InventoryManagement.Application/Abstractions/Persistence/{INotificationRepository,IReportingReadStore}.cs
- Create: Backend/InventoryManagement.Application/Features/{Notifications,Reporting}/*.cs
- Test: Backend/InventoryManagement.Application.Tests/{Notifications,Reporting}/*Tests.cs

**Interfaces:** Produces INotificationUseCases and IReportingUseCases, returning immutable data required by current API contracts.

- [ ] Write failing tests for notification filtering/counts/creation/state updates and invalid report-limit normalization.
- [ ] Run focused Application tests. Expect failure.
- [ ] Implement ports and handlers; repositories own projections while Application owns input normalization and business failures.
- [ ] Run all Application tests. Expect pass.
- [ ] Commit: feat: add notification and reporting use cases.

### Task 6: Implement EF Core persistence adapters

**Files:**
- Create: Backend/InventoryManagement.Infrastructure/Persistence/{InventoryDbContext,EfUnitOfWork,EfTransactionRunner}.cs
- Create: Backend/InventoryManagement.Infrastructure/Persistence/{Configurations,Repositories}/*.cs
- Modify: Backend/InventoryManagement.Infrastructure/DependencyInjection.cs
- Test: Backend/InventoryManagement.Infrastructure.IntegrationTests/{Persistence,Repositories}/*Tests.cs

**Interfaces:** Implements every persistence port from Tasks 3-5; exposes no IQueryable, DbSet, or EF type through Application interfaces.

- [ ] Write failing SQLite in-memory tests for current keys/indexes/relationships, soft-deactivated-product filtering, reporting projections, and transaction rollback.
- [ ] Run Infrastructure tests. Expect failure.
- [ ] Port every current context rule to one IEntityTypeConfiguration per entity, then implement focused repositories, unit of work, and transaction runner.
- [ ] Re-run Infrastructure tests. Expect pass.
- [ ] Commit: feat: add EF Core infrastructure adapters.

### Task 7: Implement security, migrations, and guarded initialization

**Files:**
- Create: Backend/InventoryManagement.Infrastructure/Security/{JwtOptions,JwtAccessTokenGenerator,AspNetPasswordHasher}.cs
- Create: Backend/InventoryManagement.Infrastructure/System/SystemClock.cs
- Create: Backend/InventoryManagement.Infrastructure/Initialization/{DatabaseInitializer,DevelopmentDataSeeder,LegacyDatabaseGuard}.cs
- Create: Backend/InventoryManagement.Infrastructure/Persistence/Migrations/*
- Test: Backend/InventoryManagement.Infrastructure.IntegrationTests/{Security,Initialization}/*Tests.cs

**Interfaces:** Implements the security/system ports and exports guarded database initialization for host startup.

- [ ] Write failing tests for current JWT claims/expiry, password verification, seed-once behavior, and legacy schema without migration history refusing automatic migration.
- [ ] Run focused Infrastructure tests. Expect failure.
- [ ] Implement adapters and initial migration; run migration/seeding only behind explicit configuration and log baseline remediation.
- [ ] Re-run Infrastructure tests. Expect pass.
- [ ] Commit: feat: add secure infrastructure initialization.

### Task 8: Replace the host with thin Web API adapters

**Files:**
- Create: Backend/InventoryManagement.WebApi/Contracts/{Requests,Responses}/*.cs
- Create: Backend/InventoryManagement.WebApi/Controllers/*.cs
- Create: Backend/InventoryManagement.WebApi/{Middleware/ExceptionHandlingMiddleware,Services/HttpContextCurrentUser,Program}.cs
- Create: Backend/InventoryManagement.WebApi/appsettings*.json
- Test: Backend/InventoryManagement.WebApi.IntegrationTests/{ApiSmokeTests,AuthorizationTests,ContractCompatibilityTests,ValidationTests}.cs

**Interfaces:** Consumes all Application use-case interfaces and Infrastructure AddInfrastructure; provides the only ASP.NET executable.

- [ ] Write failing integration tests for public health, unauthorized products, non-admin product creation rejection, legacy product/stock JSON compatibility, invalid input 400, not-found behavior, and receive/issue result codes.
- [ ] Run Web API tests. Expect failure.
- [ ] Implement HTTP DTO mapping, controllers, exception middleware, current-user adapter, JWT/CORS/rate-limit/Swagger/security-header setup, and guarded initialization. Controllers receive use cases only.
- [ ] Re-run Web API tests. Expect pass.
- [ ] Commit: feat: expose inventory clean architecture API.

### Task 9: Retire legacy host and document operations

**Files:**
- Modify: README.md
- Create: Backend/README.md
- Create: docs/architecture/inventory-clean-architecture.md
- Create: docs/database/ensure-created-migration-baseline.md
- Delete: Backend/Inventory_Man_Sys_Be/**
- Delete: Backend/Inventory_Man_Sys_Be.Tests/**
- Test: Backend/InventoryManagement.Application.Tests/ArchitectureRulesTests.cs

**Interfaces:** Produces one documented build/run/test path and removes the duplicate legacy runtime only after compatibility tests pass.

- [ ] Write failing architecture-rule tests that inspect the solution/reference graph and assert WebApi controllers have no EF imports.
- [ ] Run the rules. Expect failure until new projects are complete.
- [ ] Remove legacy projects; document layers, configuration, developer commands, Docker references, and the EnsureCreated baseline procedure.
- [ ] Run dotnet test Backend/InventoryManagement.sln and dotnet build Backend/InventoryManagement.sln -warnaserror. Expect all tests/builds pass without warnings.
- [ ] Commit: refactor: complete inventory clean architecture migration.

## Plan self-review

- **Spec coverage:** Tasks 1-9 cover dependency graph, endpoint groups, persistence/security/migration, compatibility, test layers, and operations documentation.
- **Type consistency:** Application use cases are created before WebApi consumes them; Infrastructure implements only previously introduced ports; Domain stays framework-free.
- **Review focus:** Tasks 4/6 cover stock and receipt atomicity, Task 7 migration safety, and Task 8 authorization and malformed inputs.
- **Proportion:** Tasks are independently reviewable boundaries, each with a red-green cycle rather than implementation transcription.

