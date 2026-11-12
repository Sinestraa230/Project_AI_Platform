import { NavLink } from 'react-router-dom'

import {
  LayoutGrid,
  Stethoscope,
  ScrollText,
  BookOpen,
  SlidersHorizontal,
  Sprout,
  WifiOff,
} from 'lucide-react'

const menuItems = [
  { name: 'Tổng quan vườn', path: '/', icon: LayoutGrid },
  { name: 'Chẩn đoán bệnh', path: '/diagnosis', icon: Stethoscope },
  { name: 'Sổ tay sâu bệnh', path: '/library', icon: BookOpen },
  { name: 'Lịch sử khám vườn', path: '/history', icon: ScrollText },
  { name: 'Cài đặt', path: '/settings', icon: SlidersHorizontal },
]

function Sidebar() {
  return (
    <aside className="glass-panel relative z-20 flex h-screen w-64 shrink-0 flex-col justify-between border-y-0 border-l-0 p-5">
      <div>
        {/* Tên app */}
        <div className="flex items-center gap-3 border-b border-green-700/10 pb-6 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-md shadow-green-700/20">
            <Sprout size={22} />
          </div>
          <div>
            <div className="text-sm font-bold text-green-900 dark:text-green-400">
              Sổ khám vườn
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              Nhận diện bệnh qua ảnh lá
            </div>
          </div>
        </div>

        <nav className="mt-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition ${
                    isActive
                      ? 'border-green-700/20 bg-green-700/10 font-semibold text-green-900 shadow-sm dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400'
                      : 'border-transparent text-gray-600 hover:bg-white/50 hover:text-green-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-green-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-green-700 dark:bg-green-400" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Model chạy ngay trên máy: chẩn đoán được cả khi mạng chập chờn */}
      <div className="rounded-xl border border-green-700/15 bg-white/60 p-3.5 text-xs shadow-sm dark:border-white/5 dark:bg-white/5">
        <div className="flex items-center gap-2 font-medium text-green-900 dark:text-green-400">
          <WifiOff size={14} />
          <span>Chẩn đoán trên máy</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          Ảnh được phân tích ngay trong trình duyệt. Tải model một lần, lần sau không cần chờ.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
