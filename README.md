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

### Chạy local bằng Docker (giống Vercel)

Môi trường local cần tách Frontend và Backend như deployment thực tế trên Vercel:

1. Backend: http://localhost:8000/health
2. Frontend: http://localhost:8080
3. Không cần `HF_TOKEN` cho backend khi chạy local bằng Docker, vì model AI được tải trong trình duyệt (LiteRT.js) theo script `frontend/scripts/prepare-model.mjs`.

Cách chạy:

```bash
docker compose down -v

docker compose up --build
```

Sau khi khởi động:

- Frontend phục vụ SPA trên cổng `8080` và tự rewrite các route con về `/index.html`.
- Backend FastAPI chạy trên cổng `8000` và có route `/health` dùng cho healthcheck.
- Database Postgres chạy trong service `db` và `IMAGE_STORAGE=db` được set rõ trong compose.
- `VITE_API_URL` được gắn lúc build, vì vậy cần rebuild image khi thay đổi địa chỉ backend.

---

### Chạy FE + BE cùng lúc (dev)

1. Backend (cổng 8000): `cd backend` → `uvicorn app.main:app --reload`
2. Frontend (cổng 5173): `cd frontend` → `npm install` → `npm run dev`

Vite tự proxy `/api` và `/health` sang `http://localhost:8000` nên không cần cấu hình CORS khi dev. Khi deploy FE tách khỏi BE: đặt `VITE_API_URL=<địa chỉ backend>` trong `frontend/.env` (xem `frontend/.env.example`).

| API | Dùng ở |
|---|---|
| `POST /api/predict` (form-data `file`) | Trang Chẩn đoán |
| `GET /api/history?limit=&offset=` · `DELETE /api/history/{id}` | Trang Lịch sử |
| `GET /api/model[?per_class=true]` | Phiên bản model + kết quả đánh giá |
| `GET /health` | Kiểm tra backend sống |

`confidence_score` trả theo thang **0–1**; FE đổi sang % trong `frontend/src/services/diagnosisService.js`.

### Kết quả đánh giá model

Mỗi lần train, notebook lưu cùng model (zip + Hugging Face):
- `metrics.json` — accuracy, macro/weighted F1, precision/recall/F1 từng lớp, 5 lớp yếu nhất, bảng **gợi ý `CONFIDENCE_THRESHOLD`** (với mỗi ngưỡng: % ảnh được trả lời, độ chính xác trên phần đó, % dự đoán sai bị chặn).
- `history.json` — loss/accuracy theo từng epoch (head + fine-tune).
- `confusion_matrix.png` — ma trận nhầm lẫn giữa 38 lớp.

Xem nhanh qua API: `GET /api/model`.
