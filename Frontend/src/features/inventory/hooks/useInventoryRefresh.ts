import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { setApiError, setDashboard, setLoading, setProducts } from '../store/inventorySlice'
import { getDashboard, getProducts } from '../api/inventoryApi'

/** Tải lại products + dashboard từ API (chỉ khi đã đăng nhập) */
export function useInventoryRefresh() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)

  return useCallback(async () => {
    if (!token) return
    dispatch(setLoading(true))
    try {
      const [freshProducts, freshDashboard] = await Promise.all([getProducts(), getDashboard()])
      dispatch(setProducts(freshProducts))
      dispatch(setDashboard(freshDashboard))
      dispatch(setApiError(null))
    } catch (error) {
      dispatch(setApiError(error instanceof Error ? error.message : 'Không thể tải dữ liệu API.'))
    } finally { dispatch(setLoading(false)) }
  }, [dispatch, token])
}
