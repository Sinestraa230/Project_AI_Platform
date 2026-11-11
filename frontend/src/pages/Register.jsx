import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { AuthCard, ErrorBox, Field, SubmitButton } from '../components/auth/AuthCard'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Mật khẩu phải có ít nhất 8 ký tự.')
    if (form.password !== form.confirm) return setError('Mật khẩu nhập lại không khớp.')
    setError('')
    setBusy(true)
    try {
      await register(form)
      navigate('/login', { replace: true, state: { registered: true, email: form.email } })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthCard
      title="Tạo tài khoản"
      subtitle="Đăng ký để lưu và theo dõi kết quả chẩn đoán."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-green-700 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Họ và tên" autoComplete="name" maxLength={100} value={form.fullName}
          onChange={set('fullName')} />
        <Field label="Email" type="email" autoComplete="email" required value={form.email}
          onChange={set('email')} />
        <Field label="Mật khẩu (ít nhất 8 ký tự)" type="password" autoComplete="new-password" required
          minLength={8} maxLength={128} value={form.password} onChange={set('password')} />
        <Field label="Nhập lại mật khẩu" type="password" autoComplete="new-password" required
          value={form.confirm} onChange={set('confirm')} />
        <ErrorBox message={error} />
        <SubmitButton busy={busy}>Đăng ký</SubmitButton>
      </form>
    </AuthCard>
  )
}

export default Register
