import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { setStatusFilter, filterProducts, useInventoryActions, type StockActionInput } from '../../features/inventory'
import type { Product, ProductInput } from '../../types'
import ProductsTable from '../../features/inventory/components/ProductsTable'
import ProductModal from '../../features/inventory/components/ProductModal'
import StockModal from '../../features/inventory/components/StockModal'

export default function InventoryPage() {
  const dispatch = useAppDispatch()
  const { saveProduct, moveStock, deactivateProduct } = useInventoryActions()
  const products = useAppSelector((state) => state.inventory.products)
  const dashboard = useAppSelector((state) => state.inventory.dashboard)
  const statusFilter = useAppSelector((state) => state.inventory.statusFilter)
  const search = useAppSelector((state) => state.ui.search)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [stockTarget, setStockTarget] = useState<StockActionInput | null>(null)

  const filteredProducts = filterProducts(products, search, statusFilter)

  function exportCsv() {
    const csv = ['SKU,Tên sản phẩm,Danh mục,Kho,Số lượng,Trạng thái,Giá', ...filteredProducts.map((p) => [p.sku, `"${p.name}"`, p.category, p.location, p.units, p.status, p.unitPrice].join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'invento-products.csv'; a.click(); URL.revokeObjectURL(url)
    dispatch(showToast({ kind: 'success', message: 'Đã xuất danh sách sản phẩm.' }))
  }

  async function handleSave(input: ProductInput, id?: string) {
    await saveProduct(input, id)
    setShowProductModal(false); setEditingProduct(null)
  }

  async function handleStockSave(quantity: number, warehouseId: number, reference: string, notes: string) {
    if (!stockTarget) return
    await moveStock({ ...stockTarget, quantity, warehouseId, reference, notes })
    setStockTarget(null)
  }

  return <div className="inventory-page">
    <div className="page-title-row"><div><h1>Kho sản phẩm</h1><p>Theo dõi số lượng, vị trí lưu trữ và tình trạng của từng sản phẩm.</p></div><div className="page-title-actions"><button className="button button-secondary" onClick={exportCsv}><FileDown size={15} /> Xuất CSV</button><button className="button button-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true) }}><span className="button-plus">+</span> Thêm sản phẩm</button></div></div>
    <div className="inventory-summary-row"><div className="inventory-mini-stat"><span>Tổng mặt hàng</span><strong>{products.length}</strong><small>SKU đang quản lý</small></div><div className="inventory-mini-stat"><span>Tổng số lượng</span><strong>{dashboard.totalUnits.toLocaleString('vi-VN')}</strong><small>Đơn vị trong kho</small></div><div className="inventory-mini-stat inventory-mini-stat--low"><span>Sắp hết hàng</span><strong>{dashboard.lowStockProducts}</strong><small>Cần lên kế hoạch nhập</small></div><div className="inventory-mini-stat inventory-mini-stat--out"><span>Đã hết hàng</span><strong>{dashboard.outOfStockProducts}</strong><small>Cần xử lý ưu tiên</small></div></div>
    <ProductsTable products={filteredProducts} statusFilter={statusFilter} onStatusFilter={(value) => dispatch(setStatusFilter(value))} onCreate={() => { setEditingProduct(null); setShowProductModal(true) }} onEdit={(product) => { setEditingProduct(product); setShowProductModal(true) }} onAdjust={(product, type) => setStockTarget({ product, type, quantity: 0, warehouseId: 1, reference: '', notes: '' })} onDelete={(product) => void deactivateProduct(product)} />

    {showProductModal && <ProductModal product={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null) }} onSave={handleSave} />}
    {stockTarget && <StockModal product={stockTarget.product} type={stockTarget.type} onClose={() => setStockTarget(null)} onSave={handleStockSave} />}
  </div>
}
