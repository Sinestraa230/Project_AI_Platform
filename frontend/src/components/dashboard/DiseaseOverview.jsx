
import { ArrowRight, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

const diseases = [
  {
    id: 1,
    name: 'Bệnh đốm lá',
    plant: 'Cà chua',
    description: 'Xuất hiện các đốm màu nâu trên bề mặt lá.',
    severity: 'Trung bình',
    color: 'bg-yellow-100 text-yellow-700',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300',
  },
  {
    id: 2,
    name: 'Bệnh đạo ôn',
    plant: 'Lúa',
    description: 'Gây tổn thương lá và ảnh hưởng đến sinh trưởng.',
    severity: 'Cao',
    color: 'bg-red-100 text-red-700',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300',
  },
  {
    id: 3,
    name: 'Bệnh mốc sương',
    plant: 'Khoai tây',
    description: 'Có thể gây hư hại lá và thân cây.',
    severity: 'Cao',
    color: 'bg-red-100 text-red-700',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
  },
]

function DiseaseOverview() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Bệnh cây trồng phổ biến
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Một số bệnh thường gặp trong thư viện
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diseases.map((disease) => (
          <article
            key={disease.id}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <img
              src={disease.image}
              alt={disease.plant}
              className="h-44 w-full object-cover"
            />

            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-medium text-green-700">
                  <Leaf size={15} />
                  {disease.plant}
                </span>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${disease.color}`}>
                  Mức độ: {disease.severity}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-gray-900">
                {disease.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {disease.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DiseaseOverview
