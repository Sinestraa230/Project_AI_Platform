
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = (event) => {
    event.preventDefault()

    const result = login(email, password)

    if (!result.success) {
      setError(result.message)
      return
    }

    navigate(location.state?.from || '/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white">
            <Leaf size={32} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            AI Plant Platform
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Đăng nhập để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email"
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-green-600"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Bản demo Frontend — nhập email và mật khẩu bất kỳ để tiếp tục.
        </p>
      </div>
    </div>
  )
}

export default Login
