
import { Sprout } from 'lucide-react'

function WelcomeSection() {
  return (
    <section className="flex items-center justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
          <Sprout size={18} />
          <span>AI Plant Platform</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Tổng quan
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Theo dõi tình trạng cây trồng và quản lý hoạt động chẩn đoán bệnh.
        </p>
      </div>

      <div className="hidden rounded-xl bg-green-50 px-5 py-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300 md:block">
        Nền tảng nông nghiệp thông minh
      </div>
    </section>
  )
}

export default WelcomeSection
