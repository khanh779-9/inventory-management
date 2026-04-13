import type { Customer, CustomerInput, Supplier, SupplierInput, Warehouse, WarehouseInput } from '../../../types'
import { request } from '../../../lib/request'

export async function getWarehouses(): Promise<Warehouse[]> {
  return request('/warehouses')
}

export async function createWarehouse(input: WarehouseInput): Promise<Warehouse> {
  return request('/warehouses', { method: 'POST', body: JSON.stringify(input) })
}

export async function getSuppliers(): Promise<Supplier[]> {
  return request('/suppliers')
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  return request('/suppliers', { method: 'POST', body: JSON.stringify(input) })
}

export async function getCustomers(): Promise<Customer[]> {
  return request('/customers')
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  return request('/customers', { method: 'POST', body: JSON.stringify(input) })
}
