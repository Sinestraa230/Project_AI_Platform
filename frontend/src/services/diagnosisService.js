import { request } from './api'

// Model chạy ngay trên trình duyệt (src/services/ai/plantModel.js). Import động để
// LiteRT.js chỉ được tải khi vào trang Chẩn đoán, không làm nặng các trang khác.
const loadAi = () => import('./ai/plantModel')

// Gọi sớm (khi mở trang) để tải model trong lúc người dùng chọn ảnh.
// onProgress nhận { stage: 'manifest' | 'download' | 'compile' | 'ready', loaded?, total? }
export async function preloadModel(onProgress) {
  const ai = await loadAi()
  const off = onProgress ? ai.onModelProgress(onProgress) : () => {}
  try {
    await ai.loadModel()
    onProgress?.({ stage: 'ready' })
  } finally {
    off()
  }
}

// Gửi kết quả + ảnh thu nhỏ lên backend để lưu lịch sử (POST /api/detections)
async function saveDetection(local) {
  const form = new FormData()
  form.append('category_id', String(local.category_id))
  form.append('confidence_score', String(local.confidence_score))
  form.append('model_version', local.model_version)
  form.append(
    'top_k',
    JSON.stringify(local.top_k.map(({ category_id, confidence_score }) => ({ category_id, confidence_score }))),
  )
  form.append('file', local.thumbnail, 'leaf.jpg')
  return request('/api/detections', { method: 'POST', body: form })
}

// Ảnh -> kết quả chẩn đoán. Lưu lịch sử thất bại (mất mạng, backend ngủ...) thì vẫn
// trả kết quả, kèm saveError để giao diện báo "chưa lưu được".
// confidence_score theo thang 0-1; ở đây đổi thêm sang % cho giao diện.
export async function diagnoseImage(file) {
  const ai = await loadAi()
  const { thumbnail, ...local } = await ai.diagnose(file)

  let data = { ...local, created_at: new Date().toISOString(), id: null, image_url: null }
  let saveError = null
  try {
    const saved = await saveDetection({ ...local, thumbnail })
    data = { ...data, id: saved.id, image_url: saved.image_url, created_at: saved.created_at }
  } catch (err) {
    saveError = err.message
  }

  return {
    ...data,
    saveError,
    confidencePercent: toPercent(data.confidence_score),
    topK: data.top_k.map((p) => ({ ...p, confidencePercent: toPercent(p.confidence_score) })),
  }
}

export function toPercent(score) {
  return Math.round(score * 1000) / 10 // 0.9769 -> 97.7
}
