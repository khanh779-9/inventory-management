import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from './hooks'
import { dismissToast } from './store'
import { setApiError } from '../features/inventory'
import { useInventoryRefresh } from '../features/inventory/hooks/useInventoryRefresh'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import LoginPage from '../pages/login/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import InventoryPage from '../pages/inventory/InventoryPage'
import PurchaseOrdersPage from '../pages/purchasing/PurchaseOrdersPage'
import ShipmentsPage from '../pages/shipments/ShipmentsPage'
import TrackingPage from '../pages/tracking/TrackingPage'
import ReportsPage from '../pages/reports/ReportsPage'
import CashFlowPage from '../pages/cashflow/CashFlowPage'
import WarehousesPage from '../pages/directory/WarehousesPage'
import SuppliersPage from '../pages/directory/SuppliersPage'
import CustomersPage from '../pages/directory/CustomersPage'
import SettingsPage from '../pages/settings/SettingsPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import { APP_NAME, TOAST_DURATION_MS } from '../lib/env'

export default function App() {
  const dispatch = useAppDispatch()
  const refresh = useInventoryRefresh()
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const currentPage = useAppSelector((state) => state.ui.currentPage)
  const toast = useAppSelector((state) => state.ui.toast)
  const apiError = useAppSelector((state) => state.inventory.apiError)
  const loading = useAppSelector((state) => state.inventory.loading)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (token) void refresh()
  }, [refresh, token])

  // Toast tự đóng sau khoảng configured; reset bộ đếm mỗi khi có toast mới
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => dispatch(dismissToast()), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast, dispatch])

  if (!token) return <LoginPage />

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <div className="content-region">
          {apiError && <div className="api-error-notice"><CircleAlert size={16} /><span>Không tải được dữ liệu từ API: {apiError}. Đang giữ lại dữ liệu hiển thị gần nhất.</span><button onClick={() => void refresh()}>Thử lại</button><button aria-label="Đóng thông báo" onClick={() => dispatch(setApiError(null))}><X size={15} /></button></div>}
          {loading && <div className="loading-bar"><span /></div>}

          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'purchase-orders' && <PurchaseOrdersPage />}
          {currentPage === 'shipments' && <ShipmentsPage />}
          {currentPage === 'tracking' && <TrackingPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'cash-flow' && <CashFlowPage />}
          {currentPage === 'warehouses' && <WarehousesPage />}
          {currentPage === 'suppliers' && <SuppliersPage />}
          {currentPage === 'customers' && <CustomersPage />}
          {currentPage === 'notifications' && <NotificationsPage />}
          {currentPage === 'settings' && <SettingsPage />}

          <footer className="app-footer"><span>© 2026 {APP_NAME} Inventory</span><span><span className="footer-dot" /> {user?.email}</span></footer>
        </div>
      </main>

      {toast && <div className={`toast toast--${toast.kind}`} role="status"><span className="toast-icon">{toast.kind === 'success' ? <CheckCircle2 size={18} /> : toast.kind === 'error' ? <CircleAlert size={18} /> : <Info size={18} />}</span><span>{toast.message}</span><button onClick={() => dispatch(dismissToast())} aria-label="Đóng thông báo"><X size={16} /></button></div>}
    </div>
  )
}
