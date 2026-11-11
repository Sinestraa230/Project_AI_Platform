
import {
  ScanSearch,
  Bug,
  Leaf,
  Activity,
} from 'lucide-react'

import StatCard from './StatCard'

const statistics = [
  {
    title: 'Tổng lượt chẩn đoán',
    value: '1,284',
    description: 'Dữ liệu minh họa',
    icon: ScanSearch,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Bệnh đã nhận diện',
    value: '18',
    description: 'Loại bệnh trong thư viện',
    icon: Bug,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Cây khỏe mạnh',
    value: '356',
    description: 'Kết quả phân loại khỏe mạnh',
    icon: Leaf,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Chẩn đoán hôm nay',
    value: '42',
    description: 'Lượt xử lý trong ngày',
    icon: Activity,
    color: 'bg-blue-100 text-blue-700',
  },
]

function StatsSection() {
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
