// Lớp gọi API chung cho backend FastAPI.
// - Dev: để trống VITE_API_URL -> gọi đường dẫn tương đối, Vite proxy sang http://localhost:8000
// - Deploy: đặt VITE_API_URL=https://<domain-backend> (Vercel: Environment Variables; local: .env ở gốc project)
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Đường dẫn file backend trả về (VD image_url "/api/uploads/x.jpg") -> URL dùng được cho <img>
export function assetUrl(path) {
  return path ? `${BASE_URL}${path}` : null
}

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

// Token phiên đăng nhập (xem authService.js) — lưu localStorage để F5 không mất phiên
const TOKEN_KEY = 'auth_token'
let onUnauthorized = null

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage bị chặn (chế độ ẩn danh...) -> phiên chỉ sống tới khi tải lại trang
  }
}

// AuthContext đăng ký hàm này để tự đăng xuất khi backend báo token hết hạn/không hợp lệ
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export async function request(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.', 0)
  }

  if (res.status === 204) return null

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null)
      onUnauthorized?.()
    }
    throw new ApiError(readDetail(body) || `Lỗi máy chủ (${res.status}).`, res.status)
  }
  return body
}
