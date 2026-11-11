// Đăng ký / đăng nhập / đăng xuất — gọi /api/auth của backend
import { request, setToken } from './api'

const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export function register({ email, password, fullName }) {
  return request('/api/auth/register', json({ email, password, full_name: fullName }))
}

// Trả về user; token được lưu lại để các request sau tự gắn header Authorization
export async function login({ email, password }) {
  const data = await request('/api/auth/login', json({ email, password }))
  setToken(data.access_token)
  return data.user
}

export function fetchMe() {
  return request('/api/auth/me')
}

// Luôn xoá token ở máy, kể cả khi backend lỗi/không kết nối được
export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } catch {
    // bỏ qua — phía máy vẫn coi như đã đăng xuất
  } finally {
    setToken(null)
  }
}
