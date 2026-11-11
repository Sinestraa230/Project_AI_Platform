# Giai đoạn 1: build ra file tĩnh
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Giai đoạn 2: chỉ giữ lại file đã build, phục vụ bằng nginx (image cuối rất nhẹ)
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80