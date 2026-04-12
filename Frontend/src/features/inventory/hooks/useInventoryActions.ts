import { useCallback } from 'react'
import { useAppDispatch } from '../../../app/hooks'
import { showToast } from '../../../app/store'
import { deactivateProduct as deactivateProductApi, moveStock as moveStockApi, saveProduct as saveProductApi } from '../api/inventoryApi'
import { useWarehouses } from '../../directory'
import { useInventoryRefresh } from './useInventoryRefresh'
import type { Product, ProductInput } from '../../../types'

export interface StockActionInput {
  product: Product
  type: 'receive' | 'issue'
  quantity: number
  warehouseId: number
  reference: string
  notes: string
}

/** Các thao tác nghiệp vụ kho: lưu sản phẩm, nhập/xuất kho, ngừng kinh doanh (gọi API thật) */
export function useInventoryActions() {
  const dispatch = useAppDispatch()
  const refresh = useInventoryRefresh()
  const { data: warehouses } = useWarehouses()

  const saveProduct = useCallback(async (input: ProductInput, id?: string) => {
    const saved = await saveProductApi(input, id)
    if (!id && input.units > 0) {
      const warehouseId = warehouses.find((warehouse) => warehouse.name === input.location)?.id ?? warehouses[0]?.id
      if (warehouseId) {
        await moveStockApi('receive', saved.id, warehouseId, input.units, 'OPENING-STOCK', 'Tồn kho ban đầu khi tạo sản phẩm')
      }
    }
    await refresh()
    dispatch(showToast({ kind: 'success', message: id ? 'Đã cập nhật thông tin sản phẩm.' : 'Đã thêm sản phẩm mới.' }))
  }, [dispatch, refresh, warehouses])

  const moveStock = useCallback(async (input: StockActionInput) => {
    await moveStockApi(input.type, input.product.id, input.warehouseId, input.quantity, input.reference, input.notes)
    await refresh()
    dispatch(showToast({ kind: 'success', message: input.type === 'receive' ? 'Đã ghi nhận phiếu nhập kho.' : 'Đã ghi nhận phiếu xuất kho.' }))
  }, [dispatch, refresh])

  /** Trả về false nếu người dùng hủy hoặc thao tác lỗi */
  const deactivateProduct = useCallback(async (product: Product) => {
    if (!window.confirm(`Ngừng kinh doanh sản phẩm “${product.name}”? Lịch sử giao dịch sẽ được giữ lại.`)) return false
    try {
      await deactivateProductApi(product.id)
      await refresh()
    } catch (error) {
      dispatch(showToast({ kind: 'error', message: error instanceof Error ? error.message : 'Không thể ngừng kinh doanh.' }))
      return false
    }
    dispatch(showToast({ kind: 'success', message: `Đã ngừng kinh doanh ${product.name}.` }))
    return true
  }, [dispatch, refresh])

  return { saveProduct, moveStock, deactivateProduct }
}
