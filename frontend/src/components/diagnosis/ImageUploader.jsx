
import { useRef, useState } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'

function ImageUploader({ onFileSelect }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const validateFile = (file) => {
    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Vui lòng chọn ảnh JPG, PNG hoặc WEBP.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Dung lượng ảnh không được vượt quá 10 MB.')
      return
    }

    setError('')
    onFileSelect(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    validateFile(file)
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          Tải hình ảnh cây trồng
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Chọn hình ảnh lá cây để bắt đầu phân tích.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-12 text-center transition ${
          isDragging
            ? 'border-green-600 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-green-50/50'
        }`}
      >
        <div className="mb-4 rounded-2xl bg-green-100 p-4">
          <Upload size={30} className="text-green-700" />
        </div>

        <h3 className="text-base font-semibold text-gray-800">
          Kéo và thả hình ảnh vào đây
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          hoặc nhấn để chọn ảnh từ thiết bị
        </p>

        <span className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon size={15} />
          JPG, PNG, WEBP · Tối đa 10 MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          validateFile(event.target.files[0])
          event.target.value = ''
        }}
      />

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}

export default ImageUploader
