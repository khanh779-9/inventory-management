import { BarChart3, Bell, Boxes, Building2, ClipboardList, DollarSign, Handshake, Home, Route, Truck, Users, type LucideIcon } from 'lucide-react'

export interface NavItem { id: string; label: string; icon: LucideIcon }
export interface NavGroup { label: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  { label: 'Quản lý', items: [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'inventory', label: 'Sản phẩm', icon: Boxes },
    { id: 'purchase-orders', label: 'Đơn đặt hàng', icon: ClipboardList },
  ] },
  { label: 'Vận chuyển', items: [
    { id: 'shipments', label: 'Lô hàng đến', icon: Truck },
    { id: 'tracking', label: 'Theo dõi đơn', icon: Route },
  ] },
  { label: 'Phân tích', items: [
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'cash-flow', label: 'Dòng tiền', icon: DollarSign },
  ] },
  { label: 'Danh mục', items: [
    { id: 'warehouses', label: 'Kho hàng', icon: Building2 },
    { id: 'suppliers', label: 'Nhà cung cấp', icon: Handshake },
    { id: 'customers', label: 'Khách hàng', icon: Users },
  ] },
  { label: 'Hệ thống', items: [
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ] },
]
