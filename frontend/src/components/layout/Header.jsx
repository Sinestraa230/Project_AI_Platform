
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  Sun,
  ChevronDown,
  LogOut,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const name = user?.full_name || user?.email || ''
  const initial = name.trim().charAt(0).toUpperCase() || '?'

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
    <header className="flex h-[85px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">

      {/* Search */}
      <div className="relative w-80">

        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
        />

      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6">

        <button
          aria-label="Thông báo"
          className="text-gray-500 transition hover:text-green-700"
        >
          <Bell size={21} />
        </button>

        <button
          aria-label="Giao diện"
          className="text-gray-500 transition hover:text-green-700"
        >
          <Sun size={21} />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        {/* User profile */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-sm font-semibold text-white">
              {initial}
            </div>

            <span className="max-w-40 truncate text-sm font-semibold text-gray-800">
              {name}
            </span>

            <ChevronDown
              size={17}
              className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`}
            />

          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
            >
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.full_name || 'Người dùng'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
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
