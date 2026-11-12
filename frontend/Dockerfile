# =====================================================================
# Image frontend (React/Vite build tĩnh, phục vụ bằng nginx).
#
# BUILD CONTEXT PHẢI LÀ GỐC REPO, vì scripts/prepare-model.mjs (chạy trước
# `npm run build`) đọc phiên bản model ở backend/app/data/model/:
#
#   docker build -f frontend/Dockerfile -t plant-frontend .
#
# Build args:
#   VITE_API_URL          địa chỉ backend nhúng vào bundle. Để TRỐNG khi chạy sau nginx
#                         của image này (nginx proxy /api -> backend, cùng origin, không CORS).
#   SKIP_MODEL_DOWNLOAD   =1 để không tải model 43MB (CI chỉ kiểm tra build).
#                         Bản dùng thật để trống -> model nằm sẵn trong image.
# Biến lúc chạy:
#   BACKEND_UPSTREAM      backend mà nginx proxy tới (mặc định http://backend:8000 = tên
#                         service trong docker-compose).
# =====================================================================

# ---------- Giai đoạn 1: build ----------
FROM node:22-alpine AS build

WORKDIR /src/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# prepare-model.mjs đọc ../backend/app/data/model/{model_info,class_mapping}.json
COPY backend/app/data/model /src/backend/app/data/model
COPY frontend/ ./

ARG VITE_API_URL=
ARG SKIP_MODEL_DOWNLOAD=
ENV VITE_API_URL=$VITE_API_URL \
    SKIP_MODEL_DOWNLOAD=$SKIP_MODEL_DOWNLOAD
# prebuild: chép runtime LiteRT.js + lấy model -> public/, rồi vite build -> dist/
RUN npm run build

# ---------- Giai đoạn 2: phục vụ ----------
FROM nginx:1.27-alpine

ENV BACKEND_UPSTREAM=http://backend:8000

# Image nginx tự chạy envsubst cho *.template trong templates/ -> conf.d/default.conf
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
