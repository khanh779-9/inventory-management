import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Ô nhập mật khẩu với nút con mắt bật/tắt hiện chữ nằm trong chính ô nhập */
export default function PasswordInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-field">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className} password-field-input`} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
