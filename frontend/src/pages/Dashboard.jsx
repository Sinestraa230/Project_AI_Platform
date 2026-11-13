import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Cpu,
  ImagePlus,
  Leaf,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import { getStats } from '../services/statsService'
import { getDiseases } from '../services/libraryService'

// Viền trái + nhãn theo kết quả, giống sổ ghi ca bệnh
const STATUS = {
  disease: {
    border: 'border-l-red-600',
    badge: 'border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
    label: 'Có dấu hiệu bệnh trên lá cây',
    score: 'text-red-700 dark:text-red-400',
  },
  healthy: {
    border: 'border-l-emerald-500',
    badge: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    label: 'Bình thường',
    score: 'text-emerald-800 dark:text-emerald-400',
  },
}

const STEPS = [
  {
    title: 'Cách ly mẫu lá',
    text: 'Cho lá bệnh vào túi kín, tránh quệt làm bào tử nấm lan sang các luống bên cạnh.',
  },
  {
    title: 'Chọn lúc trời ráo',
    text: 'Chỉ phun khi trời tạnh ráo vài giờ, sáng sớm sau khi khô sương hoặc chiều mát.',
  },
  {
    title: 'Ghi lại đã xử lý gì',
    text: 'Ghi tên thuốc, hoạt chất và ngày phun để theo dõi hiệu quả và tránh kháng thuốc.',
  },
]

function Metric({ value, label, className = 'text-green-900 dark:text-gray-100' }) {
  return (
    <div className="px-3 py-1 text-center">
      <div className={`text-base font-bold ${className}`}>
        {value ?? '—'} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  )
}

