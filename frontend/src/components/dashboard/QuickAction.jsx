
import { Link } from 'react-router-dom'
import {
  Leaf,
  ArrowRight,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'

function QuickAction() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-7 text-white shadow-sm">
      <div className="relative z-10 max-w-xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-2">
            <ScanSearch size={22} />
          </div>

          <span className="text-sm font-medium text-green-50">
            AI Plant Diagnosis
          </span>
        </div>

        <h2 className="text-2xl font-bold">
          Phát hiện bệnh cây trồng bằng AI
        </h2>

        <p className="mt-3 text-sm leading-6 text-green-50">
          Tải ảnh lá cây lên hệ thống để hỗ trợ nhận diện
          dấu hiệu bệnh và tìm hiểu hướng xử lý phù hợp.
        </p>

        <Link
          to="/diagnosis"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          Bắt đầu chẩn đoán
          <ArrowRight size={18} />
        </Link>

        <div className="mt-5 flex items-center gap-2 text-xs text-green-100">
          <ShieldCheck size={16} />
          <span>Kết quả mang tính hỗ trợ tham khảo</span>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-10 opacity-15">
        <Leaf size={260} strokeWidth={0.8} />
      </div>

      <div className="pointer-events-none absolute -bottom-16 right-32 opacity-10">
        <Leaf size={180} strokeWidth={0.8} />
      </div>
    </section>
  )
}

export default QuickAction
