/** Các giá trị cấu hình runtime đọc từ .env (Vite: biến phải có prefix VITE_) */

const env = import.meta.env
const number = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const APP_NAME = env.VITE_APP_NAME || 'Invento'
export const TOKEN_KEY = env.VITE_TOKEN_KEY || 'invento_token'
export const USER_KEY = env.VITE_USER_KEY || 'invento_user'
export const EXPIRES_AT_KEY = env.VITE_EXPIRES_AT_KEY || 'invento_expires_at'
export const TOAST_DURATION_MS = number(env.VITE_TOAST_DURATION_MS, 5000)
export const PAGE_SIZE = number(env.VITE_PAGE_SIZE, 7)
