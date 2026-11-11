
import {
  Search,
  Bell,
  Sun,
  ChevronDown,
} from 'lucide-react'

function Header() {
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
        <button className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-sm font-semibold text-white">
            T
          </div>

          <span className="text-sm font-semibold text-gray-800">
            Thành Đức
          </span>

          <ChevronDown
            size={17}
            className="text-gray-400"
          />

        </button>

      </div>

    </header>
  )
}

export default Header
