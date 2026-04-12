export {
  setStatusFilter, setProducts, setDashboard, setApiError, setLoading,
  addProduct, updateProduct, adjustStock, removeProduct,
} from './store/inventorySlice'
export { getProducts, getDashboard, saveProduct, deactivateProduct, moveStock } from './api/inventoryApi'
export { useInventoryRefresh } from './hooks/useInventoryRefresh'
export { useInventoryActions, type StockActionInput } from './hooks/useInventoryActions'
export { filterProducts } from './utils/filterProducts'
