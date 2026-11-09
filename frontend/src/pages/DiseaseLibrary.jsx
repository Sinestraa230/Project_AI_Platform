
import { useMemo, useState } from 'react'
import { X, Leaf } from 'lucide-react'

import LibraryHeader from '../components/library/LibraryHeader'
import DiseaseFilters from '../components/library/DiseaseFilters'
import DiseaseGrid from '../components/library/DiseaseGrid'

// Dữ liệu bệnh minh họa
const mockDiseases = [
  {
    id: 1,
    name: 'Bệnh đốm lá',
    category: 'fungal',
    categoryName: 'Bệnh do nấm',
    symptoms: 'Xuất hiện các đốm nâu hoặc đen trên bề mặt lá, có thể lan rộng khi độ ẩm cao.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
    prevention: 'Theo dõi độ ẩm, giữ vườn thông thoáng và loại bỏ lá bị bệnh.',
  },
  {
    id: 2,
    name: 'Bệnh phấn trắng',
    category: 'fungal',
    categoryName: 'Bệnh do nấm',
    symptoms: 'Trên lá xuất hiện lớp bột màu trắng, khiến lá phát triển kém.',
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=600',
    prevention: 'Tăng độ thông thoáng, tránh tưới nước lên lá vào buổi tối.',
  },
  {
    id: 3,
    name: 'Bệnh gỉ sắt',
    category: 'fungal',
    categoryName: 'Bệnh do nấm',
    symptoms: 'Xuất hiện các đốm màu vàng cam hoặc nâu giống bột gỉ trên lá.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600',
    prevention: 'Kiểm tra lá thường xuyên và loại bỏ phần cây bị ảnh hưởng.',
  },
  {
    id: 4,
    name: 'Bệnh héo xanh',
    category: 'bacterial',
    categoryName: 'Bệnh do vi khuẩn',
    symptoms: 'Cây có biểu hiện héo rũ, dù đất vẫn có độ ẩm.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    prevention: 'Sử dụng cây giống khỏe mạnh và chú ý vệ sinh đất trồng.',
  },
  {
    id: 5,
    name: 'Bệnh khảm lá',
    category: 'viral',
    categoryName: 'Bệnh do virus',
    symptoms: 'Lá xuất hiện các mảng xanh đậm và xanh nhạt xen kẽ, đôi khi biến dạng.',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600',
    prevention: 'Kiểm soát côn trùng truyền bệnh và sử dụng nguồn giống sạch bệnh.',
  },
  {
    id: 6,
    name: 'Cây khỏe mạnh',
    category: 'healthy',
    categoryName: 'Không phát hiện bệnh',
    symptoms: 'Lá có màu sắc tương đối đồng đều, không thấy dấu hiệu bất thường rõ rệt.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
    prevention: 'Duy trì chế độ chăm sóc và theo dõi cây định kỳ.',
  },
]

function DiseaseLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedDisease, setSelectedDisease] = useState(null)

  // Tìm kiếm và lọc bệnh
  const filteredDiseases = useMemo(() => {
    return mockDiseases.filter((disease) => {
      const matchesSearch = (
        disease.name + ' ' + disease.symptoms
      ).toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' ||
        disease.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, categoryFilter])

  return (
    <div className="space-y-8">
      <LibraryHeader />

      {/* Thống kê */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-50 p-3">
            <Leaf size={22} className="text-green-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Tổng số mục trong thư viện
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {mockDiseases.length}
            </p>
          </div>
        </div>
      </div>

      <DiseaseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <div>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách bệnh cây trồng
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tìm thấy {filteredDiseases.length} mục
          </p>
        </div>

        <DiseaseGrid
          diseases={filteredDiseases}
          onViewDetail={setSelectedDisease}
        />
      </div>

      {/* Chi tiết bệnh */}
      {selectedDisease && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedDisease(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Thông tin chi tiết
              </h2>

              <button
                onClick={() => setSelectedDisease(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <img
              src={selectedDisease.image}
              alt={selectedDisease.name}
              className="mt-5 h-56 w-full rounded-xl object-cover"
            />

            <span className="mt-5 inline-block rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              {selectedDisease.categoryName}
            </span>

            <h3 className="mt-3 text-xl font-bold text-gray-900">
              {selectedDisease.name}
            </h3>

            <div className="mt-5">
              <h4 className="font-semibold text-gray-900">
                Triệu chứng nhận biết
              </h4>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {selectedDisease.symptoms}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-green-50 p-4">
              <h4 className="font-semibold text-green-800">
                Hướng dẫn phòng ngừa tham khảo
              </h4>
              <p className="mt-2 text-sm leading-6 text-green-700">
                {selectedDisease.prevention}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-400">
              Thông tin chỉ mang tính tham khảo. Cần đối chiếu với thực tế
              và chuyên gia nông nghiệp trước khi đưa ra biện pháp xử lý.
            </p>

            <button
              onClick={() => setSelectedDisease(null)}
              className="mt-5 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiseaseLibrary
