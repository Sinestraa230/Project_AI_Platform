
import { ArrowRight, Clock, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

// records: các lần chẩn đoán gần nhất từ getStats() (cùng dạng với trang Lịch sử)
function RecentActivity({ records, isLoading }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Hoạt động gần đây
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi các lần chẩn đoán gần nhất
          </p>
        </div>

        <Link
          to="/history"
          className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
        >
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Cây trồng</th>
              <th className="px-5 py-4 font-semibold">Kết quả</th>
              <th className="px-5 py-4 font-semibold">Độ tin cậy</th>
              <th className="px-5 py-4 font-semibold">Thời gian</th>
              <th className="px-5 py-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                  {isLoading ? 'Đang tải...' : 'Chưa có lượt chẩn đoán nào.'}
                </td>
              </tr>
            )}

            {records.map((item) => (
              <tr key={item.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.plant}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
                        <Leaf size={18} className="text-green-300" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {item.plant}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {item.disease}
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-green-700">
                    {item.confidence}%
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={15} />
                    {item.date}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === 'disease'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {item.status === 'disease' ? 'Phát hiện bệnh' : 'Cây khỏe mạnh'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentActivity
