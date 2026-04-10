import { useEffect, useState } from 'react'
import { PAGE_SIZE } from '../lib/env'

/** Phân trang danh sách: mặc định 7 dòng mỗi trang, tự neo trang khi dữ liệu co lại */
export function usePagination<T>(rows: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const rangeFrom = rows.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeTo = Math.min(page * pageSize, rows.length)
  return { page, setPage, pageCount, pageRows, total: rows.length, rangeFrom, rangeTo }
}

export { PAGE_SIZE }
