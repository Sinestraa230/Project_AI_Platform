import { CheckCircle2, AlertTriangle, Leaf, HelpCircle } from 'lucide-react'

// result: dữ liệu từ diagnoseImage() — model chạy trên trình duyệt, lưu qua POST /api/detections
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

  const {
    plant_name: plant,
    disease_name: disease,
    is_healthy: healthy,
    is_confident: confident,
    confidencePercent,
    topK,
    model_version: modelVersion,
    saveError,
  } = result

  // 3 trạng thái: chưa chắc chắn / khỏe mạnh / có bệnh
  const tone = !confident
    ? { box: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', Icon: HelpCircle,
        label: 'Chưa đủ chắc chắn — nên chụp lại ảnh rõ hơn' }
    : healthy
      ? { box: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-600', Icon: Leaf,
          label: 'Cây khỏe mạnh' }
      : { box: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', Icon: AlertTriangle,
          label: 'Phát hiện dấu hiệu bệnh' }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={22} />
        <h2 className="text-lg font-bold text-gray-900">
          Kết quả chẩn đoán
        </h2>
      </div>

      {saveError && (
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Chưa lưu được vào Lịch sử: {saveError}
        </p>
      )}

      <div className={`mt-6 rounded-xl p-5 ${tone.box}`}>
        <div className={`flex items-center gap-2 ${tone.text}`}>
          <tone.Icon size={20} />
          <span className="text-sm font-semibold">{tone.label}</span>
        </div>

        <h3 className="mt-3 text-xl font-bold text-gray-900">
          {healthy ? 'Không phát hiện bệnh' : disease}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Cây: <strong>{plant}</strong>
        </p>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-600">Độ tin cậy</span>
          <span className={`font-bold ${tone.text}`}>{confidencePercent}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {topK.length > 1 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-900">Các khả năng khác</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {topK.slice(1).map((p) => (
              <li key={p.category_id} className="flex justify-between gap-4">
                <span className="truncate">{p.class_name.replaceAll('_', ' ')}</span>
                <span className="shrink-0 font-medium text-gray-700">{p.confidencePercent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900">Hướng dẫn tham khảo</h3>

        <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
          <li>• Theo dõi các dấu hiệu bất thường trên lá cây.</li>
          <li>• Kiểm tra điều kiện chăm sóc và môi trường trồng.</li>
          <li>• Tham khảo ý kiến chuyên gia nông nghiệp khi cần thiết.</li>
        </ul>
      </div>

      <p className="mt-6 text-xs text-gray-400">Model: {modelVersion}</p>
    </section>
  )
}

export default DiagnosisResult
