import { assetUrl, request } from './api'
import { toPercent } from './diagnosisService'

// Đổi bản ghi backend -> dạng mà các component History / Dashboard đang dùng
export function toRecord(item) {
  return {
    id: item.id,
    disease: item.is_healthy ? 'Cây khỏe mạnh' : item.disease_name,
    plant: item.plant_name,
    className: item.class_name,
    status: item.is_healthy ? 'healthy' : 'disease',
    confidence: toPercent(item.confidence_score),
    date: new Date(item.created_at).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    modelVersion: item.model_version,
    image: assetUrl(item.image_url), // null với bản ghi cũ chưa lưu ảnh
  }
}

export async function getHistory({ limit = 100, offset = 0 } = {}) {
  const data = await request(`/api/history?limit=${limit}&offset=${offset}`)
  return { total: data.total, records: data.items.map(toRecord) }
}

export function deleteHistory(id) {
  return request(`/api/history/${id}`, { method: 'DELETE' })
}
