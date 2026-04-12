import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, PackagePlus, X } from 'lucide-react'
import type { Product, ProductInput } from '../../../types'
import { categories } from '../../../constants/categories'
import { useWarehouses } from '../../directory'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onSave: (data: ProductInput, id?: string) => Promise<void>
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const { data: warehouses } = useWarehouses()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ProductInput>({
    sku: '', name: '', category: categories[0]?.name ?? '', categoryId: categories[0]?.id ?? 1, description: '', unitPrice: 0,
    reorderLevel: 10, units: 0, location: '',
  })

  useEffect(() => {
    if (!product) return
    setForm({ sku: product.sku, name: product.name, category: product.category, categoryId: product.categoryId,
      description: product.description ?? '', unitPrice: product.unitPrice, reorderLevel: product.reorderLevel,
      units: product.units, location: product.location })
  }, [product])

  function setField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (form.sku.trim().length < 2 || form.name.trim().length < 2) { setError('Vui lòng nhập mã SKU và tên sản phẩm hợp lệ.'); return }
    if (form.unitPrice < 0 || form.reorderLevel < 0 || form.units < 0) { setError('Giá, tồn kho và ngưỡng cảnh báo không được âm.'); return }
    setBusy(true)
    try { await onSave({ ...form, sku: form.sku.trim().toUpperCase(), name: form.name.trim() }, product?.id) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể lưu sản phẩm.') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-header"><div className="modal-title-icon"><PackagePlus size={20} /></div><div><h2 id="product-modal-title">{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2><p>Nhập thông tin để quản lý hàng hóa chính xác hơn.</p></div><button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Đóng" disabled={busy}><X size={19} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" role="alert">{error}</div>}
            <div className="form-grid">
              <label className="form-field"><span>Mã SKU <b>*</b></span><input required maxLength={50} value={form.sku} onChange={(e) => setField('sku', e.target.value)} placeholder="VD: HP-401" autoFocus /></label>
              <label className="form-field"><span>Tên sản phẩm <b>*</b></span><input required maxLength={200} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Nhập tên dễ nhận biết" /></label>
              <label className="form-field"><span>Danh mục <b>*</b></span><select value={form.categoryId} onChange={(e) => { const id = Number(e.target.value); setField('categoryId', id); setField('category', categories.find((c) => c.id === id)?.name ?? '') }}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className="form-field"><span>Giá bán (₫)</span><input type="number" min="0" step="1000" value={form.unitPrice} onChange={(e) => setField('unitPrice', Number(e.target.value))} /></label>
              <label className="form-field"><span>Mức tồn tối thiểu</span><input type="number" min="0" max="1000000" value={form.reorderLevel} onChange={(e) => setField('reorderLevel', Number(e.target.value))} /><small>Hệ thống sẽ cảnh báo khi tồn kho chạm mức này.</small></label>
              {!product && <label className="form-field"><span>Số lượng ban đầu</span><input type="number" min="0" max="100000000" value={form.units} onChange={(e) => setField('units', Number(e.target.value))} /></label>}
              <label className="form-field"><span>Kho lưu trữ</span><select value={form.location} onChange={(e) => setField('location', e.target.value)}>{warehouses.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}</select></label>
              <label className="form-field form-field--full"><span>Mô tả sản phẩm</span><textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Thêm ghi chú giúp nhân viên dễ nhận diện..." /></label>
            </div>
          </div>
          <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="button button-primary" disabled={busy}><Check size={16} />{busy ? 'Đang lưu...' : product ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</button></div>
        </form>
      </section>
    </div>
  )
}
