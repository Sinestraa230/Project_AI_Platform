### BẢNG PHÂN CHIA NHIỆM VỤ DỰ ÁN & VẬN HÀNH CI/CD

#### 1. Quy định chung cho tất cả thành viên (Toàn team)

* **Không commit trực tiếp vào `main**`: Mọi tính năng hay sửa lỗi đều phải tạo nhánh riêng (`feature/<ten-task>`, `bugfix/<ten-loi>`).
* **Kiểm tra local trước khi push**: Trước khi mở Pull Request (PR), bắt buộc phải pull code mới nhất từ `main` về nhánh của mình để giải quyết xung đột (conflict) ngay trên máy cá nhân.
* **Quy trình merge code**: Mỗi PR cần ít nhất 1 người review approve và tất cả bài kiểm tra CI báo **Passed (tích xanh)** mới được merge vào `main`.
* **Bảo mật tuyệt đối**: Tuyệt đối không commit file chứa secret, mật khẩu hay token (như `.env`). Chỉ cập nhật biến mẫu vào `.env.example`.

---

#### 2. Vai trò Frontend (FE)

* **Thư mục phụ trách:** `/frontend`
* **Nhiệm vụ chuẩn hóa code:**
* Cấu hình đầy đủ các lệnh kiểm tra trong `package.json`:
* Lệnh lint kiểm tra cú pháp (ví dụ: `npm run lint`).
* Lệnh chạy kiểm thử (ví dụ: `npm test`).
* Lệnh đóng gói sản phẩm (ví dụ: `npm run build`).


* Đảm bảo các lệnh trên chạy thành công không có lỗi trên máy cá nhân trước khi push.


* **Bàn giao cho CI/CD:** Cung cấp danh sách các lệnh script chạy build/test cần thiết để CI/CD tích hợp vào file pipeline tự động.

---

#### 3. Vai trò Backend (BE)

* **Thư mục phụ trách:** `/backend`
* **Nhiệm vụ chuẩn hóa code:**
* Định nghĩa rõ ràng file quản lý thư viện (`package.json`, `requirements.txt`, `pom.xml`, hoặc `go.mod`).
* Viết unit test cho các API cốt lõi và đảm bảo lệnh chạy test (ví dụ: `npm test`, `pytest`, `mvn test`) thực thi thành công.
* Đảm bảo ứng dụng có thể build ra file chạy độc lập mà không bị crash.


* **Bàn giao cho CI/CD:** Cung cấp phiên bản môi trường (Node/Python/Java version) và câu lệnh chạy test/build chính xác.

---

#### 4. Vai trò Database / SQL (DBA)

* **Thư mục phụ trách:** `/database`
* **Nhiệm vụ quản lý dữ liệu:**
* Quản lý schema thông qua các file migration đánh số thứ tự tăng dần (ví dụ: `V1__init_db.sql`, `V2__add_table_users.sql`).
* **Quy tắc bất biến:** Không sửa file migration cũ đã merge vào `main`. Muốn sửa đổi bảng, luôn tạo một file migration mới.
* Chuẩn bị file dữ liệu mẫu (`seed_data.sql`) và file khởi tạo container (`init.sql`) để team test local dễ dàng.


* **Bàn giao cho CI/CD:** Cung cấp thông số cấu hình DB mẫu (loại DB, port, user/pass test) để thiết lập môi trường test tự động.

---

#### 5. Vai trò Docker / DevOps

* **Thư mục phụ trách:** `/docker` và các file `Dockerfile`
* **Nhiệm vụ container hóa:**
* Viết và tối ưu hóa `Dockerfile` cho Frontend và Backend (ưu tiên multi-stage build để giảm dung lượng image).
* Viết file `docker/docker-compose.dev.yml` để các thành viên clone repo về chỉ cần gõ 1 lệnh là chạy được toàn bộ hệ thống (FE + BE + DB) trên máy.
* Cấu hình Reverse Proxy (Nginx/Traefik) để định tuyến domain trỏ đúng về cổng của Frontend và Backend.


* **Bàn giao cho CI/CD:** Đảm bảo các file `Dockerfile` chạy `docker build` thành công, không bị lỗi thiếu layer hay file context.

