
import { useEffect, useMemo, useState } from 'react'
import { X, Activity, Leaf, LoaderCircle, Trash2 } from 'lucide-react'

import HistoryHeader from '../components/history/HistoryHeader'
import HistoryFilters from '../components/history/HistoryFilters'
import HistoryTable from '../components/history/HistoryTable'
import { deleteHistory, getHistory } from '../services/historyService'

function History() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then(({ records }) => setRecords(records))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id)
      setRecords((prev) => prev.filter((r) => r.id !== id))
      setSelectedRecord(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Tìm kiếm và lọc dữ liệu
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = record.disease
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [records, searchTerm, statusFilter])

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
                {records.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Phát hiện bệnh</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {records.filter((item) => item.status === 'disease').length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cây khỏe mạnh</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {records.filter((item) => item.status === 'healthy').length}
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

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-12 text-sm text-gray-500 shadow-sm">
            <LoaderCircle size={18} className="animate-spin" />
            Đang tải lịch sử...
          </div>
        ) : (
          <HistoryTable
            records={filteredRecords}
            onViewDetail={setSelectedRecord}
          />
        )}
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

            {selectedRecord.image ? (
              <img
                src={selectedRecord.image}
                alt="Ảnh cây trồng"
                className="mt-5 h-48 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mt-5 flex h-32 w-full items-center justify-center rounded-xl bg-green-50">
                <Leaf size={36} className="text-green-300" />
              </div>
            )}

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="text-gray-500">Kết quả: </span>
                <strong>{selectedRecord.disease}</strong>
              </p>

              <p>
                <span className="text-gray-500">Cây: </span>
                <strong>{selectedRecord.plant}</strong>
              </p>

              <p>
                <span className="text-gray-500">Độ tin cậy: </span>
                <strong>{selectedRecord.confidence}%</strong>
              </p>

              <p>
                <span className="text-gray-500">Thời gian: </span>
                <strong>{selectedRecord.date}</strong>
              </p>
            </div>

            <p className="mt-5 text-xs text-gray-400">Model: {selectedRecord.modelVersion}</p>

            <button
              onClick={() => handleDelete(selectedRecord.id)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={17} />
              Xóa khỏi lịch sử
            </button>

            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-3 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
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

