
import { useState } from 'react'
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Settings2,
} from 'lucide-react'

function PreferenceSettings() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('vi')

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Tùy chọn hệ thống
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Tùy chỉnh giao diện và thông báo.
        </p>
      </div>

      <div className="space-y-6">
        {/* Giao diện */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3">
              {darkMode ? (
                <Moon size={20} className="text-purple-600" />
              ) : (
                <Sun size={20} className="text-orange-500" />
              )}
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                Giao diện tối
              </p>
              <p className="text-sm text-gray-500">
                Bật hoặc tắt chế độ tối.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            className={`relative h-6 w-11 rounded-full transition ${
              darkMode ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                darkMode ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Thông báo */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Bell size={20} className="text-blue-600" />
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                Thông báo
              </p>
              <p className="text-sm text-gray-500">
                Cho phép nhận thông báo từ hệ thống.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={() => setNotifications(!notifications)}
            className={`relative h-6 w-11 rounded-full transition ${
              notifications ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                notifications ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Ngôn ngữ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <Globe size={20} className="text-green-600" />
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                Ngôn ngữ
              </p>
              <p className="text-sm text-gray-500">
                Chọn ngôn ngữ hiển thị.
              </p>
            </div>
          </div>

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
        <Settings2 size={17} />
        <span>
          Các tùy chọn hiện chỉ lưu trong trạng thái của trang,
          chưa được lưu vào tài khoản.
        </span>
      </div>
    </section>
  )
}

export default PreferenceSettings
