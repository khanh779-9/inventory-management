import { useCallback } from 'react'
import { useAppDispatch } from './hooks'
import { setCurrentPage, setSearch } from './store'
import { setStatusFilter } from '../features/inventory'

/** Điều hướng trang: đổi currentPage, reset tìm kiếm và filter trạng thái (trừ khi chỉ định) */
export function useAppNavigate() {
  const dispatch = useAppDispatch()
  return useCallback((page: string, statusFilter?: string) => {
    dispatch(setCurrentPage(page))
    dispatch(setSearch(''))
    if (page !== 'inventory') dispatch(setStatusFilter('All statuses'))
    else if (statusFilter !== undefined) dispatch(setStatusFilter(statusFilter))
  }, [dispatch])
}
