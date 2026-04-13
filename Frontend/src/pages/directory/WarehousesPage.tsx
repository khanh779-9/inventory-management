import { useState } from 'react'
import type { FormEvent } from 'react'
import { Building2, Plus, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { useWarehouses } from '../../features/directory'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { WarehouseInput } from '../../types'

export default function WarehousesPage() {
  const dispatch = useAppDispatch()
  const { data: warehouses, loading, error, create } = useWarehouses()
  const pagination = usePagination(warehouses)
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'Admin')
  const [showCreate, setShowCreate] = useState(false)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Kho hàng</h1><p>Danh sách địa điểm lưu trữ đang hoạt động trong hệ thống.</p></div>
      {isAdmin && <div className="page-title-actions"><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Thêm kho</button></div>}
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Danh sách kho</h2><p className="panel-description">{loading ? 'Đang tải...' : `${warehouses.length} kho`}</p></div></div>
      {warehouses.length === 0 && !loading ? <div className="table-empty"><strong>Chưa có kho hàng nào</strong><p>Thêm kho đầu tiên để bắt đầu quản lý tồn kho.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Mã kho</th><th>Tên kho</th><th>Địa chỉ</th></tr></thead>
          <tbody>{pagination.pageRows.map((w) => <tr key={w.id}>
            <td className="feature-primary-cell">{w.code ?? '—'}</td>
            <td>{w.name}</td>
            <td>{w.address ?? '—'}</td>
          </tr>)}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {showCreate && <CreateWarehouseModal onClose={() => setShowCreate(false)} onCreate={async (input) => {
      await create(input)
      dispatch(showToast({ kind: 'success', message: 'Đã thêm kho hàng mới.' }))
      setShowCreate(false)
    }} />}
  </div>
}

function CreateWarehouseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: WarehouseInput) => Promise<void> }) {
  const [form, setForm] = useState({ code: '', name: '', address: '', managerName: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    setBusy(true)
    try {
      await onCreate({ code: form.code.trim(), name: form.name.trim(), address: form.address.trim(), managerName: form.managerName.trim() || undefined })
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tạo kho hàng.'); setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="warehouse-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><Building2 size={20} /></div><div><h2 id="warehouse-modal-title">Thêm kho hàng</h2><p>Kho mới sẽ nhận được hàng ngay sau khi tạo.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="form-field"><span>Mã kho <b>*</b></span><input required maxLength={20} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: WH-D" autoFocus /></label>
            <label className="form-field"><span>Tên kho <b>*</b></span><input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên dễ nhận biết" /></label>
            <label className="form-field form-field--full"><span>Địa chỉ <b>*</b></span><input required maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ kho" /></label>
            <label className="form-field form-field--full"><span>Người phụ trách</span><input maxLength={150} value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="Tên người quản lý" /></label>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Tạo kho'}</button></div>
      </form>
    </section>
  </div>
}
