import type { User } from '../../../types'
import { request } from '../../../lib/request'

export async function login(email: string, password: string): Promise<{ token: string; user: User; expiresAt: string }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}