---

#### 6. Vai trò CI/CD (Quản trị hệ thống)

* **Thư mục phụ trách:** `/.github` và toàn bộ quy trình tích hợp/triển khai
* **Nhiệm vụ thiết lập & giám sát:**
* Khởi tạo khung thư mục dự án, `.gitignore`, `.env.example`, `CODEOWNERS` và PR template.
* Cấu hình **Branch Protection Rules** để khóa nhánh `main`, bắt buộc PR và bắt buộc CI pass.
* Tạo và bảo trì file workflow GitHub Actions (`pr-check.yml`, `deploy.yml`).
* Quản lý GitHub Secrets (SSH key, biến môi trường server) và tự động hóa quá trình deploy lên tên miền khi code được merge vào `main`.



---

---

### Kiến trúc

```
Trình duyệt ──(chạy model .tflite bằng LiteRT.js)──> kết quả chẩn đoán
     │
     └── POST /api/detections (kết quả + ảnh thu nhỏ) ──> Backend FastAPI ──> Postgres (Neon)
```

- **Model AI chạy ngay trên trình duyệt** của người dùng (file `plant_disease_model.tflite`, ~43 MB, tải 1 lần rồi trình duyệt cache). Backend **không** cần TensorFlow.
- **Backend** (FastAPI): đăng nhập, lưu/đọc lịch sử, thống kê, thư viện bệnh, thông tin model.
- **Phiên bản model** do 1 file quyết định: `backend/app/data/model/model_info.json` (`version` = tag trên Hugging Face). Frontend build tải đúng file `.tflite` có tag đó, backend đọc metadata từ cùng thư mục.

### Chạy FE + BE cùng lúc (dev)

0. Cấu hình: copy `.env.example` (ở **gốc project**) thành `.env` cùng chỗ, điền giá trị cần thiết. Backend, frontend (Vite + `prepare-model.mjs`) và ai-service đều đọc chung file này. Khi dev mọi biến có thể để trống (dùng SQLite cục bộ, Vite proxy sang backend).
1. Backend (cổng 8000): `cd backend` → `pip install -r requirements-dev.txt` → `uvicorn app.main:app --reload`
2. Frontend (cổng 5173): `cd frontend` → `npm install` → `npm run dev`

`npm run dev` / `npm run build` tự chạy `scripts/prepare-model.mjs` trước: chép runtime LiteRT.js vào `public/litert/` và lấy model vào `public/model/<phiên bản>/` (chép từ `backend/ai_artifacts/` nếu có đúng phiên bản, không thì tải từ Hugging Face `NamHai0510/plant-disease-model`). Hai thư mục này không commit.

Vite tự proxy `/api` và `/health` sang `http://localhost:8000` nên không cần cấu hình CORS khi dev. Khi deploy: đặt `VITE_API_URL=<địa chỉ backend>` trong Environment Variables của Vercel (danh sách đầy đủ các biến: `.env.example` ở gốc project).

| API | Dùng ở |
|---|---|
| `POST /api/detections` (form-data: `category_id`, `confidence_score`, `model_version`, `top_k` JSON, `file` ảnh) | Trang Chẩn đoán lưu kết quả do trình duyệt tính. Backend tự suy ra tên lớp/cây/bệnh từ `category_id` và tự tính `is_confident` |
| `GET /api/history?limit=&offset=` · `DELETE /api/history/{id}` | Trang Lịch sử |
| `GET /api/uploads/<tên file>` | Ảnh đã chẩn đoán (`image_url` trong kết quả/lịch sử) — trang Lịch sử, Tổng quan |
| `GET /api/diseases[?group=&plant=&q=&include_healthy=]` · `GET /api/diseases/{category_id}` | Trang Thư viện bệnh: 38 lớp của model kèm triệu chứng, phòng ngừa |
| `GET /api/crops` | 14 loại cây model hỗ trợ |
| `GET /api/stats[?tz_offset_minutes=420&recent=5&top=5]` | Trang Tổng quan |
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `POST /api/auth/logout` | Đăng ký / đăng nhập / đăng xuất (token gửi qua header `Authorization: Bearer <token>`) |
| `GET /api/model[?per_class=true]` | Phiên bản model + kết quả đánh giá |
| `GET /health` | Kiểm tra backend sống |

