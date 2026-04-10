export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  categoryId: number
  description?: string
  unitPrice: number
  reorderLevel: number
  units: number
  status: ProductStatus
  location: string
  updatedAt: string
}

export interface CashFlowItem {
  month: string
  expenses: number
  income: number
}

export interface Movement {
  id: string
  type: 'Receive' | 'Issue' | string
  sku: string
  productName: string
  warehouse: string
  quantity: number
  totalValue: number
  reference?: string
  notes?: string
  performedBy: string
  createdAt: string
}

export interface DashboardSummary {
  totalProducts: number
  inStockProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalUnits: number
  warehouseCount: number
  supplierCount: number
  cashFlow: CashFlowItem[]
  alerts: { status: string; count: number }[]
  recentProducts: Product[]
  recentMovements: Movement[]
}

export interface User {
  id: number
  fullName: string
  email: string
  role: 'Admin' | 'Staff' | string
}

export type NotificationCategory = 'System' | 'Admin' | 'Order'

export interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  message: string
  senderName: string | null
  isRead: boolean
  isArchived: boolean
  createdAt: string
}

export interface NotificationSummary { total: number; unread: number }

export interface NotificationCreateInput { title: string; message: string; category: NotificationCategory }

export interface Warehouse { id: number; name: string; code?: string | null; address?: string | null }

export interface Supplier { id: number; name: string; contactName?: string | null; email?: string | null; phone?: string | null; address?: string | null }

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: string
  warehouse: string
  status: string
  expectedDate: string | null
  createdAt: string
  totalValue: number
  itemsCount: number
  orderedQuantity: number
  receivedQuantity: number
}

export interface PurchaseOrderItemInput { productId: string; quantity: number; unitCost: number }

export interface PurchaseOrderInput { supplierId: number; warehouseId: number; expectedDate?: string; items: PurchaseOrderItemInput[] }

export interface WarehouseInput { code: string; name: string; address: string; managerName?: string }

export interface SupplierInput { name: string; contactName?: string; email?: string; phone?: string; address?: string }

export interface ProductInput {
  sku: string
  name: string
  categoryId: number
  category: string
  description: string
  unitPrice: number
  reorderLevel: number
  units: number
  location: string
}

export interface Shipment {
  id: string
  orderNumber: string
  supplier: string
  warehouse: string
  status: string
  expectedDate: string | null
  createdAt: string
  orderedQuantity: number
  receivedQuantity: number
  totalValue: number
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  sku: string
  productName: string
  orderedQuantity: number
  receivedQuantity: number
  unitCost: number
}

export interface ReceiveLineInput { productId: string; quantity: number }
export interface ReceiveInput { lines: ReceiveLineInput[] }

export interface Customer { id: number; name: string; email?: string | null; phone?: string | null; createdAt: string }
export interface CustomerInput { name: string; email?: string; phone?: string }

export interface CashFlowMonth { label: string; expenses: number; income: number }
export interface WarehouseStockValue { warehouse: string; stockValue: number; distinctProducts: number }
export interface TopProduct { sku: string; name: string; receiveValue: number; issueValue: number; totalUnitsMoved: number }
export interface ReportSummary {
  stockValueByWarehouse: WarehouseStockValue[]
  topProducts: TopProduct[]
  receiveCount30d: number
  issueCount30d: number
  receiveValue30d: number
  issueValue30d: number
}
