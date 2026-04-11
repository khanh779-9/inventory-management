import { useState } from 'react'
import type { FormEvent } from 'react'
import { Boxes } from 'lucide-react'
import { useLogin } from '../../features/auth'
import PasswordInput from '../../components/common/PasswordInput'

export default function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(''); setBusy(true)
    try { await login(email.trim(), password) }
    catch (err) { setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-7">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span className="brand-name">Invento</span>
          </div>
          <h1 className="font-display text-xl font-bold text-ink tracking-tight">Đăng nhập quản lý kho</h1>
          <p className="text-sm text-muted mt-1.5">Dùng tài khoản được quản trị viên cấp để tiếp tục.</p>
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
            {error && <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2" role="alert">{error}</div>}
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Email</span>
              <input
                type="email" required autoComplete="username" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@congty.vn" autoFocus
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</span>
              <PasswordInput
                required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <button
              type="submit" disabled={busy}
              className="mt-1 w-full rounded-lg bg-[#4653b4] hover:bg-[#3a46a0] text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </section>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Boxes size={13} /> Hệ thống quản lý kho hàng nội bộ
        </p>
      </div>
    </div>
  )
}
