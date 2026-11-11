
import { User, Mail, GraduationCap } from 'lucide-react'

function ProfileSettings() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Thông tin tài khoản
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin cá nhân của bạn.
        </p>
      </div>

      {/* Ảnh đại diện */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <User size={30} className="text-green-700" />
        </div>

        <div>
          <p className="font-semibold text-gray-800">
            Người dùng
          </p>
          <p className="text-sm text-gray-500">
            Tài khoản minh họa
          </p>
        </div>
      </div>

      {/* Các trường thông tin */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Họ và tên
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              defaultValue="Người dùng"
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              defaultValue="user@example.com"
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Vai trò
          </label>

          <div className="relative">
            <GraduationCap
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              defaultValue="Người dùng"
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
            />
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-400">
        Đây là thông tin mẫu. Chức năng cập nhật tài khoản sẽ được
        kết nối với Backend sau.
      </p>
    </section>
  )
}

export default ProfileSettings
