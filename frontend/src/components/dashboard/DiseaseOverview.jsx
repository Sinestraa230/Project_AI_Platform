
import { ArrowRight, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

// diseases: mục thư viện từ getDiseases(); kèm count khi lấy theo lịch sử chẩn đoán
function DiseaseOverview({ diseases, fromHistory, isLoading }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Bệnh cây trồng phổ biến
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {fromHistory
              ? 'Các bệnh được phát hiện nhiều nhất trong lịch sử chẩn đoán'
              : 'Một số bệnh trong thư viện'}
          </p>
        </div>

        <Link
          to="/library"
          className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
        >
          Xem thư viện
          <ArrowRight size={16} />
        </Link>
      </div>

      {diseases.length === 0 && (
        <p className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu bệnh.'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diseases.map((disease) => (
          <article
            key={disease.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-green-700">
                <Leaf size={15} />
                {disease.plant}
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {fromHistory ? `${disease.count} lượt` : disease.categoryName}
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-gray-900">
              {disease.name}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
              {disease.symptoms}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DiseaseOverview
