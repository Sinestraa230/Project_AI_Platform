
import { Leaf, ArrowUpRight } from 'lucide-react'

function DiseaseGrid({ diseases, onViewDetail }) {
  if (diseases.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <Leaf size={36} className="mx-auto text-gray-300" />

        <h3 className="mt-4 font-semibold text-gray-800">
          Không tìm thấy bệnh cây trồng
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Thử thay đổi từ khóa hoặc nhóm bệnh.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {diseases.map((disease) => (
        <article
          key={disease.id}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <img
              src={disease.image}
              alt={disease.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-green-700 backdrop-blur">
              {disease.categoryName}
            </span>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900">
              {disease.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
              {disease.symptoms}
            </p>

            <button
              onClick={() => onViewDetail(disease)}
              className="mt-5 flex w-full items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              <span>Xem thông tin</span>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default DiseaseGrid
