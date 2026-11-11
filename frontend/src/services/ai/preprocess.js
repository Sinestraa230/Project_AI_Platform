// Tiền xử lý ảnh trên trình duyệt — PHẢI giống lúc huấn luyện:
// keras.utils.image_dataset_from_directory resize bằng tf.image.resize (bilinear,
// half_pixel_centers, không antialias) trên ảnh RGB uint8, rồi chia 255.

// Cạnh dài tối đa khi đọc ảnh gốc (ảnh 50MP từ điện thoại sẽ tốn hàng trăm MB RAM)
const MAX_DECODE_SIDE = 4096

export class InvalidImageError extends Error {}

// Đọc file -> ImageBitmap đã xoay đúng theo EXIF
export async function decodeImage(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new InvalidImageError('File không phải ảnh hợp lệ.')
  }
}

function drawToCanvas(bitmap, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  return { canvas, ctx, w, h }
}

// Resize bilinear kiểu tf.image.resize (half_pixel_centers=True, antialias=False)
// rgba: Uint8ClampedArray (w*h*4) -> Float32Array (size*size*3), giá trị 0..1
export function resizeBilinear(rgba, w, h, size) {
  const out = new Float32Array(size * size * 3)
  const sy = h / size
  const sx = w / size
  const xs = new Array(size)
  for (let x = 0; x < size; x++) {
    const fx = Math.max(0, (x + 0.5) * sx - 0.5)
    const x0 = Math.min(Math.floor(fx), w - 1)
    xs[x] = [x0, Math.min(x0 + 1, w - 1), fx - Math.floor(fx)]
  }
  let o = 0
  for (let y = 0; y < size; y++) {
    const fy = Math.max(0, (y + 0.5) * sy - 0.5)
    const y0 = Math.min(Math.floor(fy), h - 1)
    const y1 = Math.min(y0 + 1, h - 1)
    const dy = fy - Math.floor(fy)
    const r0 = y0 * w * 4
    const r1 = y1 * w * 4
    for (let x = 0; x < size; x++) {
      const [x0, x1, dx] = xs[x]
      for (let c = 0; c < 3; c++) {
        const tl = rgba[r0 + x0 * 4 + c]
        const tr = rgba[r0 + x1 * 4 + c]
        const bl = rgba[r1 + x0 * 4 + c]
        const br = rgba[r1 + x1 * 4 + c]
        const top = tl + (tr - tl) * dx
        const bottom = bl + (br - bl) * dx
        out[o++] = (top + (bottom - top) * dy) / 255
      }
    }
  }
  return out
}

// ImageBitmap -> tensor đầu vào (1, size, size, 3) dạng Float32Array
export function toModelInput(bitmap, size) {
  const { ctx, w, h } = drawToCanvas(bitmap, MAX_DECODE_SIDE)
  const { data } = ctx.getImageData(0, 0, w, h)
  return resizeBilinear(data, w, h, size)
}

// Ảnh thu nhỏ (JPEG) gửi lên backend để lưu lịch sử — nhẹ, đã bỏ EXIF/GPS
export function toThumbnailBlob(bitmap, maxSide = 1024, quality = 0.85) {
  const { canvas } = drawToCanvas(bitmap, maxSide)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Không tạo được ảnh thu nhỏ.'))),
      'image/jpeg',
      quality,
    )
  })
}
