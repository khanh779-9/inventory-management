import { useState } from 'react'
import type { FormEvent } from 'react'
import { Handshake, Plus, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { useSuppliers } from '../../features/directory'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { SupplierInput } from '../../types'

export default function SuppliersPage() {
  const dispatch = useAppDispatch()
  const { data: suppliers, loading, error, create } = useSuppliers()
  const pagination = usePagination(suppliers)
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'Admin')
  const [showCreate, setShowCreate] = useState(false)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Nhà cung cấp</h1><p>Thông tin liên hệ của các đối tác cung ứng hàng hóa.</p></div>
      {isAdmin && <div className="page-title-actions"><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Thêm nhà cung cấp</button></div>}
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Danh sách nhà cung cấp</h2><p className="panel-description">{loading ? 'Đang tải...' : `${suppliers.length} đối tác`}</p></div></div>
      {suppliers.length === 0 && !loading ? <div className="table-empty"><strong>Chưa có nhà cung cấp nào</strong><p>Thêm đối tác đầu tiên để bắt đầu nhập hàng.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Nhà cung cấp</th><th>Người liên hệ</th><th>Email</th><th>Điện thoại</th><th>Địa chỉ</th></tr></thead>
          <tbody>{pagination.pageRows.map((s) => <tr key={s.id}>
            <td className="feature-primary-cell">{s.name}</td>
            <td>{s.contactName ?? '—'}</td>
            <td>{s.email ?? '—'}</td>
            <td>{s.phone ?? '—'}</td>
            <td>{s.address ?? '—'}</td>
          </tr>)}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {showCreate && <CreateSupplierModal onClose={() => setShowCreate(false)} onCreate={async (input) => {
      await create(input)
      dispatch(showToast({ kind: 'success', message: 'Đã thêm nhà cung cấp.' }))
      setShowCreate(false)
    }} />}
  </div>
}

function CreateSupplierModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: SupplierInput) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    setBusy(true)
    try {
      await onCreate({ name: form.name.trim(), contactName: form.contactName.trim() || undefined, email: form.email.trim() || undefined, phone: form.phone.trim() || undefined, address: form.address.trim() || undefined })
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tạo nhà cung cấp.'); setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><Handshake size={20} /></div><div><h2 id="supplier-modal-title">Thêm nhà cung cấp</h2><p>Lưu thông tin liên hệ để dùng khi tạo đơn đặt hàng.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="form-field form-field--full"><span>Tên nhà cung cấp <b>*</b></span><input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên doanh nghiệp" autoFocus /></label>
            <label className="form-field"><span>Người liên hệ</span><input maxLength={150} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Họ tên" /></label>
            <label className="form-field"><span>Điện thoại</span><input type="tel" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+84..." /></label>
            <label className="form-field form-field--full"><span>Email</span><input type="email" maxLength={256} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@congty.vn" /></label>
            <label className="form-field form-field--full"><span>Địa chỉ</span><input maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" /></label>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Tạo nhà cung cấp'}</button></div>
      </form>
    </section>
  </div>
}
