// Lớp gọi API chung cho backend FastAPI.
// - Dev: để trống VITE_API_URL -> gọi đường dẫn tương đối, Vite proxy sang http://localhost:8000
// - Deploy: đặt VITE_API_URL=https://<domain-backend> trong frontend/.env
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// FastAPI trả lỗi dạng {"detail": "..."} hoặc {"detail": [{msg: ...}]} (lỗi validate)
function readDetail(body) {
  if (!body?.detail) return null
  if (typeof body.detail === 'string') return body.detail
  if (Array.isArray(body.detail)) return body.detail.map((d) => d.msg).join('; ')
  return null
}

export async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, options)
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.', 0)
  }

  if (res.status === 204) return null

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(readDetail(body) || `Lỗi máy chủ (${res.status}).`, res.status)
  }
  return body
}
