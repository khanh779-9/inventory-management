import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ClipboardList, Plus, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { usePurchaseOrders } from '../../features/purchasing'
import { useSuppliers, useWarehouses } from '../../features/directory'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { PurchaseOrderItemInput } from '../../types'

export default function PurchaseOrdersPage() {
  const { orders, loading, error, create } = usePurchaseOrders()
  const pagination = usePagination(orders)
  const [showCreate, setShowCreate] = useState(false)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Đơn đặt hàng</h1><p>Theo dõi đơn mua hàng từ nhà cung cấp và tiến độ nhận về kho.</p></div>
      <div className="page-title-actions"><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Tạo đơn hàng</button></div>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Danh sách đơn đặt hàng</h2><p className="panel-description">{loading ? 'Đang tải...' : `${orders.length} đơn hàng`}</p></div></div>
      {orders.length === 0 && !loading ? <div className="table-empty"><strong>Chưa có đơn đặt hàng nào</strong><p>Đơn hàng tạo mới sẽ hiển thị tại đây.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Mã đơn</th><th>Nhà cung cấp</th><th>Kho nhận</th><th>Dự kiến giao</th><th>Số dòng</th><th>Giá trị</th><th>Trạng thái</th><th>Tạo lúc</th></tr></thead>
          <tbody>{pagination.pageRows.map((order) => <tr key={order.id}>
            <td className="feature-primary-cell">{order.orderNumber}</td>
            <td>{order.supplier}</td>
            <td>{order.warehouse}</td>
            <td>{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('vi-VN') : '—'}</td>
            <td>{order.itemsCount}</td>
            <td>{order.totalValue.toLocaleString('vi-VN')} ₫</td>
            <td><span className={`status-badge status-badge--${order.status === 'Received' ? 'in-stock' : order.status === 'Cancelled' ? 'out-of-stock' : 'low-stock'}`}><i />{order.status}</span></td>
            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
          </tr>)}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {showCreate && <PurchaseOrderModal onClose={() => setShowCreate(false)} onCreate={create} />}
  </div>
}

function PurchaseOrderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: import('../../types').PurchaseOrderInput) => Promise<unknown> }) {
  const dispatch = useAppDispatch()
  const { data: suppliers } = useSuppliers()
  const { data: warehouses } = useWarehouses()
  const products = useAppSelector((state) => state.inventory.products)
  const [supplierId, setSupplierId] = useState<number | ''>('')
  const [warehouseId, setWarehouseId] = useState<number | ''>('')
  const [expectedDate, setExpectedDate] = useState('')
  const [items, setItems] = useState<PurchaseOrderItemInput[]>([{ productId: '', quantity: 1, unitCost: 0 }])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0), [items])

  function setItem(index: number, patch: Partial<PurchaseOrderItemInput>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!supplierId || !warehouseId) { setError('Vui lòng chọn nhà cung cấp và kho nhận.'); return }
    if (items.some((item) => !item.productId || item.quantity < 1 || item.unitCost < 0)) { setError('Mỗi dòng hàng cần chọn sản phẩm, số lượng và đơn giá hợp lệ.'); return }
    setBusy(true)
    try {
      await onCreate({ supplierId, warehouseId, expectedDate: expectedDate || undefined, items })
      dispatch(showToast({ kind: 'success', message: 'Đã tạo đơn đặt hàng.' }))
      onClose()
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tạo đơn đặt hàng.') }
    finally { setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="po-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><ClipboardList size={20} /></div><div><h2 id="po-modal-title">Tạo đơn đặt hàng</h2><p>Chọn nhà cung cấp, kho nhận và các dòng hàng cần mua.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="form-field"><span>Nhà cung cấp <b>*</b></span>
              <select required value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))}>
                <option value="" disabled>Chọn nhà cung cấp</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="form-field"><span>Kho nhận <b>*</b></span>
              <select required value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value))}>
                <option value="" disabled>Chọn kho</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
            <label className="form-field"><span>Dự kiến nhận</span>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </label>
          </div>
          <div className="po-lines">
            {items.map((item, index) => <div className="po-line" key={index}>
              <select value={item.productId} onChange={(e) => setItem(index, { productId: e.target.value })} aria-label="Sản phẩm">
                <option value="" disabled>Chọn sản phẩm</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
              </select>
              <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => setItem(index, { quantity: Number(e.target.value) })} aria-label="Số lượng" placeholder="SL" />
              <input type="number" min="0" step="1000" value={item.unitCost} onChange={(e) => setItem(index, { unitCost: Number(e.target.value) })} aria-label="Đơn giá" placeholder="Đơn giá (₫)" />
              <button type="button" className="icon-button" aria-label="Xóa dòng" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} disabled={items.length === 1}><X size={15} /></button>
            </div>)}
            <button type="button" className="button button-secondary" onClick={() => setItems((current) => [...current, { productId: '', quantity: 1, unitCost: 0 }])}><Plus size={14} /> Thêm dòng hàng</button>
          </div>
          <div className="po-total"><span>Tạm tính</span><strong>{total.toLocaleString('vi-VN')} ₫</strong></div>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo đơn hàng'}</button></div>
      </form>
    </section>
  </div>
}
