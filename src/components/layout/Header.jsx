
import { useEffect, useState } from 'react'
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  UserRound,
} from 'lucide-react'

function Header({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Lấy giao diện đã lưu
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )

  // Cập nhật giao diện và lưu lựa chọn
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleLogout = () => {
    setIsMenuOpen(false)
    onLogout?.()
  }

  return (
    <header className="flex h-[85px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 transition-colors dark:border-gray-800 dark:bg-gray-900">

      {/* Search */}
      <div className="relative w-80">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6">

        <button
          type="button"
          aria-label="Thông báo"
          className="text-gray-500 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
        >
          <Bell size={21} />
        </button>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(prev => !prev)}
          aria-label="Chuyển đổi giao diện"
          title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="text-gray-500 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
        >
          {darkMode ? <Sun size={21} /> : <Moon size={21} />}
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* User profile dropdown */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-sm font-semibold text-white">
              T
            </div>

            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Thành Đức
            </span>

            <ChevronDown
              size={17}
              className={`text-gray-400 transition-transform ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">

              <div className="border-b border-gray-100 p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-800 font-semibold text-white">
                    T
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      Thành Đức
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tài khoản người dùng
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <UserRound size={18} />
                  <span>Thông tin tài khoản</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  )
}

export default Header
