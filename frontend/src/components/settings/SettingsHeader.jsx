
import { Settings, SlidersHorizontal } from 'lucide-react'

function SettingsHeader() {
  return (
    <section>
      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
        <Settings size={18} />
        <span>System Settings</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-gray-900">
        Cài đặt
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Quản lý thông tin tài khoản và tùy chỉnh trải nghiệm sử dụng
        nền tảng nhận diện bệnh cây trồng.
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <SlidersHorizontal size={16} className="text-green-600" />
        <span>Tùy chỉnh các thiết lập theo nhu cầu của bạn.</span>
      </div>
    </section>
  )
}

export default SettingsHeader
