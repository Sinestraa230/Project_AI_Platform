
import { NavLink } from 'react-router-dom'

import {
  LayoutDashboard,
  ScanSearch,
  History,
  BookOpen,
  Settings,
  Sprout,
} from 'lucide-react'

const menuItems = [
  {
    name: 'Tổng quan',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Chẩn đoán',
    path: '/diagnosis',
    icon: ScanSearch,
  },
  {
    name: 'Lịch sử',
    path: '/history',
    icon: History,
  },
  {
    name: 'Thư viện bệnh',
    path: '/library',
    icon: BookOpen,
  },
  {
    name: 'Cài đặt',
    path: '/settings',
    icon: Settings,
  },
]

function Sidebar() {
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white">

      {/* Logo */}
      <div className="flex h-[85px] items-center gap-3 border-b border-gray-100 px-6">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
          <Sprout size={27} className="text-green-700" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900">
            AI Plant Platform
          </h1>

          <p className="text-xs text-gray-500">
            Smart Agriculture
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-7">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu chính
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.8} />

              <span>{item.name}</span>
            </NavLink>
          )
        })}

      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-5">

        <div className="rounded-xl bg-green-50 p-4">

          <div className="flex items-center gap-2 text-green-800">
            <Sprout size={18} />

            <span className="text-sm font-semibold">
              Nông nghiệp thông minh
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-green-700">
            Công nghệ AI đồng hành cùng nhà nông.
          </p>

        </div>

      </div>

    </aside>
  )
}

export default Sidebar
