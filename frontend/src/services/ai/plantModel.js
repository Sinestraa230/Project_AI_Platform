// Chạy model chẩn đoán ngay trên trình duyệt bằng LiteRT.js (file .tflite).
// File model + runtime do scripts/prepare-model.mjs đặt vào public/ lúc dev/build.
import { loadAndCompile, loadLiteRt, Tensor } from '@litertjs/core'

import { decodeImage, toModelInput, toThumbnailBlob } from './preprocess'

let modelPromise = null
const progressListeners = new Set()

function emit(progress) {
  progressListeners.forEach((fn) => fn(progress))
}

// Tải model, báo tiến độ (0..1). Trình duyệt cache file nên lần sau gần như tức thì.
async function fetchWithProgress(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Không tải được model (HTTP ${res.status}).`)
  const total = Number(res.headers.get('Content-Length')) || 0
  if (!res.body || !total) return new Uint8Array(await res.arrayBuffer())

  const buf = new Uint8Array(total)
  const reader = res.body.getReader()
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf.set(value, received)
    received += value.length
    emit({ stage: 'download', loaded: received, total })
  }
  return received === total ? buf : buf.subarray(0, received)
}

async function load() {
  emit({ stage: 'manifest' })
  const res = await fetch('/model/manifest.json', { cache: 'no-cache' })
  if (!res.ok) throw new Error('Thiếu /model/manifest.json — chạy lại npm run dev/build.')
  const manifest = await res.json()

  await loadLiteRt('/litert/')
  const bytes = await fetchWithProgress(manifest.modelUrl)
  emit({ stage: 'compile' })
  // CPU (XNNPack/wasm): chạy được trên mọi trình duyệt, kết quả ổn định
  const compiled = await loadAndCompile(bytes, { accelerator: 'wasm' })
  emit({ stage: 'ready' })
  return { manifest, compiled }
}

// Bắt đầu tải model (gọi sớm, VD khi mở trang Chẩn đoán). Lỗi -> lần sau thử lại.
export function loadModel() {
  if (!modelPromise) {
    modelPromise = load().catch((err) => {
      modelPromise = null
      throw err
    })
  }
  return modelPromise
}

export function onModelProgress(fn) {
  progressListeners.add(fn)
  return () => progressListeners.delete(fn)
}

// Giống backend/app/services/crop_service._split
// 'Corn_(maize)___Common_rust_' -> ['Corn (maize)', 'Common rust']
export function splitClassName(className) {
  const i = className.indexOf('___')
  const plant = i >= 0 ? className.slice(0, i) : className
  const disease = i >= 0 ? className.slice(i + 3) : ''
  const clean = (s) => s.replace(/_/g, ' ').split(/\s+/).filter(Boolean).join(' ')
  return [clean(plant), clean(disease || plant)]
}

const round4 = (x) => Math.round(x * 10000) / 10000

// File ảnh -> kết quả cùng dạng backend /api/predict cũ trả về + ảnh thu nhỏ để lưu
export async function diagnose(file) {
  const { manifest, compiled } = await loadModel()
  const bitmap = await decodeImage(file)
  try {
    const size = manifest.imgSize
    const input = new Tensor(toModelInput(bitmap, size), [1, size, size, 3])
    let probs
    try {
      const outputs = await compiled.run(input)
      try {
        probs = Array.from(await outputs[0].data())
      } finally {
        outputs.forEach((t) => t.delete())
      }
    } finally {
      input.delete()
    }

    const topK = probs
      .map((p, i) => [p, i])
      .sort((a, b) => b[0] - a[0])
      .slice(0, manifest.topK)
      .map(([p, i]) => ({
        category_id: i,
        class_name: manifest.classes[String(i)],
        confidence_score: round4(p),
      }))
    const top1 = topK[0]
    const [plant, disease] = splitClassName(top1.class_name)
    const thumbnail = await toThumbnailBlob(bitmap)
    return {
      category_id: top1.category_id,
      class_name: top1.class_name,
      plant_name: plant,
      disease_name: disease,
      is_healthy: top1.class_name.toLowerCase().includes('healthy'),
      confidence_score: top1.confidence_score,
      is_confident: top1.confidence_score >= manifest.threshold,
      model_version: manifest.version,
      top_k: topK,
      thumbnail,
    }
  } finally {
    bitmap.close()
  }
}
