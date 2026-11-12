
import { CheckCircle2, AlertTriangle, Leaf } from 'lucide-react'

function DiagnosisResult({ result }) {
  if (!result) {
    return (
      <section className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
            <Leaf size={30} className="text-green-600" />
          </div>

          <h2 className="text-lg font-bold text-gray-800">
            Kết quả chẩn đoán
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
            Tải ảnh cây trồng và nhấn phân tích để xem kết quả tại đây.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={22} />
        <h2 className="text-lg font-bold text-gray-900">
          Kết quả chẩn đoán
        </h2>
      </div>

      <div className="mt-6 rounded-xl bg-red-50 p-5">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          <span className="text-sm font-semibold">
            Phát hiện dấu hiệu bệnh (mô phỏng)
          </span>
        </div>

        <h3 className="mt-3 text-xl font-bold text-gray-900">
          Bệnh đốm lá
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Đây là kết quả minh họa giao diện, không phải kết quả phân tích ảnh thực tế.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-600">
            Độ tin cậy mô phỏng
          </span>
          <span className="font-bold text-green-700">
            96.8%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[96.8%] rounded-full bg-green-600" />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900">
          Hướng dẫn tham khảo
        </h3>

        <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
          <li>• Theo dõi các dấu hiệu bất thường trên lá cây.</li>
          <li>• Kiểm tra điều kiện chăm sóc và môi trường trồng.</li>
          <li>• Tham khảo ý kiến chuyên gia nông nghiệp khi cần thiết.</li>
        </ul>
      </div>
    </section>
  )
}

export default DiagnosisResult
