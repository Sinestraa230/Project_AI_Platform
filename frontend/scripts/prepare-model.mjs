// Chuẩn bị file cho việc chạy model ngay trên trình duyệt. Tự chạy trước `npm run dev` / `npm run build`.
//
// 1. Chép runtime LiteRT.js (wasm) từ node_modules vào public/litert/.
// 2. Lấy model .tflite ĐÚNG phiên bản backend đang ghi trong
//    backend/app/data/model/model_info.json (nguồn chuẩn duy nhất về phiên bản model):
//      - có sẵn ở backend/ai_artifacts/ (máy dev) và cùng phiên bản -> chép;
//      - không thì tải từ Hugging Face theo tag = phiên bản (cần HF_TOKEN vì repo private).
// 3. Ghi public/model/manifest.json cho frontend đọc lúc chạy.
//
// Biến môi trường (đặt trên Vercel, KHÔNG có tiền tố VITE_ nên không lọt vào bundle):
//   HF_TOKEN              token Hugging Face loại Read
//   HF_REPO_ID            mặc định NamHai0510/plant-disease-model
//   CONFIDENCE_THRESHOLD  mặc định 0.6
//   SKIP_MODEL_DOWNLOAD=1 bỏ qua bước lấy model (CI chỉ kiểm tra build)
import { copyFile, mkdir, readFile, rm, stat, writeFile, readdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BACKEND = path.resolve(ROOT, '..', 'backend')
const META_DIR = path.join(BACKEND, 'app', 'data', 'model')
const PUBLIC = path.join(ROOT, 'public')
const MODEL_FILE = 'plant_disease_model.tflite'
const MIN_MODEL_BYTES = 1_000_000 // chặn file lỗi/trang HTML báo lỗi bị lưu nhầm thành model

// Đọc .env ở gốc project (nếu có). Không ghi đè biến đã có sẵn trong môi trường
// (VD biến đặt trên Vercel luôn thắng).
const ROOT_ENV = path.resolve(ROOT, '..', '.env')
try {
  process.loadEnvFile(ROOT_ENV)
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const env = (k, d = '') => (process.env[k] || '').trim() || d

async function exists(p) {
  try {
    return (await stat(p)).size
  } catch {
    return 0
  }
}

async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'))
}

// LiteRT.js chỉ dùng 2 bản wasm khi không bật threads/JSPI:
// litert_wasm_internal (trình duyệt có relaxed SIMD) và litert_wasm_compat_internal (còn lại).
async function copyRuntime() {
  const src = path.join(ROOT, 'node_modules', '@litertjs', 'core', 'wasm')
  const dest = path.join(PUBLIC, 'litert')
  await mkdir(dest, { recursive: true })
  for (const name of ['litert_wasm_internal', 'litert_wasm_compat_internal']) {
    for (const ext of ['.js', '.wasm']) {
      await copyFile(path.join(src, name + ext), path.join(dest, name + ext))
    }
  }
}

async function download(url, dest, token) {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) {
    const hint = res.status === 401 || res.status === 404
      ? ' (repo private: kiểm tra HF_TOKEN loại Read và tài khoản có quyền đọc repo)'
      : ''
    throw new Error(`Tải ${url} thất bại: HTTP ${res.status}${hint}`)
  }
  const tmp = `${dest}.part`
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
  if ((await exists(tmp)) < MIN_MODEL_BYTES) throw new Error(`File tải về quá nhỏ: ${url}`)
  await rm(dest, { force: true })
  await copyFile(tmp, dest)
  await rm(tmp, { force: true })
}

