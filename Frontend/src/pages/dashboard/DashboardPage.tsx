import { useState } from 'react'
import { Package, PackageCheck, PackageX, TriangleAlert } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useAppNavigate } from '../../app/useAppNavigate'
import { setStatusFilter, filterProducts, useInventoryActions, type StockActionInput } from '../../features/inventory'
import type { Product, ProductInput } from '../../types'
import StatCard from '../../components/common/StatCard'
import CashFlowChart from '../../features/inventory/components/CashFlowChart'
import InventoryAlerts from '../../features/inventory/components/InventoryAlerts'
import ProductsTable from '../../features/inventory/components/ProductsTable'
import ProductModal from '../../features/inventory/components/ProductModal'
import StockModal from '../../features/inventory/components/StockModal'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useAppNavigate()
  const { saveProduct, moveStock, deactivateProduct } = useInventoryActions()
  const products = useAppSelector((state) => state.inventory.products)
  const dashboard = useAppSelector((state) => state.inventory.dashboard)
  const statusFilter = useAppSelector((state) => state.inventory.statusFilter)
  const search = useAppSelector((state) => state.ui.search)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [stockTarget, setStockTarget] = useState<StockActionInput | null>(null)

  const filteredProducts = filterProducts(products, search, statusFilter)

  async function handleSave(input: ProductInput, id?: string) {
    await saveProduct(input, id)
    setShowProductModal(false); setEditingProduct(null)
  }

  async function handleStockSave(quantity: number, warehouseId: number, reference: string, notes: string) {
    if (!stockTarget) return
    await moveStock({ ...stockTarget, quantity, warehouseId, reference, notes })
    setStockTarget(null)
  }

  return <div className="dashboard-page">
    <div className="section-title-row"><div><h2>Tổng quan kho hàng</h2></div></div>
    <div className="stats-grid">
      <StatCard title="Tổng sản phẩm" value={dashboard.totalProducts.toLocaleString('vi-VN')} note="Mặt hàng đang quản lý" icon={<Package size={17} />} />
      <StatCard title="Đang có hàng" value={dashboard.inStockProducts.toLocaleString('vi-VN')} note="Sản phẩm đủ tồn kho" icon={<PackageCheck size={17} />} />
      <StatCard title="Sắp hết hàng" value={dashboard.lowStockProducts.toLocaleString('vi-VN')} note="Chạm ngưỡng tối thiểu" icon={<TriangleAlert size={17} />} />
      <StatCard title="Đã hết hàng" value={dashboard.outOfStockProducts.toLocaleString('vi-VN')} note="Cần nhập bổ sung" icon={<PackageX size={17} />} />
    </div>
    <div className="charts-grid">
      <CashFlowChart data={dashboard.cashFlow} />
      <InventoryAlerts data={dashboard.alerts} onViewInventory={(status) => navigate('inventory', status)} />
    </div>
    <ProductsTable products={filteredProducts} compact statusFilter={statusFilter} onStatusFilter={(value) => dispatch(setStatusFilter(value))} onSeeAll={() => navigate('inventory')} onEdit={(product) => { setEditingProduct(product); setShowProductModal(true) }} onAdjust={(product, type) => setStockTarget({ product, type, quantity: 0, warehouseId: 1, reference: '', notes: '' })} onDelete={(product) => void deactivateProduct(product)} />
    <section className="panel recent-activity-panel"><div className="panel-heading"><div><h2>Giao dịch gần đây</h2><p className="panel-description">Những thay đổi mới nhất trong kho</p></div><button className="button button-ghost" onClick={() => navigate('reports')}>Xem lịch sử <ArrowFallback /></button></div>
      <div className="recent-activity-list">{dashboard.recentMovements.length === 0 ? <p className="activity-empty">Chưa có giao dịch. Khi nhập hoặc xuất kho, lịch sử sẽ xuất hiện tại đây.</p> : dashboard.recentMovements.slice(0, 3).map((movement) => <div className="activity-row" key={movement.id}><span className={`activity-type-icon ${movement.type === 'Receive' ? 'activity-type-icon--receive' : 'activity-type-icon--issue'}`}>{movement.type === 'Receive' ? '↓' : '↑'}</span><div className="activity-main"><strong>{movement.type === 'Receive' ? 'Nhập kho' : 'Xuất kho'} · {movement.productName}</strong><span>{movement.sku} · {movement.warehouse} · {movement.performedBy}</span></div><div className="activity-end"><strong>{movement.type === 'Receive' ? '+' : '−'}{movement.quantity}</strong><span>{new Date(movement.createdAt).toLocaleDateString('vi-VN')}</span></div></div>)}</div>
    </section>

    {showProductModal && <ProductModal product={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null) }} onSave={handleSave} />}
    {stockTarget && <StockModal product={stockTarget.product} type={stockTarget.type} onClose={() => setStockTarget(null)} onSave={handleStockSave} />}
  </div>
}

function ArrowFallback() { return <span aria-hidden="true">↗</span> }
