import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Đóng popover / dropdown khi bấm ra ngoài vùng tham chiếu (ref phải bao cả nút mở và nội dung) */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element | null
      if (target && ref.current && !ref.current.contains(target)) onOutside()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ref, onOutside, active])
}
