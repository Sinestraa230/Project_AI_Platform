# Docker — Project AI Platform

Mọi thứ liên quan tới container của dự án. Ứng dụng public đang chạy trên Vercel
(frontend + backend) và Neon (PostgreSQL); phần Docker dùng để **chạy cả hệ thống trên
máy bằng một lệnh**, để **CI kiểm tra đầu-cuối trong container**, và để có thể deploy
lên bất kỳ nơi nào chạy được container (Render, Koyeb, VPS…) mà không đổi code.

## Cấu trúc

```
docker-compose.yml                 # gốc repo: db + backend + frontend, 1 lệnh chạy tất cả
backend/Dockerfile                 # image backend (FastAPI, Python 3.12, non-root, HEALTHCHECK)
frontend/Dockerfile                # image frontend (Vite build -> nginx), build context = gốc repo
docker/
├── README.md                      # file này
├── nginx/default.conf.template    # nginx của image frontend: SPA + proxy /api, /health -> backend
└── docker-compose.dev.yml         # chỉ PostgreSQL, khi muốn chạy FE/BE bằng npm/uvicorn
```

Image trên Docker Hub (CI tự build và push mỗi khi merge vào `main`):

| Image | Từ | Cổng |
|---|---|---|
| `<DOCKERHUB_USERNAME>/plant-backend` | `backend/Dockerfile` | 8000 |
| `<DOCKERHUB_USERNAME>/plant-frontend` | `frontend/Dockerfile` | 80 |

Mỗi image có 2 tag: `latest` và `sha-<7 ký tự commit>` (để rollback đúng bản).

## Chạy cả hệ thống trên máy

Cần Docker Desktop (Windows/macOS) hoặc Docker Engine + Compose v2 (Linux).

```bash
cp .env.example .env          # Windows CMD: copy .env.example .env
# mở .env, điền POSTGRES_PASSWORD (bắt buộc); các biến khác để trống cũng chạy được
docker compose up --build
```

- Web: http://localhost:3000 — API docs: http://localhost:8000/docs — Postgres: `localhost:5432`
- Lần build đầu tải model ~43 MB từ Hugging Face (repo public). Muốn bỏ qua khi chỉ
  kiểm tra build: đặt `SKIP_MODEL_DOWNLOAD=1` trong `.env` (trang Chẩn đoán sẽ không chạy được model).
- Đổi code backend/frontend rồi chạy lại `docker compose up --build`.
- Xoá hết dữ liệu (DB + ảnh) để làm lại từ đầu: `docker compose down -v`.

Luồng request trong compose:

```
trình duyệt ─► frontend (nginx :80, mở ra :3000)
                 ├─ /, /history, /model/..., /assets/...  → file tĩnh (SPA)
                 └─ /api/..., /health                    → backend:8000 (FastAPI) → db:5432
```

Frontend và API cùng origin nên không cần cấu hình CORS, giống như Vite proxy khi dev.

## Chỉ chạy PostgreSQL (dev FE/BE bằng npm/uvicorn)

```bash
docker compose --project-directory . -f docker/docker-compose.dev.yml up -d
```

Rồi trong `.env` đặt `DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/plantdb`
và chạy backend/frontend như hướng dẫn trong README gốc.

## Biến môi trường

| Biến | Mặc định | Dùng cho |
|---|---|---|
| `POSTGRES_PASSWORD` | **bắt buộc** | db, backend |
| `POSTGRES_USER` / `POSTGRES_DB` | `postgres` / `plantdb` | db, backend |
| `DB_PORT` / `API_PORT` / `APP_PORT` | `5432` / `8000` / `3000` | cổng mở ra máy |
| `IMAGE_STORAGE` | `db` | backend: lưu ảnh trong DB (không mất khi tạo lại container) |
| `CORS_ORIGINS` | `*` | backend |
| `CONFIDENCE_THRESHOLD` | `0.6` | backend |
| `SKIP_MODEL_DOWNLOAD` | trống | frontend build: `1` = không tải model |
| `DOCKERHUB_USERNAME` / `IMAGE_TAG` | `local` / `local` | tên image khi build bằng compose |

Backend còn nhận mọi biến khác trong `.env.example` ở gốc (`SESSION_TTL_DAYS`, `MAX_UPLOAD_MB`…).

## Build và push thủ công

CI làm việc này tự động (`.github/workflows/deploy.yml`). Khi cần làm tay:

```bash
docker login
docker build -t <user>/plant-backend:latest ./backend
docker build -t <user>/plant-frontend:latest -f frontend/Dockerfile .
docker push <user>/plant-backend:latest
docker push <user>/plant-frontend:latest
```

Lưu ý `frontend/Dockerfile` **phải build với context là gốc repo** (dấu `.` ở cuối), vì
bước `prepare-model.mjs` đọc phiên bản model ở `backend/app/data/model/`.

## Dùng image ở nơi khác (Render, Koyeb, VPS…)

Backend: chạy image `plant-backend` với các biến `DATABASE_URL` (Postgres, ví dụ Neon),
`IMAGE_STORAGE=db`, `CORS_ORIGINS=<domain frontend>`, `APP_ENV=production`. Image đọc
`PORT` do nền tảng cấp; health check path `/health`.

Frontend: chạy image `plant-frontend` với `BACKEND_UPSTREAM=https://<domain backend>`
(nginx proxy `/api` tới đó) — hoặc build lại với `--build-arg VITE_API_URL=https://<domain backend>`.

Rollback: deploy lại tag `sha-<commit>` của bản trước thay vì `latest`.

## Migration của DBA

Backend hiện **tự tạo bảng** lúc khởi động (`Base.metadata.create_all`). Các file trong
`database/migrations/` được mount sẵn vào container `db` tại `/database` để chạy tay:

```bash
docker compose exec db psql -U postgres -d plantdb -f /database/migrations/V1__init_db.sql
```

Khi backend và DBA thống nhất một schema, bật lại bước migrate tự động trong
`.github/workflows/deploy.yml` (job `migrate`, dùng action `.github/actions/db-migrate`).
