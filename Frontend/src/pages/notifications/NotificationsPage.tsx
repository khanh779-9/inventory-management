import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Archive, ArchiveRestore, BellRing, Mail, MailOpen, Plus, Send, X } from 'lucide-react'
import { useAppDispatch } from '../../app/hooks'
import { showToast } from '../../app/store'
import { useNotifications, createNotification } from '../../features/notifications'
import type { NotificationCreateInput } from '../../types'
import { usePagination } from '../../app/usePagination'
import PaginationBar from '../../components/common/PaginationBar'

const CATEGORY_LABEL: Record<string, string> = { System: 'Hệ thống', Admin: 'Quản trị', Order: 'Đơn hàng' }
const CATEGORY_CLASS: Record<string, string> = { System: 'notif-badge--system', Admin: 'notif-badge--admin', Order: 'notif-badge--order' }
const CATEGORY_OPTIONS: Array<{ value: 'all' | 'System' | 'Admin' | 'Order'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'System', label: 'Hệ thống' },
  { value: 'Admin', label: 'Quản trị' },
  { value: 'Order', label: 'Đơn hàng' },
]

export default function NotificationsPage() {
  const dispatch = useAppDispatch()
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [category, setCategory] = useState<'all' | 'System' | 'Admin' | 'Order'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const query = useMemo(() => ({
    archived: tab === 'archived',
    category: category === 'all' ? undefined : category,
    limit: 200,
  }), [tab, category])

  const { items, summary, loading, error, reload, markRead, setArchived } = useNotifications(query)
  const pagination = usePagination(items)

  async function runAction(id: string, action: () => Promise<void>, failureMessage: string) {
    setBusyId(id)
    try { await action() } catch (err) {
      dispatch(showToast({ kind: 'error', message: err instanceof Error ? err.message : failureMessage }))
    } finally { setBusyId(null) }
  }

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Thông báo</h1><p>Tất cả thông báo hệ thống, quản trị và đơn hàng.</p></div>
      <div className="page-title-actions"><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Gửi thông báo</button></div>
    </div>

    <section className="panel notif-filter-panel">
      <div className="notif-tabs" role="tablist" aria-label="Chuyển trạng thái">
        <button role="tab" aria-selected={tab === 'active'} className={`notif-tab ${tab === 'active' ? 'is-active' : ''}`} onClick={() => setTab('active')}>
          Đang hoạt động{summary.unread > 0 ? ` (${summary.unread} chưa đọc)` : ''}
        </button>
        <button role="tab" aria-selected={tab === 'archived'} className={`notif-tab ${tab === 'archived' ? 'is-active' : ''}`} onClick={() => setTab('archived')}>
          Đã lưu trữ
        </button>
      </div>
      <label className="notif-category-select" aria-label="Lọc theo loại">
        <span>Loại</span>
        <select value={category} onChange={(event) => { setCategory(event.target.value as typeof category); pagination.setPage(1) }}>
          {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </section>

    {error && <div className="form-error" role="alert">{error}</div>}

    <section className="panel feature-table-panel">
      <div className="panel-heading feature-table-heading"><div>
        <h2>{tab === 'active' ? 'Thông báo đang hoạt động' : 'Thông báo đã lưu trữ'}</h2>
        <p className="panel-description">{loading ? 'Đang tải...' : `${items.length} thông báo`}</p>
      </div></div>
      {items.length === 0 && !loading ? <div className="table-empty"><strong>Không có thông báo nào</strong><p>Thông báo mới từ hệ thống hoặc người dùng sẽ xuất hiện tại đây.</p></div>
        : <div className="table-scroll"><table className="inventory-table notif-table">
          <thead><tr><th>Thời gian</th><th>Loại</th><th>Nội dung</th><th>Người gửi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{pagination.pageRows.map((item) => <tr key={item.id} className={item.isRead ? '' : 'notif-row--unread'}>
            <td className="notif-time-cell">{new Date(item.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td><span className={`notif-badge ${CATEGORY_CLASS[item.category] ?? ''}`}>{CATEGORY_LABEL[item.category] ?? item.category}</span></td>
            <td className="notif-content-cell">
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </td>
            <td>{item.senderName ?? <span className="notif-system-sender">Hệ thống</span>}</td>
            <td><span className={`status-badge ${item.isRead ? 'status-badge--in-stock' : 'status-badge--low-stock'}`}><i />{item.isRead ? 'Đã đọc' : 'Chưa đọc'}</span></td>
            <td>
              <div className="notif-actions">
                <button type="button" className="table-action" disabled={busyId === item.id} title={item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'} onClick={() => void runAction(item.id, () => markRead(item.id, !item.isRead), 'Không thể cập nhật thông báo.')}>
                  {item.isRead ? <Mail size={14} /> : <MailOpen size={14} />}{item.isRead ? 'Chưa đọc' : 'Đã đọc'}
                </button>
                <button type="button" className="table-action" disabled={busyId === item.id} title={item.isArchived ? 'Khôi phục' : 'Lưu trữ'} onClick={() => void runAction(item.id, () => setArchived(item.id, !item.isArchived), 'Không thể lưu trữ thông báo.')}>
                  {item.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}{item.isArchived ? 'Khôi phục' : 'Lưu trữ'}
                </button>
              </div>
            </td>
          </tr>)}</tbody>
        </table></div>}
      <PaginationBar page={pagination.page} pageCount={pagination.pageCount} rangeFrom={pagination.rangeFrom} rangeTo={pagination.rangeTo} total={pagination.total} onPage={pagination.setPage} />
    </section>

    {showCreate && <CreateNotificationModal onClose={() => setShowCreate(false)} onCreate={async (input) => {
      await createNotification(input)
      reload()
      dispatch(showToast({ kind: 'success', message: 'Đã gửi thông báo.' }))
      setShowCreate(false)
    }} />}
  </div>
}

function CreateNotificationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: NotificationCreateInput) => Promise<void> }) {
  const [form, setForm] = useState<{ title: string; message: string; category: 'System' | 'Admin' | 'Order' }>({
    title: '', message: '', category: 'Admin',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    setBusy(true)
    try { await onCreate({ title: form.title.trim(), message: form.message.trim(), category: form.category }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể gửi thông báo.'); setBusy(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="notification-modal-title">
      <div className="modal-header"><div className="modal-title-icon"><BellRing size={20} /></div><div><h2 id="notification-modal-title">Gửi thông báo</h2><p>Thông báo sẽ được ghi nhận theo người gửi hiện tại.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="form-field form-field--full"><span>Loại thông báo <b>*</b></span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
                {CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="form-field form-field--full"><span>Tiêu đề <b>*</b></span><input required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: PO-2026-107 sắp đến hạn" autoFocus /></label>
            <label className="form-field form-field--full"><span>Nội dung <b>*</b></span><textarea required maxLength={2000} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Mô tả chi tiết thông báo..." /></label>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Đang gửi...' : <><Send size={15} /> Gửi thông báo</>}</button></div>
      </form>
    </section>
  </div>
}
