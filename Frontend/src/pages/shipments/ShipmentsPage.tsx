import { useState } from 'react'
import type { FormEvent } from 'react'
import { Truck, X } from 'lucide-react'
import { useAppDispatch } from '../../app/hooks'
import { showToast } from '../../app/store'
import { usePurchaseOrderItems, useShipments } from '../../features/purchasing'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { ReceiveInput, Shipment } from '../../types'

export default function ShipmentsPage() {
  const { shipments, loading, error, receive } = useShipments()
  const pagination = usePagination(shipments)
  const [receiving, setReceiving] = useState<Shipment | null>(null)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Lô hàng đến</h1><p>Các lô hàng đã đặt và đang chờ nhập về kho.</p></div>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Chờ nhận về kho</h2><p className="panel-description">{loading ? 'Đang tải...' : `${shipments.length} lô hàng`}</p></div></div>
      {shipments.length === 0 && !loading ? <div className="table-empty"><strong>Không có lô hàng nào chờ nhận</strong><p>Các đơn đã đặt (Ordered) sẽ hiển thị tại đây.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Mã đơn</th><th>Nhà cung cấp</th><th>Kho nhận</th><th>Dự kiến giao</th><th>Tiến độ</th><th>Giá trị</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>{pagination.pageRows.map((s) => {
            const pct = s.orderedQuantity > 0 ? Math.round(s.receivedQuantity / s.orderedQuantity * 100) : 0
            return <tr key={s.id}>
              <td className="feature-primary-cell">{s.orderNumber}</td>
              <td>{s.supplier}</td>
              <td>{s.warehouse}</td>
              <td>{s.expectedDate ? new Date(s.expectedDate).toLocaleDateString('vi-VN') : '—'}</td>
              <td><div className="ship-progress"><div className="ship-progress-bar"><i style={{ width: `${pct}%` }} /></div><span>{s.receivedQuantity.toLocaleString('vi-VN')}/{s.orderedQuantity.toLocaleString('vi-VN')} ({pct}%)</span></div></td>
              <td>{s.totalValue.toLocaleString('vi-VN')} ₫</td>
              <td><span className={`status-badge status-badge--${s.status === 'Received' ? 'in-stock' : 'low-stock'}`}><i />{s.status === 'PartiallyReceived' ? 'Nhận một phần' : 'Đã đặt'}</span></td>
              <td><button className="button button-secondary ship-receive-btn" onClick={() => setReceiving(s)}><Truck size={14} /> Nhận hàng</button></td>
            </tr>
          })}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {receiving && <ReceiveShipmentModal shipment={receiving} onClose={() => setReceiving(null)} onReceive={receive} />}
  </div>
}

function ReceiveShipmentModal({ shipment, onClose, onReceive }: {
  shipment: Shipment
  onClose: () => void
  onReceive: (orderId: string, input: ReceiveInput) => Promise<unknown>
}) {
  const dispatch = useAppDispatch()
  const { items, loading } = usePurchaseOrderItems(shipment.id)
  const [accountId, setAccountId] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    const lines = items
      .map((item) => ({ productId: item.productId, quantity: Number(accountId[item.id] ?? 0) }))
      .filter((line) => line.quantity > 0)
    if (lines.length === 0) { setError('Nhập số lượng nhận cho ít nhất một dòng hàng.'); return }
    setBusy(true)
    try {
      await onReceive(shipment.id, { lines })
      dispatch(showToast({ kind: 'success', message: `Đã nhận hàng cho đơn ${shipment.orderNumber}.` }))
      onClose()
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể nhận hàng.'); setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="receive-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><Truck size={20} /></div><div><h2 id="receive-modal-title">Nhận hàng · {shipment.orderNumber}</h2><p>{shipment.supplier} → {shipment.warehouse}</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          {loading ? <p className="panel-description">Đang tải dòng hàng...</p> : (
            <div className="po-lines receive-lines">
              {items.map((item) => {
                const remaining = item.orderedQuantity - item.receivedQuantity
                const done = remaining <= 0
                return <div className="receive-line" key={item.id}>
                  <div className="receive-line-info">
                    <strong>{item.sku} · {item.productName}</strong>
                    <span>{done
                      ? `Đã nhận đủ ${item.orderedQuantity.toLocaleString('vi-VN')}`
                      : `Còn lại ${remaining.toLocaleString('vi-VN')} / đặt ${item.orderedQuantity.toLocaleString('vi-VN')} · ${item.unitCost.toLocaleString('vi-VN')} ₫`}</span>
                  </div>
                  <input type="number" min="0" max={remaining} step="1"
                    value={accountId[item.id] ?? ''}
                    disabled={done}
                    onChange={(e) => setAccountId({ ...accountId, [item.id]: e.target.value })}
                    placeholder={done ? 'Đủ' : '0'} aria-label={`Số lượng nhận ${item.sku}`} />
                </div>
              })}
            </div>
          )}
          <p className="receive-note">Hàng nhận sẽ được cộng vào <strong>{shipment.warehouse}</strong> và ghi giao dịch nhập kho.</p>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy || loading}>{busy ? 'Đang nhận...' : 'Xác nhận nhận hàng'}</button></div>
      </form>
    </section>
  </div>
}
