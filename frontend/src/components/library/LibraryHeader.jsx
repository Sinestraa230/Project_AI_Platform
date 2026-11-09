
import { BookOpen, Sprout } from 'lucide-react'

function LibraryHeader() {
  return (
    <section>
      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
        <BookOpen size={18} />
        <span>Plant Disease Library</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-gray-900">
        Thư viện bệnh cây trồng
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Tra cứu thông tin về các bệnh thường gặp trên cây trồng,
        triệu chứng nhận biết và kiến thức phòng ngừa.
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Sprout size={16} className="text-green-600" />
        <span>Kiến thức tham khảo dành cho người trồng cây.</span>
      </div>
    </section>
  )
}

export default LibraryHeader
