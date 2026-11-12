
import { useMemo, useState } from 'react'
import { X, Activity } from 'lucide-react'

import HistoryHeader from '../components/history/HistoryHeader'
import HistoryFilters from '../components/history/HistoryFilters'
import HistoryTable from '../components/history/HistoryTable'

// Dữ liệu minh họa
const mockRecords = [
  {
    id: 1,
    disease: 'Bệnh đốm lá',
    status: 'disease',
    confidence: 96.8,
    date: '05/11/2026 - 08:30',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200',
  },
  {
    id: 2,
    disease: 'Cây khỏe mạnh',
    status: 'healthy',
    confidence: 98.2,
    date: '04/11/2026 - 15:20',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200',
  },
  {
    id: 3,
    disease: 'Bệnh cháy lá',
    status: 'disease',
    confidence: 91.5,
    date: '03/11/2026 - 10:15',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
  },
  {
    id: 4,
    disease: 'Cây khỏe mạnh',
    status: 'healthy',
    confidence: 97.4,
    date: '02/11/2026 - 09:45',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200',
  },
]

function History() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Tìm kiếm và lọc dữ liệu
  const filteredRecords = useMemo(() => {
    return mockRecords.filter((record) => {
      const matchesSearch = record.disease
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  return (
    <div className="space-y-8">
      <HistoryHeader />

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Activity className="text-blue-600" size={21} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng lượt chẩn đoán</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockRecords.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Phát hiện bệnh</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {mockRecords.filter((item) => item.status === 'disease').length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cây khỏe mạnh</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {mockRecords.filter((item) => item.status === 'healthy').length}
          </p>
        </div>
      </div>

      <HistoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Danh sách chẩn đoán
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tìm thấy {filteredRecords.length} kết quả
            </p>
          </div>
        </div>

        <HistoryTable
          records={filteredRecords}
          onViewDetail={setSelectedRecord}
        />
      </div>

      {/* Hộp thoại xem chi tiết */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Chi tiết chẩn đoán
              </h2>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <img
              src={selectedRecord.image}
              alt="Ảnh cây trồng"
              className="mt-5 h-48 w-full rounded-xl object-cover"
            />

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="text-gray-500">Kết quả: </span>
                <strong>{selectedRecord.disease}</strong>
              </p>

              <p>
                <span className="text-gray-500">Độ tin cậy mô phỏng: </span>
                <strong>{selectedRecord.confidence}%</strong>
              </p>

              <p>
                <span className="text-gray-500">Thời gian: </span>
                <strong>{selectedRecord.date}</strong>
              </p>
            </div>

            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Đây là dữ liệu minh họa giao diện, chưa phải kết quả từ mô hình AI thực tế.
            </p>

            <button
              onClick={() => setSelectedRecord(null)}
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

export default History