`confidence_score` theo thang **0–1**; FE đổi sang % trong `frontend/src/services/diagnosisService.js`.

### Đổi phiên bản model

Notebook Kaggle upload model lên Hugging Face và gắn **tag** dạng `efficientnetb3-YYYYMMDD-HHMM` (kèm `model_info.json`, `metrics.json`, `class_mapping.json`, `plant_disease_model.tflite`).

1. `cd backend` → `python scripts/sync_model_meta.py` (bản mới nhất) hoặc `python scripts/sync_model_meta.py --tag <tag>` (ghim/quay lại bản cũ).
2. Commit 3 file trong `backend/app/data/model/` → mở PR → merge. Vercel build lại: frontend tải `.tflite` của tag mới, backend báo phiên bản mới ở `/health` và `/api/model`.

Xem đang chạy bản nào: `GET /health` hoặc trường `model_version` của mỗi lần chẩn đoán.

**Kỹ thuật:** model xuất từ Keras có batch động (`[-1, 300, 300, 3]`) mà LiteRT.js đòi đúng chữ ký, nên `prepare-model.mjs` ghi lại `shape_signature` thành batch = 1 (không đổi trọng số; đã kiểm chứng kết quả trùng khớp model Keras). Tiền xử lý trên trình duyệt (`src/services/ai/preprocess.js`) làm giống lúc train: resize bilinear kiểu `tf.image.resize`, chia 255.

### Kết quả đánh giá model

Mỗi lần train, notebook lưu cùng model (Hugging Face):
- `metrics.json` — accuracy, macro/weighted F1, precision/recall/F1 từng lớp, 5 lớp yếu nhất, bảng **gợi ý `CONFIDENCE_THRESHOLD`**.
- `history.json` — loss/accuracy theo từng epoch.
- `confusion_matrix.png` — ma trận nhầm lẫn giữa 38 lớp.

Xem nhanh qua API: `GET /api/model`.

---

### Kiểm tra trước khi merge (CI)

Mỗi PR vào `main` chạy `.github/workflows/pr-check.yml`:
- **Backend:** `pip install -r requirements-dev.txt` → `pytest` (Python 3.12). Không cần model.
- **Frontend:** `npm ci` → `npm run lint` → `npm run build` (Node 22, bỏ qua bước tải model).

Chạy giống CI trên máy: `cd backend && python -m pytest -q` và `cd frontend && npm run lint && npm run build`.

Merge vào `main` = deploy thật, nên hãy bật **Branch protection** cho `main` (GitHub → Settings → Branches → *Require status checks to pass*: chọn `Backend (pytest)` và `Frontend (lint + build)`).

---

## Deploy

Toàn bộ dùng gói miễn phí, không cần thẻ ngân hàng:

| Phần | Dịch vụ | Ghi chú |
|---|---|---|
| Frontend + model AI | Vercel Hobby — 1 project, Root Directory `frontend` | Model `.tflite` + runtime LiteRT.js phục vụ dạng file tĩnh |
| Backend (FastAPI, không TensorFlow) | Vercel Hobby — 1 project khác, Root Directory `backend` | Chạy dạng Vercel Function (Python) |
| Database + ảnh | Neon Postgres (free, 0.5 GB) | Ảnh lưu trong DB vì ổ đĩa của Vercel Function chỉ đọc |

Cả 2 project tự build lại khi `main` thay đổi. Hugging Face chỉ chứa model, không chạy gì.

Làm **đúng thứ tự** dưới đây.

#### Bước 1 — Neon: tạo database
1. Đăng ký tại https://neon.tech (đăng nhập bằng GitHub được, không cần thẻ).
2. **Create project** → region gần người dùng (VD *AWS Asia Pacific (Singapore)*).
3. Dashboard → **Connect** → copy **Connection string** (bản có `-pooler`), dạng
   `postgresql://neondb_owner:<mật khẩu>@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`.
   Không cần tạo bảng: backend tự tạo khi khởi động.

