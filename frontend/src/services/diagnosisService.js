import { request } from './api'

// Gửi ảnh lên backend -> kết quả dự đoán.
// Backend trả confidence_score theo thang 0-1; ở đây đổi sang % cho giao diện.
export async function diagnoseImage(file) {
  const form = new FormData()
  form.append('file', file)

  const data = await request('/api/predict', { method: 'POST', body: form })
  return {
    ...data,
    confidencePercent: toPercent(data.confidence_score),
    topK: data.top_k.map((p) => ({ ...p, confidencePercent: toPercent(p.confidence_score) })),
  }
}

export function toPercent(score) {
  return Math.round(score * 1000) / 10 // 0.9769 -> 97.7
}
