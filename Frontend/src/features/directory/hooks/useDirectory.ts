import { useCallback, useEffect, useState } from 'react'
import type { Customer, CustomerInput, Supplier, SupplierInput, Warehouse, WarehouseInput } from '../../../types'
import { createCustomer, createSupplier, createWarehouse, getCustomers, getSuppliers, getWarehouses } from '../api/directoryApi'

/** Cache dùng chung giữa các lần mount (modals, pages) trong phiên đăng nhập */
const warehouseCache: { data?: Warehouse[] } = {}
const supplierCache: { data?: Supplier[] } = {}
const customerCache: { data?: Customer[] } = {}

export function useWarehouses() {
  const [data, setData] = useState<Warehouse[]>(warehouseCache.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    if (!force && warehouseCache.data) return
    setLoading(true)
    try {
      const rows = await getWarehouses()
      warehouseCache.data = rows
      setData(rows); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách kho.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (input: WarehouseInput) => {
    const row = await createWarehouse(input)
    warehouseCache.data = undefined
    await load(true)
    return row
  }, [load])

  return { data, loading, error, reload: () => void load(true), create }
}

export function useCustomers() {
  const [data, setData] = useState<Customer[]>(customerCache.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    if (!force && customerCache.data) return
    setLoading(true)
    try {
      const rows = await getCustomers()
      customerCache.data = rows
      setData(rows); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khách hàng.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (input: CustomerInput) => {
    const row = await createCustomer(input)
    customerCache.data = undefined
    await load(true)
    return row
  }, [load])

  return { data, loading, error, reload: () => void load(true), create }
}

export function useSuppliers() {
  const [data, setData] = useState<Supplier[]>(supplierCache.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    if (!force && supplierCache.data) return
    setLoading(true)
    try {
      const rows = await getSuppliers()
      supplierCache.data = rows
      setData(rows); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhà cung cấp.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (input: SupplierInput) => {
    const row = await createSupplier(input)
    supplierCache.data = undefined
    await load(true)
    return row
  }, [load])

  return { data, loading, error, reload: () => void load(true), create }
}
