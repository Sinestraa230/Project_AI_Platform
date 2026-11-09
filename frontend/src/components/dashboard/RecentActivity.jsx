
import { ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const activities = [
  {
    id: 1,
    plant: 'Cà chua',
    disease: 'Bệnh đốm lá',
    confidence: '96.8%',
    time: '08:30 - 05/11/2026',
    status: 'Hoàn thành',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=100',
  },
  {
    id: 2,
    plant: 'Lúa',
    disease: 'Bệnh đạo ôn',
    confidence: '93.2%',
    time: '09:15 - 04/11/2026',
    status: 'Hoàn thành',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100',
  },
  {
    id: 3,
    plant: 'Khoai tây',
    disease: 'Bệnh mốc sương',
    confidence: '89.5%',
    time: '14:20 - 03/11/2026',
    status: 'Hoàn thành',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100',
  },
]

function RecentActivity() {
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
            {activities.map((item) => (
              <tr key={item.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.plant}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
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
                    {item.confidence}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={15} />
                    {item.time}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {item.status}
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
