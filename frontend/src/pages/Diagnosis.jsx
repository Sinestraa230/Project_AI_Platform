
import { useEffect, useState } from 'react'
import { LoaderCircle, ScanSearch } from 'lucide-react'

import DiagnosisHeader from '../components/diagnosis/DiagnosisHeader'
import ImageUploader from '../components/diagnosis/ImageUploader'
import DiagnosisResult from '../components/diagnosis/DiagnosisResult'
import { diagnoseImage } from '../services/diagnosisService'

function Diagnosis() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (file) => {
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setResult(null)
    setError('')
  }

  const handleDiagnosis = async () => {
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)
    setResult(null)
    setError('')

    try {
      setResult(await diagnoseImage(selectedFile))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      <DiagnosisHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ImageUploader onFileSelect={handleFileSelect} />

          {previewUrl && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Ảnh đã chọn
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Xem trước hình ảnh trước khi phân tích
                  </p>
                </div>

                <button
                  onClick={handleRemoveImage}
                  disabled={isAnalyzing}
                  className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Xóa ảnh
                </button>
              </div>

              <img
                src={previewUrl}
                alt="Ảnh cây trồng đã chọn"
                className="max-h-80 w-full rounded-xl bg-gray-50 object-contain"
              />

              <p className="mt-4 truncate text-sm text-gray-500">
                {selectedFile?.name}
              </p>

              <button
                onClick={handleDiagnosis}
                disabled={isAnalyzing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <ScanSearch size={19} />
                    Phân tích bằng AI
                  </>
                )}
              </button>
            </section>
          )}
        </div>

        <div className="space-y-4">
          {isAnalyzing && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-3">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-blue-600"
                />
                <div>
                  <p className="font-semibold text-blue-900">
                    Đang phân tích hình ảnh
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Vui lòng chờ trong giây lát...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              <p className="font-semibold">Không phân tích được ảnh</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <DiagnosisResult result={result} />
        </div>
      </div>
    </div>
  )
}

export default Diagnosis
