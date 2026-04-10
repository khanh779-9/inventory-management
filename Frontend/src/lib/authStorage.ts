import { EXPIRES_AT_KEY, TOKEN_KEY, USER_KEY } from './env'
import type { User } from '../types'

/** Đọc/ghi phiên đăng nhập (token + user + hạn) vào localStorage, dùng chung key cấu hình từ .env */

export interface StoredSession {
  token: string
  user: User
  expiresAt: string
}

export function loadSession(): StoredSession | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null') as User | null
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY)
    if (!token || !user) return null
    return { token, user, expiresAt: expiresAt ?? '' }
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  localStorage.setItem(EXPIRES_AT_KEY, session.expiresAt)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
