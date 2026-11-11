
import { History, ClipboardList } from 'lucide-react'

function HistoryHeader() {
  return (
    <section>
      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
        <History size={18} />
        <span>Diagnosis History</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-gray-900">
        Lịch sử chẩn đoán
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Theo dõi và xem lại các lần phân tích hình ảnh cây trồng
        đã thực hiện trên hệ thống.
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <ClipboardList size={16} className="text-green-600" />
        <span>Kết quả được lưu tự động sau mỗi lần chẩn đoán.</span>
      </div>
    </section>
  )
}

export default HistoryHeader
