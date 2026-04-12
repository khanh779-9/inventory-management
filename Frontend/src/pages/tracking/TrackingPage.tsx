import { useState } from 'react'
import { CircleCheck, Clock, Route, Truck, X } from 'lucide-react'
import { usePurchaseOrderItems, usePurchaseOrders } from '../../features/purchasing'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { PurchaseOrder } from '../../types'

const STATUS_META: Record<string, { label: string; badge: string; step: number }> = {
  Draft: { label: 'Nháp', badge: 'out-of-stock', step: 0 },
  Ordered: { label: 'Đã đặt', badge: 'low-stock', step: 1 },
  PartiallyReceived: { label: 'Nhận một phần', badge: 'low-stock', step: 2 },
  Received: { label: 'Hoàn tất', badge: 'in-stock', step: 3 },
}

const STEPS = [
  { label: 'Đã tạo', Icon: Clock },
  { label: 'Đã đặt hàng', Icon: Route },
  { label: 'Đang nhận', Icon: Truck },
  { label: 'Hoàn tất', Icon: CircleCheck },
]

export default function TrackingPage() {
  const { orders, loading, error } = usePurchaseOrders()
  const pagination = usePagination(orders)
  const [detailId, setDetailId] = useState<string | null>(null)
  const selected = orders.find((o) => o.id === detailId) ?? null

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Theo dõi đơn hàng</h1><p>Tiến độ từng dòng hàng từ lúc đặt đến khi nhận đủ về kho. Bấm vào một đơn để xem chi tiết.</p></div>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Danh sách đơn hàng</h2><p className="panel-description">{loading ? 'Đang tải...' : `${orders.length} đơn`}</p></div></div>
      {orders.length === 0 && !loading ? <div className="table-empty"><strong>Chưa có đơn đặt hàng nào</strong><p>Các đơn tạo ở trang Đặt hàng sẽ hiển thị tại đây.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Mã đơn</th><th>Nhà cung cấp</th><th>Kho nhận</th><th>Dự kiến giao</th><th>Tiến độ nhận</th><th>Trạng thái</th><th className="th-actions">Thao tác</th></tr></thead>
          <tbody>{pagination.pageRows.map((o) => {
            const pct = o.orderedQuantity > 0 ? Math.round(o.receivedQuantity / o.orderedQuantity * 100) : 0
            const meta = STATUS_META[o.status] ?? { label: o.status, badge: 'low-stock', step: 0 }
            return <tr key={o.id} className="tracking-row" onClick={() => setDetailId(o.id)}>
              <td className="feature-primary-cell">{o.orderNumber}</td>
              <td>{o.supplier}</td>
              <td>{o.warehouse}</td>
              <td>{o.expectedDate ? new Date(o.expectedDate).toLocaleDateString('vi-VN') : '—'}</td>
              <td><div className="ship-progress"><div className="ship-progress-bar"><i style={{ width: `${pct}%` }} /></div><span>{o.receivedQuantity.toLocaleString('vi-VN')}/{o.orderedQuantity.toLocaleString('vi-VN')} ({pct}%)</span></div></td>
              <td><span className={`status-badge status-badge--${meta.badge}`}><i />{meta.label}</span></td>
              <td><button type="button" className="button button-secondary tracking-view-btn" onClick={(event) => { event.stopPropagation(); setDetailId(o.id) }}>Xem tiến độ</button></td>
            </tr>
          })}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {selected && <TrackingDetailModal order={selected} onClose={() => setDetailId(null)} />}
  </div>
}

function TrackingDetailModal({ order, onClose }: { order: PurchaseOrder; onClose: () => void }) {
  const { items, loading } = usePurchaseOrderItems(order.id)
  const meta = STATUS_META[order.status] ?? { step: 0, label: order.status, badge: 'low-stock' }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="tracking-modal-title">
      <div className="modal-header">
        <div className="modal-title-icon"><Route size={20} /></div>
        <div><h2 id="tracking-modal-title">Tiến độ nhận hàng · {order.orderNumber}</h2><p>{order.supplier} → {order.warehouse}</p></div>
        <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
      </div>
      <div className="modal-body">
        <div className="track-steps">
          {STEPS.map(({ label, Icon }, idx) => (
            <div key={label} className={`track-step${idx <= meta.step ? ' track-step--done' : ''}`}>
              <span className="track-step-icon"><Icon size={14} /></span>{label}
            </div>
          ))}
        </div>
        {loading ? <p className="panel-description">Đang tải dòng hàng...</p> : (
          <div className="tracking-lines">
            {items.map((item) => {
              const pct = item.orderedQuantity > 0 ? Math.round(item.receivedQuantity / item.orderedQuantity * 100) : 0
              return <div className="tracking-line" key={item.id}>
                <div className="tracking-line-head">
                  <strong>{item.sku} · {item.productName}</strong>
                  <span>{item.receivedQuantity.toLocaleString('vi-VN')}/{item.orderedQuantity.toLocaleString('vi-VN')} ({pct}%)</span>
                </div>
                <div className="ship-progress-bar"><i style={{ width: `${pct}%` }} /></div>
              </div>
            })}
          </div>
        )}
      </div>
      <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose}>Đóng</button></div>
    </section>
  </div>
}
