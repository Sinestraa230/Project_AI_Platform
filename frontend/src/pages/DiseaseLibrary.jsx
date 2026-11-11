
import { useEffect, useMemo, useState } from 'react'
import { X, Leaf, LoaderCircle } from 'lucide-react'

import LibraryHeader from '../components/library/LibraryHeader'
import DiseaseFilters from '../components/library/DiseaseFilters'
import DiseaseGrid from '../components/library/DiseaseGrid'
import { foldText, getDiseases } from '../services/libraryService'

function DiseaseLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [diseases, setDiseases] = useState([])
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Thư viện lấy từ backend: đúng các lớp mà model nhận diện được
  useEffect(() => {
    getDiseases()
      .then((data) => {
        setDiseases(data.diseases)
        setGroups(data.groups)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Tìm kiếm (không cần gõ dấu) và lọc bệnh
  const filteredDiseases = useMemo(() => {
    const needle = foldText(searchTerm.trim())

    return diseases.filter((disease) => {
      const matchesSearch = foldText(
        `${disease.name} ${disease.plant} ${disease.englishName} ${disease.symptoms}`,
      ).includes(needle)

      const matchesCategory =
        categoryFilter === 'all' ||
        disease.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [diseases, searchTerm, categoryFilter])

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
              {isLoading ? '—' : diseases.length}
            </p>
          </div>
        </div>
      </div>

      <DiseaseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        groups={groups}
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

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-12 text-sm text-gray-500 shadow-sm">
            <LoaderCircle size={18} className="animate-spin" />
            Đang tải thư viện...
          </div>
        ) : (
          <DiseaseGrid
            diseases={filteredDiseases}
            onViewDetail={setSelectedDisease}
          />
        )}
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

            {selectedDisease.image && (
              <img
                src={selectedDisease.image}
                alt={selectedDisease.name}
                className="mt-5 h-56 w-full rounded-xl object-cover"
              />
            )}

            <span className="mt-5 inline-block rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              {selectedDisease.categoryName}
            </span>

            <h3 className="mt-3 text-xl font-bold text-gray-900">
              {selectedDisease.name}
            </h3>

            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Cây: </span>
                <strong>{selectedDisease.plant}</strong>
              </p>

              {selectedDisease.pathogen && (
                <p>
                  <span className="text-gray-500">Tác nhân: </span>
                  <strong>{selectedDisease.pathogen}</strong>
                </p>
              )}
            </div>

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