#### Bước 2 — Vercel: deploy backend
1. https://vercel.com → đăng nhập bằng GitHub → **Add New → Project** → chọn repo này. (Gói Hobby chỉ nối được repo của **tài khoản cá nhân**, không nối được repo thuộc GitHub Organization; người tạo project phải có quyền vào repo.)
2. **Project Name** VD `plant-backend`, **Root Directory: `backend`**. Framework Preset tự nhận **FastAPI** (điểm vào `backend/index.py`).
3. **Environment Variables:**

| Tên | Giá trị mẫu | Ghi chú |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...@ep-xxxx-pooler...neon.tech/neondb?sslmode=require&channel_binding=require` | Bước 1. Thiếu biến này app báo lỗi rõ ràng và không chạy |
| `APP_ENV` | `production` | |
| `CORS_ORIGINS` | `*` lúc đầu, đổi thành domain frontend ở Bước 4 | |

   Không cần đặt `IMAGE_STORAGE` (trên Vercel tự dùng `db`).
4. **Deploy** → ghi lại domain, VD `https://plant-backend.vercel.app`. Kiểm tra `https://plant-backend.vercel.app/health` trả `{"status":"ok", ...}`.

#### Bước 3 — Vercel: deploy frontend
1. **Add New → Project** → chọn **cùng repo** lần nữa.
2. **Project Name** VD `plant-platform`, **Root Directory: `frontend`**. Framework Preset tự nhận **Vite** — giữ nguyên Build Command (`npm run build`) và Output (`dist`).
3. **Environment Variables:**

| Tên | Giá trị mẫu | Ghi chú |
|---|---|---|
| `VITE_API_URL` | `https://plant-backend.vercel.app` | Domain backend ở Bước 2, không có `/` ở cuối |
| `HF_TOKEN` *(tuỳ chọn)* | `hf_...` | Chỉ cần nếu repo model chuyển sang private. Không có tiền tố `VITE_` nên không lọt vào trình duyệt |

4. **Deploy**. Log build phải có dòng `[prepare-model] model efficientnetb3-...: tải từ Hugging Face ...`. Ghi lại domain, VD `https://plant-platform.vercel.app`.

`VITE_API_URL` được nhúng vào bundle lúc build: đổi giá trị thì phải **Redeploy**. `frontend/vercel.json` chuyển mọi đường dẫn về `index.html` (F5 ở `/history` không bị 404) và cho trình duyệt cache model lâu dài.

#### Bước 4 — Khoá CORS và kiểm tra
1. Project backend → Settings → Environment Variables → sửa `CORS_ORIGINS` = domain frontend ở Bước 3 → **Deployments → Redeploy**.
2. Mở domain frontend → đăng ký → đăng nhập → trang Chẩn đoán đợi tải model (lần đầu) → chẩn đoán 1 ảnh → kiểm tra trang Lịch sử có ảnh, trang Tổng quan có số liệu.
3. Neon → **Tables** thấy `users`, `detections`, `stored_images`, `sessions` có dữ liệu.

#### Bước 5 — GitHub
Bật **Branch protection** cho `main` như mục CI ở trên. Không cần secret nào trên GitHub.

#### Vận hành
- **Lần đầu mở trang Chẩn đoán** phải tải ~43 MB model (có thanh tiến độ); các lần sau trình duyệt dùng bản đã cache. Mỗi lần chẩn đoán mất khoảng 1 giây trên máy tính, lâu hơn trên điện thoại yếu.
- **Backend khởi động lạnh:** Vercel Function lâu không dùng sẽ khởi động lại ở request kế tiếp (vài giây, kèm kết nối Neon). Nếu lưu lịch sử thất bại, trang Chẩn đoán vẫn hiện kết quả và báo "Chưa lưu được vào Lịch sử".
- **Dung lượng Neon 0.5 GB:** mỗi ảnh lưu ~20–300 KB, tức khoảng vài nghìn lượt chẩn đoán có ảnh. Theo dõi ở Neon → **Usage**; xoá bớt lịch sử cũ hoặc đặt `SAVE_IMAGES=false` ở backend.
- **Vercel Hobby** chỉ dành cho mục đích phi thương mại.
