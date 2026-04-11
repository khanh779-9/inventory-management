import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../../types'
import { loadSession } from '../../../lib/authStorage'

interface AuthState { token: string | null; user: User | null; expiresAt: string | null }

const saved = loadSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: saved?.token ?? null,
    user: saved?.user ?? null,
    expiresAt: saved?.expiresAt || null,
  } as AuthState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; user: User; expiresAt: string }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.expiresAt = action.payload.expiresAt
    },
    clearSession(state) {
      state.token = null
      state.expiresAt = null
      state.user = null
    },
  },
})

export const { setSession, clearSession } = authSlice.actions
export default authSlice.reducer
