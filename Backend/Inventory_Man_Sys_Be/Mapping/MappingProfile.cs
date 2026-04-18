using AutoMapper;
using Inventory_Man_Sys_Be.DTOs.Requests;
using Inventory_Man_Sys_Be.Models;

namespace Inventory_Man_Sys_Be.Mapping;

/// <summary>Cấu hình AutoMapper: request → entity, normalize dữ liệu đầu vào như code thủ công cũ.</summary>
public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ===== Auth =====
        CreateMap<CreateUserRequest, AppUser>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName.Trim()))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.Email.Trim().ToLowerInvariant()))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.PasswordHash, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore());

        // ===== Catalog =====
        CreateMap<ProductCreateRequest, Product>()
            .ForMember(d => d.SKU, o => o.MapFrom(s => s.SKU.Trim().ToUpperInvariant()))
            .ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
            .ForMember(d => d.Description, o => o.MapFrom(s => s.Description == null ? null : s.Description.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.UpdatedAt, o => o.Ignore())
            .ForMember(d => d.Category, o => o.Ignore())
            .ForMember(d => d.Stocks, o => o.Ignore())
            .ForMember(d => d.Movements, o => o.Ignore());

        // ===== Directory =====
        CreateMap<WarehouseCreateRequest, Warehouse>()
            .ForMember(d => d.Code, o => o.MapFrom(s => s.Code.Trim().ToUpperInvariant()))
            .ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
            .ForMember(d => d.Address, o => o.MapFrom(s => s.Address.Trim()))
            .ForMember(d => d.ManagerName, o => o.MapFrom(s => s.ManagerName == null ? null : s.ManagerName.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.Stocks, o => o.Ignore());

        CreateMap<SupplierCreateRequest, Supplier>()
            .ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
            .ForMember(d => d.ContactName, o => o.MapFrom(s => s.ContactName == null ? null : s.ContactName.Trim()))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.Email == null ? null : s.Email.Trim().ToLowerInvariant()))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.Phone == null ? null : s.Phone.Trim()))
            .ForMember(d => d.Address, o => o.MapFrom(s => s.Address == null ? null : s.Address.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore());

        CreateMap<CustomerCreateRequest, Customer>()
            .ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
            .ForMember(d => d.Email, o => o.MapFrom(s =>
                string.IsNullOrWhiteSpace(s.Email) ? null : s.Email.Trim().ToLowerInvariant()))
            .ForMember(d => d.Phone, o => o.MapFrom(s =>
                string.IsNullOrWhiteSpace(s.Phone) ? null : s.Phone.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore());

        // ===== Procurement =====
        CreateMap<PurchaseOrderItemRequest, PurchaseOrderItem>()
            .ForMember(d => d.OrderedQuantity, o => o.MapFrom(s => s.Quantity))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.PurchaseOrderId, o => o.Ignore())
            .ForMember(d => d.ReceivedQuantity, o => o.Ignore())
            .ForMember(d => d.PurchaseOrder, o => o.Ignore())
            .ForMember(d => d.Product, o => o.Ignore());

        // ===== Notifications =====
        CreateMap<NotificationCreateRequest, Notification>()
            .ForMember(d => d.Title, o => o.MapFrom(s => s.Title.Trim()))
            .ForMember(d => d.Message, o => o.MapFrom(s => s.Message.Trim()))
            .ForMember(d => d.SenderUserId, o => o.Ignore())
            .ForMember(d => d.Sender, o => o.Ignore());

        // ===== Inventory =====
        CreateMap<StockMovementRequest, StockMovement>()
            .ForMember(d => d.Reference, o => o.MapFrom(s => s.Reference == null ? null : s.Reference.Trim()))
            .ForMember(d => d.Notes, o => o.MapFrom(s => s.Notes == null ? null : s.Notes.Trim()))
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.UserId, o => o.Ignore())
            .ForMember(d => d.Type, o => o.Ignore())
            .ForMember(d => d.UnitPriceAtMovement, o => o.Ignore())
            .ForMember(d => d.TotalValue, o => o.Ignore())
            .ForMember(d => d.Product, o => o.Ignore())
            .ForMember(d => d.Warehouse, o => o.Ignore())
            .ForMember(d => d.User, o => o.Ignore());
    }
}
