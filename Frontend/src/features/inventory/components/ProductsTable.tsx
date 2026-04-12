import { useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronUp, Ellipsis, Headphones,
  Keyboard, LampDesk, Pencil, Shirt, ShoppingBag, Coffee, Package, Plus, SlidersHorizontal,
} from 'lucide-react'
import type { Product } from '../../../types'
import { useClickOutside } from '../../../app/useClickOutside'
import { usePagination } from '../../../app/usePagination'
import PaginationBar from '../../../components/common/PaginationBar'

const statusLabel: Record<Product['status'], string> = {
  'In Stock': 'Đủ hàng', 'Low Stock': 'Sắp hết', 'Out of Stock': 'Hết hàng',
}

function ProductSymbol({ product }: { product: Product }) {
  const className = `product-symbol product-symbol--${product.categoryId}`
  if (product.sku.startsWith('HP')) return <span className={className}><Headphones size={20} /></span>
  if (product.sku.startsWith('HB') || product.sku.startsWith('KD') || product.sku.startsWith('SW')) return <span className={className}><Shirt size={20} /></span>
  if (product.sku.startsWith('WD')) return <span className={className}><ShoppingBag size={20} /></span>
  if (product.sku.startsWith('KB')) return <span className={className}><Keyboard size={20} /></span>
  if (product.sku.startsWith('CH')) return <span className={className}><LampDesk size={20} /></span>
  if (product.sku.startsWith('MG')) return <span className={className}><Coffee size={20} /></span>
  return <span className={className}><Package size={20} /></span>
}

interface ProductsTableProps {
  products: Product[]
  compact?: boolean
  statusFilter: string
  onStatusFilter: (value: string) => void
  onSeeAll?: () => void
  onCreate?: () => void
  onEdit: (product: Product) => void
  onAdjust: (product: Product, type: 'receive' | 'issue') => void
  onDelete: (product: Product) => void
}

