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
