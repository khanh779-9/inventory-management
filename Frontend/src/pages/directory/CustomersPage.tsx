import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Users, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { useCustomers } from '../../features/directory'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'
import type { CustomerInput } from '../../types'

export default function CustomersPage() {
  const dispatch = useAppDispatch()
  const { data: customers, loading, error, create } = useCustomers()
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'Admin')
  const pagination = usePagination(customers)
  const [showCreate, setShowCreate] = useState(false)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Khách hàng</h1><p>Danh sách khách mua hàng để theo dõi giao dịch xuất kho.</p></div>
      {isAdmin && <div className="page-title-actions"><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Thêm khách hàng</button></div>}
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div><h2>Danh sách khách hàng</h2><p className="panel-description">{loading ? 'Đang tải...' : `${customers.length} khách hàng`}</p></div></div>
      {customers.length === 0 && !loading ? <div className="table-empty"><strong>Chưa có khách hàng nào</strong><p>Thêm khách đầu tiên để bắt đầu theo dõi đơn bán.</p></div>
        : <div className="table-scroll"><table className="inventory-table">
          <thead><tr><th>Khách hàng</th><th>Email</th><th>Điện thoại</th><th>Tạo lúc</th></tr></thead>
          <tbody>{pagination.pageRows.map((c) => <tr key={c.id}>
            <td className="feature-primary-cell">{c.name}</td>
            <td>{c.email ?? '—'}</td>
            <td>{c.phone ?? '—'}</td>
            <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
          </tr>)}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>
    {showCreate && <CreateCustomerModal onClose={() => setShowCreate(false)} onCreate={async (input) => {
      await create(input)
      dispatch(showToast({ kind: 'success', message: 'Đã thêm khách hàng.' }))
      setShowCreate(false)
    }} />}
  </div>
}

function CreateCustomerModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: CustomerInput) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    setBusy(true)
    try {
      await onCreate({ name: form.name.trim(), email: form.email.trim() || undefined, phone: form.phone.trim() || undefined })
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tạo khách hàng.'); setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><Users size={20} /></div><div><h2 id="customer-modal-title">Thêm khách hàng</h2><p>Lưu thông tin liên hệ của khách mua hàng.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="form-field form-field--full"><span>Tên khách hàng <b>*</b></span><input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên doanh nghiệp / cá nhân" autoFocus /></label>
            <label className="form-field"><span>Điện thoại</span><input type="tel" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+84..." /></label>
            <label className="form-field"><span>Email</span><input type="email" maxLength={256} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="khach@email.vn" /></label>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Tạo khách hàng'}</button></div>
      </form>
    </section>
  </div>
}
