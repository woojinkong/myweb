# 1단계: build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

RUN chmod -R +x node_modules/.bin

COPY . .
RUN npm run build

# 2단계: nginx
FROM nginx:alpine

# 기본 설정 제거하고 커스텀 설정 사용
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
