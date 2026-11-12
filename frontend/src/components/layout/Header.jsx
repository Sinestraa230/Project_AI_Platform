import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const chip =
  'flex items-center gap-1.5 rounded-lg border border-black/5 bg-white/70 px-3 py-1.5 dark:border-white/5 dark:bg-white/5'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Giao diện sáng/tối, nhớ lựa chọn trong localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    } catch {
      // trình duyệt chặn localStorage: chỉ không nhớ được lựa chọn
    }
  }, [darkMode])

  const name = user?.full_name || user?.email || ''
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // Bấm ra ngoài hoặc nhấn Esc -> đóng menu
  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => !menuRef.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="glass-panel relative z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
        <div className={`${chip} capitalize text-gray-600 dark:text-gray-300`}>
          <CalendarDays size={15} className="text-green-700 dark:text-green-400" />
          <span>{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          aria-label="Chuyển đổi giao diện"
          aria-pressed={darkMode}
          title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/70 text-gray-600 transition hover:text-green-800 dark:border-white/5 dark:bg-white/5 dark:text-gray-300 dark:hover:text-green-400"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/60 dark:hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-900 text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="max-w-40 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {name}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="glass-panel absolute right-0 z-40 mt-3 w-60 overflow-hidden rounded-xl"
            >
              <div className="border-b border-black/5 px-4 py-3 dark:border-white/5">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user?.full_name || 'Người dùng'}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <LogOut size={17} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
