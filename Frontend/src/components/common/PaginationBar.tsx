import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Thanh phân trang dùng chung cho các bảng dữ liệu */
export default function PaginationBar({ page, pageCount, rangeFrom, rangeTo, total, onPage }: {
  page: number
  pageCount: number
  rangeFrom: number
  rangeTo: number
  total: number
  onPage: (page: number) => void
}) {
  if (total === 0 || pageCount <= 1) return null

  // Hiển thị tối đa 5 số trang, thu gọn bằng dấu ... khi nhiều
  let numbers: Array<number | 'gap'> = []
  if (pageCount <= 5) {
    numbers = Array.from({ length: pageCount }, (_, i) => i + 1)
  } else {
    const start = Math.max(1, Math.min(page - 2, pageCount - 4))
    const end = Math.min(pageCount, start + 4)
    numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    if (start > 1) numbers = [1, 'gap' as const, ...numbers]
    if (end < pageCount) numbers = [...numbers, 'gap' as const, pageCount]
  }

  return (
    <div className="pagination">
      <span className="pagination-info">Hiển thị <strong>{rangeFrom}–{rangeTo}</strong> trong <strong>{total.toLocaleString('vi-VN')}</strong></span>
      <div className="pagination-controls">
        <button className="pagination-arrow" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Trang trước"><ChevronLeft size={15} /></button>
        {numbers.map((n, index) => n === 'gap'
          ? <span key={`gap${index}`} className="pagination-gap">…</span>
          : <button key={n} className={`pagination-page ${n === page ? 'pagination-page--active' : ''}`} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>)}
        <button className="pagination-arrow" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Trang sau"><ChevronRight size={15} /></button>
      </div>
    </div>
  )
}
