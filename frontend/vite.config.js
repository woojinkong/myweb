import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Vite 개발 서버 설정 (React → Spring Boot 프록시)
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",        // 로컬 네트워크 접근 가능 (192.168.x.x)
    port: 5173,             // 프론트엔드 개발 포트
    proxy: {
      "/api": {
        target: "http://192.168.123.107:8080", // ✅ Spring Boot 백엔드 주소
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
