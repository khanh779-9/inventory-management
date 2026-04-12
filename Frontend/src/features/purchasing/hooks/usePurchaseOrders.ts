import { useCallback, useEffect, useState } from 'react'
import type { PurchaseOrder, PurchaseOrderInput, PurchaseOrderItem, ReceiveInput, Shipment } from '../../../types'
import { createPurchaseOrder, getPurchaseOrderItems, getPurchaseOrders, getShipments, receivePurchaseOrder } from '../api/purchaseOrderApi'

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setOrders(await getPurchaseOrders()); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn đặt hàng.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (input: PurchaseOrderInput) => {
    const row = await createPurchaseOrder(input)
    await load()
    return row
  }, [load])

  return { orders, loading, error, reload: () => void load(), create }
}

/** Danh sách lô hàng đang chờ nhận về kho */
export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setShipments(await getShipments()); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách lô hàng.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const receive = useCallback(async (orderId: string, input: ReceiveInput) => {
    const row = await receivePurchaseOrder(orderId, input)
    await load()
    return row
  }, [load])

  return { shipments, loading, error, reload: () => void load(), receive }
}

/** Danh sách đơn hàng (không auto-load, dùng cho trang theo dõi) + dòng hàng của một đơn */
export function usePurchaseOrderItems(orderId: string | null) {
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orderId) { setItems([]); return }
    setLoading(true)
    try { setItems(await getPurchaseOrderItems(orderId)) }
    finally { setLoading(false) }
  }, [orderId])

  useEffect(() => { void load() }, [load])

  return { items, loading, reload: () => void load() }
}
