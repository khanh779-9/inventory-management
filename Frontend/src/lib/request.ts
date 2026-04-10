/** Wrapper fetch dùng chung: gắn base URL + JWT, chuẩn hóa lỗi */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080/api'
import { TOKEN_KEY } from './env'

function token() {
  return localStorage.getItem(TOKEN_KEY)
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const accessToken = token()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(body?.message || `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
