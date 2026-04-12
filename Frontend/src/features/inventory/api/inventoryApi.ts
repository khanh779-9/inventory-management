import type { DashboardSummary, Product, ProductInput } from '../../../types'
import { request } from '../../../lib/request'

export async function getProducts(): Promise<Product[]> {
  const rows = await request<Array<Record<string, unknown>>>('/products')
  return rows.map((p) => ({
    id: String(p.id), sku: String(p.sku), name: String(p.name), category: String(p.category),
    categoryId: Number(p.categoryId), description: String(p.description ?? ''), unitPrice: Number(p.unitPrice),
    reorderLevel: Number(p.reorderLevel), units: Number(p.units), status: p.status as Product['status'],
    location: String(p.location), updatedAt: String(p.updatedAt),
  }))
}

export async function getDashboard(): Promise<DashboardSummary> {
  const raw = await request<Record<string, unknown>>('/dashboard/summary')
  const products = (raw.recentProducts ?? []) as Array<Record<string, unknown>>
  return {
    totalProducts: Number(raw.totalProducts), inStockProducts: Number(raw.inStockProducts),
    lowStockProducts: Number(raw.lowStockProducts), outOfStockProducts: Number(raw.outOfStockProducts),
    totalUnits: Number(raw.totalUnits), warehouseCount: Number(raw.warehouseCount), supplierCount: Number(raw.supplierCount),
    cashFlow: (raw.cashFlow ?? []) as DashboardSummary['cashFlow'], alerts: (raw.alerts ?? []) as DashboardSummary['alerts'],
    recentProducts: products.map((p) => ({
      id: String(p.id), sku: String(p.sku), name: String(p.name), category: String(p.category), categoryId: Number(p.categoryId),
      description: String(p.description ?? ''), unitPrice: Number(p.unitPrice), reorderLevel: Number(p.reorderLevel),
      units: Number(p.units), status: p.status as Product['status'], location: String(p.location), updatedAt: String(p.updatedAt),
    })),
    recentMovements: ((raw.recentMovements ?? []) as Array<Record<string, unknown>>).map((m) => ({
      id: String(m.id), type: String(m.type), sku: String(m.sku), productName: String(m.productName), warehouse: String(m.warehouse),
      quantity: Number(m.quantity), totalValue: Number(m.totalValue), reference: String(m.reference ?? ''), notes: String(m.notes ?? ''),
      performedBy: String(m.performedBy), createdAt: String(m.createdAt),
    })),
  }
}

export async function saveProduct(input: ProductInput, id?: string): Promise<Product> {
  const payload = {
    sku: input.sku, name: input.name, categoryId: input.categoryId, description: input.description,
    unitPrice: input.unitPrice, reorderLevel: input.reorderLevel,
  }
  const raw = await request<Record<string, unknown>>(id ? `/products/${id}` : '/products', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
  })
  return {
    id: String(raw.id), sku: String(raw.sku), name: String(raw.name), category: String(raw.category), categoryId: Number(raw.categoryId),
    description: String(raw.description ?? ''), unitPrice: Number(raw.unitPrice), reorderLevel: Number(raw.reorderLevel),
    units: Number(raw.units), status: raw.status as Product['status'], location: String(raw.location), updatedAt: String(raw.updatedAt),
  }
}

export async function deactivateProduct(id: string): Promise<void> {
  await request(`/products/${id}`, { method: 'DELETE' })
}

export async function moveStock(type: 'receive' | 'issue', productId: string, warehouseId: number, quantity: number, reference: string, notes: string) {
  return request(`/inventory/${type}`, {
    method: 'POST', body: JSON.stringify({ productId, warehouseId, quantity, reference, notes }),
  })
}