async function prepareModel(version) {
  const dir = path.join(PUBLIC, 'model', version)
  const dest = path.join(dir, MODEL_FILE)
  if ((await exists(dest)) >= MIN_MODEL_BYTES) return 'đã có'

  await mkdir(dir, { recursive: true })
  // Dọn model các phiên bản cũ trong public/model/
  for (const entry of await readdir(path.join(PUBLIC, 'model'), { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== version) {
      await rm(path.join(PUBLIC, 'model', entry.name), { recursive: true, force: true })
    }
  }

  const raw = `${dest}.raw`
  let source
  const local = path.join(BACKEND, 'ai_artifacts', MODEL_FILE)
  const localInfo = path.join(BACKEND, 'ai_artifacts', 'model_info.json')
  if ((await exists(local)) >= MIN_MODEL_BYTES && (await exists(localInfo))
      && (await readJson(localInfo)).version === version) {
    await copyFile(local, raw)
    source = 'chép từ backend/ai_artifacts'
  } else {
    const repo = env('HF_REPO_ID', 'NamHai0510/plant-disease-model')
    const url = `https://huggingface.co/${repo}/resolve/${encodeURIComponent(version)}/${MODEL_FILE}`
    await download(url, raw, env('HF_TOKEN'))
    source = `tải từ Hugging Face (${repo}@${version})`
  }

  const buf = await readFile(raw)
  const patched = makeBatchStatic(buf)
  await writeFile(dest, buf)
  await rm(raw, { force: true })
  return `${source}, cố định batch=1 cho ${patched} tensor`
}

// --- Đọc/sửa tại chỗ file .tflite (định dạng FlatBuffers, schema tflite) ---
// Model xuất từ Keras có batch động: shape_signature = [-1, 300, 300, 3].
// LiteRT.js đòi tensor đầu vào khớp đúng chữ ký nên không nhận [1, 300, 300, 3].
// Ghi đè mọi -1 trong shape_signature bằng giá trị tương ứng của shape (đều là 1):
// không đổi trọng số hay phép tính, chỉ khai báo model chạy batch cố định = 1.
function makeBatchStatic(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const u32 = (p) => dv.getUint32(p, true)
  // Vị trí field thứ i của bảng tại `table`, 0 nếu field không có
  const field = (table, i) => {
    const vtable = table - dv.getInt32(table, true)
    const vtSize = dv.getUint16(vtable, true)
    const off = 4 + 2 * i < vtSize ? dv.getUint16(vtable + 4 + 2 * i, true) : 0
    return off ? table + off : 0
  }
  const vector = (table, i) => {
    const f = field(table, i)
    if (!f) return null
    const start = f + u32(f)
    return { len: u32(start), at: (k) => start + 4 + 4 * k }
  }
  const tableAt = (p) => p + u32(p)

  const model = tableAt(0)
  const subgraphs = vector(model, 2) // Model.subgraphs
  let count = 0
  for (let s = 0; s < subgraphs.len; s++) {
    const tensors = vector(tableAt(subgraphs.at(s)), 0) // SubGraph.tensors
    for (let t = 0; t < tensors.len; t++) {
      const tensor = tableAt(tensors.at(t))
      const shape = vector(tensor, 0) // Tensor.shape
      const sig = vector(tensor, 7) // Tensor.shape_signature
      if (!shape || !sig || shape.len !== sig.len) continue
      let changed = false
      for (let k = 0; k < sig.len; k++) {
        if (dv.getInt32(sig.at(k), true) === -1) {
          dv.setInt32(sig.at(k), dv.getInt32(shape.at(k), true), true)
          changed = true
        }
      }
      if (changed) count++
    }
  }
  if (!count) console.warn('[prepare-model] Không thấy tensor batch động nào — giữ nguyên model.')
  return count
}

async function main() {
  await copyRuntime()

  const info = await readJson(path.join(META_DIR, 'model_info.json'))
  const mapping = await readJson(path.join(META_DIR, 'class_mapping.json'))
  const version = info.version
  if (!version) throw new Error('backend/app/data/model/model_info.json thiếu "version".')

  let source = 'bỏ qua (SKIP_MODEL_DOWNLOAD=1)'
  if (env('SKIP_MODEL_DOWNLOAD') !== '1') source = await prepareModel(version)

  const manifest = {
    version,
    modelUrl: `/model/${version}/${MODEL_FILE}`,
    imgSize: info.img_size || 300,
    threshold: Number(env('CONFIDENCE_THRESHOLD', '0.6')),
    topK: 5,
    classes: mapping.id_to_class,
  }
  await mkdir(path.join(PUBLIC, 'model'), { recursive: true })
  await writeFile(path.join(PUBLIC, 'model', 'manifest.json'), JSON.stringify(manifest))
  console.log(`[prepare-model] model ${version}: ${source}`)
}

main().catch((err) => {
  console.error(`[prepare-model] ${err.message}`)
  process.exit(1)
})
