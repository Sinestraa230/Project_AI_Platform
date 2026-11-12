
import { Eye, Leaf, AlertTriangle } from 'lucide-react'

function HistoryTable({ records, onViewDetail }) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <Leaf size={36} className="mx-auto text-gray-300" />

        <h3 className="mt-4 font-semibold text-gray-800">
          Không tìm thấy kết quả
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Thử thay đổi từ khóa hoặc bộ lọc của bạn.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Hình ảnh</th>
              <th className="px-6 py-4 font-semibold">Kết quả</th>
              <th className="px-6 py-4 font-semibold">Độ tin cậy</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 text-right font-semibold">Chi tiết</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.map((record) => (
              <tr key={record.id} className="transition hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img
                    src={record.image}
                    alt="Ảnh cây trồng"
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {record.status === 'disease' ? (
                      <AlertTriangle size={17} className="text-orange-500" />
                    ) : (
                      <Leaf size={17} className="text-green-600" />
                    )}

                    <span className="text-sm font-semibold text-gray-800">
                      {record.disease}
                    </span>
                  </div>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      record.status === 'disease'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {record.status === 'disease'
                      ? 'Phát hiện bệnh'
                      : 'Cây khỏe mạnh'}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                  {record.confidence}%
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {record.date}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(record)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HistoryTable
