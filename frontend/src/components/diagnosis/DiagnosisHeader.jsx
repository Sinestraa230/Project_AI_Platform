
import { ScanSearch, ShieldCheck } from 'lucide-react'

function DiagnosisHeader() {
  return (
    <section>
      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
        <ScanSearch size={18} />
        <span>AI Plant Diagnosis</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-gray-900">
        Chẩn đoán bệnh cây trồng
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Tải hình ảnh lá cây để hệ thống hỗ trợ phân tích
        và nhận diện các dấu hiệu bệnh thường gặp.
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck size={16} className="text-green-600" />
        <span>Hình ảnh cần rõ nét, đủ ánh sáng và không bị mờ.</span>
      </div>
    </section>
  )
}

export default DiagnosisHeader
