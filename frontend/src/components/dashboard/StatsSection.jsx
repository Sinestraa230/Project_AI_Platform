
import {
  ScanSearch,
  Bug,
  Leaf,
  Activity,
} from 'lucide-react'

import StatCard from './StatCard'

// stats: dữ liệu từ getStats() (GET /api/stats); null khi đang tải hoặc lỗi
function StatsSection({ stats }) {
  const show = (value) => (stats ? value.toLocaleString('vi-VN') : '—')

  const statistics = [
    {
      title: 'Tổng lượt chẩn đoán',
      value: show(stats?.total),
      description: 'Tất cả lượt đã lưu trong lịch sử',
      icon: ScanSearch,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Bệnh đã nhận diện',
      value: show(stats?.distinctDiseases),
      description: 'Loại bệnh khác nhau đã phát hiện',
      icon: Bug,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Cây khỏe mạnh',
      value: show(stats?.healthy),
      description: 'Kết quả phân loại khỏe mạnh',
      icon: Leaf,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Chẩn đoán hôm nay',
      value: show(stats?.today),
      description: 'Lượt xử lý trong ngày',
      icon: Activity,
      color: 'bg-blue-100 text-blue-700',
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          description={item.description}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </section>
  )
}

export default StatsSection
