import type { Product } from '../../../types'

export function getStatus(units: number, reorderLevel: number): Product['status'] {
  if (units <= 0) return 'Out of Stock'
  if (units <= reorderLevel) return 'Low Stock'
  return 'In Stock'
}
