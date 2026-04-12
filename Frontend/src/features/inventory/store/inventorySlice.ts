import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DashboardSummary, Product } from '../../../types'
import { getStatus } from '../utils/getStatus'

interface InventoryState {
  products: Product[]
  dashboard: DashboardSummary
  statusFilter: string
  apiError: string | null
  loading: boolean
}

const emptyDashboard: DashboardSummary = {
  totalProducts: 0, inStockProducts: 0, lowStockProducts: 0, outOfStockProducts: 0,
  totalUnits: 0, warehouseCount: 0, supplierCount: 0, cashFlow: [], alerts: [],
  recentProducts: [], recentMovements: [],
}

const initialState: InventoryState = {
  products: [],
  dashboard: emptyDashboard,
  statusFilter: 'All statuses',
  apiError: null,
  loading: false,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<string>) { state.statusFilter = action.payload },
    setProducts(state, action: PayloadAction<Product[]>) { state.products = action.payload; state.apiError = null; state.loading = false },
    setDashboard(state, action: PayloadAction<DashboardSummary>) { state.dashboard = action.payload },
    setApiError(state, action: PayloadAction<string | null>) { state.apiError = action.payload; state.loading = false },
    setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.unshift(action.payload)
      state.dashboard.totalProducts = state.products.length
      refreshCounts(state)
      state.dashboard.recentProducts = state.products.slice(0, 6)
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex((product) => product.id === action.payload.id)
      if (index >= 0) state.products[index] = action.payload
      state.dashboard.recentProducts = state.products.slice(0, 6)
      refreshCounts(state)
    },
    adjustStock(state, action: PayloadAction<{ id: string; delta: number }>) {
      const product = state.products.find((item) => item.id === action.payload.id)
      if (!product) return
      product.units = Math.max(0, product.units + action.payload.delta)
      product.status = getStatus(product.units, product.reorderLevel)
      product.updatedAt = new Date().toISOString()
      refreshCounts(state)
      state.dashboard.recentProducts = state.products.slice(0, 6)
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.products = state.products.filter((item) => item.id !== action.payload)
      state.dashboard.totalProducts = state.products.length
      refreshCounts(state)
      state.dashboard.recentProducts = state.products.slice(0, 6)
    },
  },
})

function refreshCounts(state: InventoryState) {
  state.dashboard.totalProducts = state.products.length
  state.dashboard.inStockProducts = state.products.filter((item) => item.status === 'In Stock').length
  state.dashboard.lowStockProducts = state.products.filter((item) => item.status === 'Low Stock').length
  state.dashboard.outOfStockProducts = state.products.filter((item) => item.status === 'Out of Stock').length
  state.dashboard.totalUnits = state.products.reduce((sum, item) => sum + item.units, 0)
  state.dashboard.alerts = [
    { status: 'In Stock', count: state.dashboard.inStockProducts },
    { status: 'Low Stock', count: state.dashboard.lowStockProducts },
    { status: 'Out of Stock', count: state.dashboard.outOfStockProducts },
  ]
}

export const {
  setStatusFilter, setProducts, setDashboard, setApiError, setLoading,
  addProduct, updateProduct, adjustStock, removeProduct,
} = inventorySlice.actions
export default inventorySlice.reducer
