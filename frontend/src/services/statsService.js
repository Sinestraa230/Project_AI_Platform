import { request } from './api'
import { toRecord } from './historyService'

// Số liệu trang Tổng quan (GET /api/stats).
// Gửi múi giờ của trình duyệt để "hôm nay" tính theo giờ người dùng.
export async function getStats({ recent = 5, top = 3 } = {}) {
  const tzOffset = -new Date().getTimezoneOffset()
  const data = await request(
    `/api/stats?tz_offset_minutes=${tzOffset}&recent=${recent}&top=${top}`,
  )
  return {
    total: data.total,
    diseased: data.diseased,
    healthy: data.healthy,
    today: data.today,
    distinctDiseases: data.distinct_diseases,
    topDiseases: data.top_diseases.map((d) => ({ className: d.class_name, count: d.count })),
    recent: data.recent.map(toRecord),
  }
}
