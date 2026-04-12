import type { Product } from '../../../types'

/** Lọc danh sách sản phẩm theo từ khóa tìm kiếm và trạng thái tồn kho */
export function filterProducts(products: Product[], search: string, statusFilter: string) {
  return products.filter((product) => {
    const matchesSearch = !search || `${product.name} ${product.sku} ${product.category} ${product.location}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All statuses' || product.status === statusFilter
    return matchesSearch && matchesStatus
  })
}
