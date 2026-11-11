import { request } from './api'

// Đổi mục thư viện của backend -> dạng mà các component Library / Dashboard đang dùng
function toDisease(item) {
  return {
    id: item.category_id,
    className: item.class_name,
    name: item.name_vi,
    englishName: item.disease_name,
    plant: item.plant_name_vi,
    category: item.group,
    categoryName: item.group_name,
    isHealthy: item.is_healthy,
    pathogen: item.pathogen,
    symptoms: item.symptoms,
    prevention: item.prevention,
    image: null, // backend chưa có ảnh minh họa cho từng bệnh
  }
}

// Thư viện bệnh (GET /api/diseases): các lớp mà model nhận diện được.
// groups: { mã nhóm: tên tiếng Việt } — chỉ giữ nhóm thực sự có mục.
export async function getDiseases() {
  const data = await request('/api/diseases')
  const diseases = data.items.map(toDisease)
  const used = new Set(diseases.map((d) => d.category))
  const groups = Object.entries(data.groups)
    .filter(([code]) => used.has(code))
    .map(([code, name]) => ({ code, name }))
  return { diseases, groups }
}

// Bỏ dấu + chữ thường để tìm kiếm: "Cà chua" -> "ca chua"
export function foldText(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
