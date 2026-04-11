import { useCallback } from 'react'
import { useAppDispatch } from '../../../app/hooks'
import { showToast } from '../../../app/store'
import { setSession } from '../store/authSlice'
import { login as loginApi } from '../api/authApi'
import { saveSession } from '../../../lib/authStorage'

/** Đăng nhập qua API, lưu phiên vào localStorage và cập nhật store */
export function useLogin() {
  const dispatch = useAppDispatch()
  return useCallback(async (email: string, password: string) => {
    const response = await loginApi(email, password)
    saveSession({ token: response.token, user: response.user, expiresAt: response.expiresAt })
    dispatch(setSession({ token: response.token, user: response.user, expiresAt: response.expiresAt }))
    dispatch(showToast({ kind: 'success', message: 'Đã kết nối API thành công.' }))
  }, [dispatch])
}
