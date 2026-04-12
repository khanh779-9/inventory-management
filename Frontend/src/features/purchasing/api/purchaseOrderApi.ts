import type { PurchaseOrder, PurchaseOrderInput, PurchaseOrderItem, ReceiveInput, Shipment } from '../../../types'
import { request } from '../../../lib/request'

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const rows = await request<Array<Record<string, unknown>>>('/purchase-orders')
  return rows.map((o) => ({
    id: String(o.id), orderNumber: String(o.orderNumber), supplier: String(o.supplier), warehouse: String(o.warehouse),
    status: String(o.status), expectedDate: o.expectedDate ? String(o.expectedDate) : null,
    createdAt: String(o.createdAt), totalValue: Number(o.totalValue), itemsCount: Number(o.itemsCount),
    orderedQuantity: Number(o.orderedQuantity), receivedQuantity: Number(o.receivedQuantity),
  }))
}

export async function getShipments(): Promise<Shipment[]> {
  const rows = await request<Array<Record<string, unknown>>>('/shipments')
  return rows.map((s) => ({
    id: String(s.id), orderNumber: String(s.orderNumber), supplier: String(s.supplier), warehouse: String(s.warehouse),
    status: String(s.status), expectedDate: s.expectedDate ? String(s.expectedDate) : null,
    createdAt: String(s.createdAt), orderedQuantity: Number(s.orderedQuantity), receivedQuantity: Number(s.receivedQuantity),
    totalValue: Number(s.totalValue),
  }))
}

export async function getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]> {
  const rows = await request<Array<Record<string, unknown>>>(`/purchase-orders/${orderId}/items`)
  return rows.map((i) => ({
    id: String(i.id), productId: String(i.productId), sku: String(i.sku), productName: String(i.productName),
    orderedQuantity: Number(i.orderedQuantity), receivedQuantity: Number(i.receivedQuantity), unitCost: Number(i.unitCost),
  }))
}

export async function receivePurchaseOrder(orderId: string, input: ReceiveInput): Promise<Shipment> {
  const raw = await request<Record<string, unknown>>(`/purchase-orders/${orderId}/receive`, {
    method: 'POST', body: JSON.stringify(input),
  })
  return {
    id: String(raw.id), orderNumber: String(raw.orderNumber), supplier: String(raw.supplier), warehouse: String(raw.warehouse),
    status: String(raw.status), expectedDate: raw.expectedDate ? String(raw.expectedDate) : null,
    createdAt: String(raw.createdAt), orderedQuantity: Number(raw.orderedQuantity), receivedQuantity: Number(raw.receivedQuantity),
    totalValue: Number(raw.totalValue),
  }
}

export async function createPurchaseOrder(input: PurchaseOrderInput): Promise<PurchaseOrder> {
  const raw = await request<Record<string, unknown>>('/purchase-orders', {
    method: 'POST', body: JSON.stringify(input),
  })
  return {
    id: String(raw.id), orderNumber: String(raw.orderNumber), supplier: String(raw.supplier), warehouse: String(raw.warehouse),
    status: String(raw.status), expectedDate: raw.expectedDate ? String(raw.expectedDate) : null,
    createdAt: String(raw.createdAt), totalValue: Number(raw.totalValue), itemsCount: Number(raw.itemsCount),
    orderedQuantity: Number(raw.orderedQuantity), receivedQuantity: Number(raw.receivedQuantity),
  }
}