export default function ProductsTable({ products, compact = false, statusFilter, onStatusFilter, onSeeAll, onCreate, onEdit, onAdjust, onDelete }: ProductsTableProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [sortByUnits, setSortByUnits] = useState<'asc' | 'desc' | null>(null)
  const filterWrapRef = useRef<HTMLDivElement | null>(null)
  const menuWrapRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(filterWrapRef, () => setFilterOpen(false), filterOpen)
  useClickOutside(menuWrapRef, () => setMenuFor(null), menuFor !== null)
  const visibleProducts = useMemo(() => {
    const rows = [...products]
    if (sortByUnits) rows.sort((a, b) => sortByUnits === 'asc' ? a.units - b.units : b.units - a.units)
    return compact ? rows.slice(0, 5) : rows
  }, [products, compact, sortByUnits])
  const pagination = usePagination(visibleProducts)
  const rowsToRender = compact ? visibleProducts : pagination.pageRows

  return (
    <section className="panel product-table-panel">
      <div className="panel-heading product-table-heading">
        <div><h2>{compact ? 'Danh sách sản phẩm' : 'Tồn kho sản phẩm'}</h2><p className="panel-description">{compact ? 'Những sản phẩm cần theo dõi gần đây' : `${products.length} sản phẩm phù hợp với bộ lọc`}</p></div>
        <div className="table-toolbar">
          {!compact && onCreate && <button className="button button-primary" onClick={onCreate}><Plus size={16} /> Thêm sản phẩm</button>}
          <div className="filter-wrap" ref={filterWrapRef}>
            <button className={`button button-secondary ${statusFilter !== 'All statuses' ? 'button-secondary--selected' : ''}`} onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen}><SlidersHorizontal size={15} /> Bộ lọc <ChevronDown size={13} /></button>
            {filterOpen && <div className="filter-popover" role="menu">
              <p>Trạng thái tồn kho</p>
              {[['All statuses', 'Tất cả sản phẩm'], ['In Stock', 'Đủ hàng'], ['Low Stock', 'Sắp hết'], ['Out of Stock', 'Hết hàng']].map(([value, label]) => <button key={value} className={statusFilter === value ? 'filter-option active' : 'filter-option'} onClick={() => { onStatusFilter(value); setFilterOpen(false) }}>{label}{statusFilter === value && <span>✓</span>}</button>)}
            </div>}
          </div>
          {compact && onSeeAll && <button className="button button-ghost" onClick={onSeeAll}>Xem tất cả <ChevronDown size={13} className="chevron-sideways" /></button>}
        </div>
      </div>
      {products.length === 0 ? (
        <div className="table-empty"><div className="empty-illustration"><Package size={26} /></div><strong>Không tìm thấy sản phẩm</strong><p>Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p><button className="button button-secondary" onClick={() => { onStatusFilter('All statuses') }}>Xóa bộ lọc</button></div>
      ) : (
        <div className="table-scroll">
          <table className="inventory-table">
            <thead><tr>
              <th className="th-name">Sản phẩm</th><th>Mã SKU</th><th>Danh mục</th><th>Vị trí</th>
              <th><button className="th-sort" onClick={() => setSortByUnits((prev) => prev === 'asc' ? 'desc' : 'asc')}>Số lượng {sortByUnits === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button></th>
              <th>Trạng thái</th><th className="th-actions">Thao tác</th>
            </tr></thead>
            <tbody>
              {rowsToRender.map((product) => (
                <tr key={product.id}>
                  <td><div className="product-cell"><ProductSymbol product={product} /><div className="product-name-wrap"><strong>{product.name}</strong><span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.unitPrice)}</span></div></div></td>
                  <td><span className="sku-text">{product.sku}</span></td>
                  <td>{product.category}</td><td><span className="location-text">{product.location}</span></td>
                  <td><strong className={`units-value ${product.units <= 0 ? 'units-value--zero' : product.units <= product.reorderLevel ? 'units-value--low' : ''}`}>{product.units.toLocaleString('vi-VN')}</strong></td>
                  <td><span className={`status-badge status-badge--${product.status.toLowerCase().replaceAll(' ', '-')}`}><i />{statusLabel[product.status]}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="row-action" onClick={() => onEdit(product)} aria-label={`Sửa ${product.name}`} title="Sửa sản phẩm"><Pencil size={15} /></button>
                      <div className="row-menu-wrap" ref={menuFor === product.id ? menuWrapRef : undefined}>
                        <button className={`row-action ${menuFor === product.id ? 'row-action--active' : ''}`} onClick={() => setMenuFor((id) => id === product.id ? null : product.id)} aria-label={`Thao tác với ${product.name}`} aria-expanded={menuFor === product.id}><Ellipsis size={17} /></button>
                        {menuFor === product.id && <div className="row-popover">
                          <button onClick={() => { onAdjust(product, 'receive'); setMenuFor(null) }}><ArrowDownToLine size={15} /> Nhập thêm hàng</button>
                          <button onClick={() => { onAdjust(product, 'issue'); setMenuFor(null) }}><ArrowUpFromLine size={15} /> Xuất hàng</button>
                          <button onClick={() => { onEdit(product); setMenuFor(null) }}><Pencil size={15} /> Chỉnh sửa</button>
                          <button className="danger-action" onClick={() => { onDelete(product); setMenuFor(null) }}>Ngừng kinh doanh</button>
                        </div>}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-footer"><span>{compact
        ? <>Đang hiển thị <strong>{visibleProducts.length}</strong> / <strong>{products.length}</strong> sản phẩm</>
        : <>Hiển thị <strong>{pagination.rangeFrom}–{pagination.rangeTo}</strong> trong <strong>{products.length}</strong> sản phẩm</>}</span><span className="table-footer-hint">Cập nhật khi có giao dịch mới</span></div>
      {!compact && <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />}
    </section>
  )
}
