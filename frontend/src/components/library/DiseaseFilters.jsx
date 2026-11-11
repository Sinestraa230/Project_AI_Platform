
import { Search, Filter } from 'lucide-react'

function DiseaseFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  groups, // [{ code, name }] từ getDiseases()
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center">
      {/* Tìm kiếm */}
      <div className="relative flex-1">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên bệnh hoặc tên cây..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Lọc theo nhóm bệnh */}
      <div className="flex items-center gap-3">
        <Filter size={18} className="text-gray-500" />

        <select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
        >
          <option value="all">Tất cả nhóm bệnh</option>
          {groups.map((group) => (
            <option key={group.code} value={group.code}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}

export default DiseaseFilters
