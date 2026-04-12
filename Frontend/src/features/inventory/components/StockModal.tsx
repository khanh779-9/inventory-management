import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react'
import type { Product } from '../../../types'
import { useWarehouses } from '../../directory'

interface StockModalProps { product: Product; type: 'receive' | 'issue'; onClose: () => void; onSave: (quantity: number, warehouseId: number, reference: string, notes: string) => Promise<void> }
export default function StockModal({ product, type, onClose, onSave }: StockModalProps) {
  const { data: warehouses } = useWarehouses()
  const [quantity, setQuantity] = useState(1)
  const [warehouseId, setWarehouseId] = useState<number | ''>(warehouses.find((w) => w.name === product.location)?.id ?? '')
  useEffect(() => {
    if (!warehouseId && warehouses.length) setWarehouseId(warehouses.find((w) => w.name === product.location)?.id ?? warehouses[0].id)
  }, [warehouses, warehouseId, product.location])
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isReceive = type === 'receive'
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!warehouseId) { setError('Vui lòng chọn kho.'); return }
    if (!Number.isInteger(quantity) || quantity < 1) { setError('Số lượng phải là số nguyên lớn hơn 0.'); return }
    if (!isReceive && quantity > product.units) { setError(`Kho chỉ còn ${product.units} sản phẩm. Hãy nhập số lượng nhỏ hơn hoặc bằng tồn kho.`); return }
    setBusy(true)
    try { await onSave(quantity, warehouseId, reference, notes) } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật tồn kho.') } finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="stock-modal-title">
      <div className="modal-header"><div className={`modal-title-icon ${isReceive ? 'modal-title-icon--green' : 'modal-title-icon--amber'}`}>{isReceive ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}</div><div><h2 id="stock-modal-title">{isReceive ? 'Nhập thêm hàng' : 'Xuất hàng'}</h2><p>{product.name} · {product.sku}</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={submit}><div className="modal-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="stock-info-card"><span>Tồn kho hiện tại</span><strong>{product.units.toLocaleString('vi-VN')} <small>sản phẩm</small></strong><div className={`status-badge status-badge--${product.status.toLowerCase().replaceAll(' ', '-')}`}><i />{product.status === 'In Stock' ? 'Đủ hàng' : product.status === 'Low Stock' ? 'Sắp hết' : 'Hết hàng'}</div></div>
        <div className="form-grid"><label className="form-field"><span>Số lượng <b>*</b></span><input type="number" min="1" max={isReceive ? 100000000 : product.units} step="1" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} autoFocus /></label>
          <label className="form-field"><span>Kho <b>*</b></span><select value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value))}>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
          <label className="form-field form-field--full"><span>Mã tham chiếu</span><input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="VD: PO-2026-104" maxLength={100} /></label>
          <label className="form-field form-field--full"><span>Ghi chú</span><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi lý do hoặc thông tin liên quan..." maxLength={1000} /></label></div>
      </div><div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className={`button ${isReceive ? 'button-primary' : 'button-dark'}`} disabled={busy}>{isReceive ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}{busy ? 'Đang cập nhật...' : isReceive ? 'Xác nhận nhập kho' : 'Xác nhận xuất kho'}</button></div></form>
    </section>
  </div>
}