function CaseCard({ record }) {
  const s = STATUS[record.status] ?? STATUS.disease

  return (
    <article className={`glass-panel rounded-2xl border-l-4 p-5 ${s.border}`}>
      <div className="flex flex-col items-start gap-5 sm:flex-row">
        {record.image ? (
          <img
            src={record.image}
            alt={`Ảnh lá ${record.plant}`}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="h-28 w-full shrink-0 rounded-xl border border-black/10 object-cover shadow-sm sm:w-28"
          />
        ) : (
          <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-green-700/10 sm:w-28">
            <Leaf size={30} className="text-green-700/40" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-green-900 dark:text-gray-100">
              {record.plant} · {record.disease}
            </h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${s.badge}`}>
              {s.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Độ tin cậy: <strong className={`font-bold ${s.score}`}>{record.confidence}%</strong>
            </span>
            <span>·</span>
            <span>{record.date}</span>
          </div>

          <Link
            to="/history"
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white/80 px-3.5 py-2 text-xs font-semibold text-green-900 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
          >
            Xem chi tiết trong lịch sử
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [library, setLibrary] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getStats(), getDiseases()])
      .then(([statsData, libraryData]) => {
        setStats(statsData)
        setLibrary(libraryData.diseases)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Bệnh gặp nhiều nhất trong lịch sử; chưa có lượt nào thì giới thiệu vài bệnh trong thư viện
  const overview = useMemo(() => {
    const byClass = new Map(library.map((d) => [d.className, d]))
    const top = (stats?.topDiseases ?? [])
      .map((t) => ({ ...byClass.get(t.className), count: t.count }))
      .filter((d) => d.name)
    if (top.length > 0) return { fromHistory: true, diseases: top }
    return { fromHistory: false, diseases: library.filter((d) => !d.isHealthy).slice(0, 3) }
  }, [stats, library])

  const recent = stats?.recent ?? []

  return (
    <div className="space-y-6">
      {/* Tiêu đề + số liệu gọn một dòng */}
      <section className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <h1 className="text-xl font-bold text-green-900 dark:text-gray-100">Tổng quan vườn</h1>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <RefreshCw size={13} className="text-green-700 dark:text-green-400" />
            Số liệu lấy từ lịch sử chẩn đoán của bạn
          </p>
        </div>

        <div className="flex flex-wrap items-center divide-x divide-green-700/10 rounded-xl border border-white/80 bg-white/60 p-2 dark:divide-white/10 dark:border-white/5 dark:bg-white/5">
          <Metric value={stats?.today} label="mẫu hôm nay" />
          <Metric value={stats?.total} label="mẫu đã kiểm tra" />
          <Metric value={stats?.diseased} label="mẫu có bệnh" className="text-red-700 dark:text-red-400" />
          <Metric value={stats?.healthy} label="mẫu bình thường" className="text-emerald-700 dark:text-emerald-400" />
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Cột chính */}
        <div className="space-y-6 lg:col-span-8">
          <section className="glass-panel rounded-2xl p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-700 dark:bg-green-400" />
                <h2 className="text-base font-bold uppercase tracking-wide text-green-900 dark:text-gray-100">
                  Khám mẫu lá mới
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs text-gray-500 dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                <Cpu size={14} className="text-green-700 dark:text-green-400" />
                Model chạy ngay trên máy, không cần gửi ảnh đi
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link to="/diagnosis" className="glass-card flex flex-col justify-between rounded-xl p-5">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-700/10 text-green-700 dark:text-green-400">
                    <ImagePlus size={22} />
                  </div>
                  <h3 className="text-base font-bold text-green-900 dark:text-gray-100">Tải ảnh lá cây</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Chọn ảnh JPG, PNG chụp rõ một chiếc lá, đủ sáng, lá nằm phẳng chiếm gần hết khung hình.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-3 dark:border-white/5">
                  <span className="text-[11px] font-semibold uppercase text-green-700 dark:text-green-400">
                    Kết quả sau vài giây
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-green-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm">
                    Bắt đầu chẩn đoán
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>

              <Link to="/library" className="glass-card flex flex-col justify-between rounded-xl p-5">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <BookOpen size={22} />
                  </div>
                  <h3 className="text-base font-bold text-green-900 dark:text-gray-100">Tra sổ tay sâu bệnh</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Xem triệu chứng và cách phòng {library.length > 0 ? `${library.length} loại bệnh` : 'các loại bệnh'} mà hệ thống nhận diện được.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-3 dark:border-white/5">
                  <span className="text-[11px] font-semibold uppercase text-amber-800 dark:text-amber-400">
                    Tìm không cần gõ dấu
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-black/15 bg-white px-3.5 py-1.5 text-xs font-medium text-green-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-gray-100">
                    Mở sổ tay
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* Các ca vừa kiểm tra */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-bold uppercase text-green-900 dark:text-gray-100">Mẫu vừa kiểm tra</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Các lần chẩn đoán gần nhất</p>
              </div>
              <Link
                to="/history"
                className="flex items-center gap-1 rounded-lg border border-black/5 bg-white/70 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-white dark:border-white/5 dark:bg-white/5 dark:text-green-400"
              >
                Xem toàn bộ lịch sử
                <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading && (
              <div className="glass-panel flex items-center justify-center gap-2 rounded-2xl p-10 text-sm text-gray-500">
                <LoaderCircle size={18} className="animate-spin" />
                Đang tải...
              </div>
            )}

            {!isLoading && recent.length === 0 && (
              <div className="glass-panel rounded-2xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                Chưa có mẫu nào. Tải ảnh lá đầu tiên để bắt đầu sổ khám vườn.
              </div>
            )}

            {recent.map((record) => (
              <CaseCard key={record.id} record={record} />
            ))}
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-green-700 dark:text-green-400" />
              <h3 className="text-sm font-bold text-green-900 dark:text-gray-100">
                3 việc nên làm khi phát hiện lá bệnh
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="space-y-1.5 rounded-xl border border-black/5 bg-white/70 p-4 text-xs dark:border-white/5 dark:bg-white/5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-700 text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="font-bold text-green-900 dark:text-gray-100">{step.title}</div>
                  <p className="leading-relaxed text-gray-500 dark:text-gray-400">{step.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Cột tham khảo */}
        <aside className="space-y-6 lg:col-span-4">
          <section className="glass-panel space-y-3 rounded-2xl border-l-4 border-l-red-600 p-5">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
              {overview.fromHistory ? 'Bệnh gặp nhiều nhất trong vườn' : 'Một số bệnh nên để ý'}
            </h3>

            {overview.diseases.length === 0 && (
              <p className="text-xs text-gray-500">{isLoading ? 'Đang tải...' : 'Chưa có dữ liệu.'}</p>
            )}

            {overview.diseases.map((d) => (
              <div key={d.id} className="space-y-1 rounded-xl border border-red-200/80 bg-red-50/80 p-3 text-xs leading-relaxed text-red-950 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                <div className="flex items-center justify-between gap-2 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
                    {d.plant} · {d.name}
                  </span>
                  {overview.fromHistory && (
                    <span className="shrink-0 font-semibold text-red-700 dark:text-red-400">{d.count} lần</span>
                  )}
                </div>
                <p className="line-clamp-3 text-[11px] text-red-800 dark:text-red-300">{d.symptoms}</p>
              </div>
            ))}

            <Link
              to="/library"
              className="flex items-center gap-1 pt-1 text-xs font-semibold text-green-700 dark:text-green-400"
            >
              Xem cách phòng trong sổ tay
              <ArrowRight size={14} />
            </Link>
          </section>

          <section className="glass-card space-y-1.5 rounded-2xl p-4 text-xs">
            <div className="font-bold uppercase text-green-900 dark:text-gray-100">Chụp ảnh sao cho đúng</div>
            <p className="leading-relaxed text-gray-500 dark:text-gray-400">
              Chụp một lá, mặt trên, gần đủ để thấy rõ vết bệnh. Tránh nắng gắt tạo bóng và nền nhiều lá khác.
              Ảnh mờ hoặc không phải lá thì kết quả sẽ báo không chắc chắn.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
