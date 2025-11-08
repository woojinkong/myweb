// src/styles/common.js

// 🎨 색상 팔레트
export const colors = {
  primary: "#4CAF50", // 메인 색상 (버튼, 포인트 등)
  secondary: "#007BFF", // 서브 색상 (링크, 강조)
  danger: "#DC3545", // 경고 / 삭제
  text: {
    main: "#333",
    sub: "#555",
    light: "#888",
  },
  background: {
    page: "#f9f9f9", // 전체 페이지 배경
    card: "#fff", // 카드/콘텐츠 배경
  },
};

// 🌫 그림자 효과
export const shadows = {
  soft: "0 2px 6px rgba(0,0,0,0.05)",
  medium: "0 4px 10px rgba(0,0,0,0.1)",
};

// 🧱 테두리 둥글기
export const radius = {
  small: "6px",
  medium: "10px",
  large: "12px",
};

// 🧩 버튼 기본 스타일
export const buttonBase = {
  border: "none",
  borderRadius: radius.medium,
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

// ✅ 버튼 변형 스타일
export const buttons = {
  primary: {
    ...buttonBase,
    background: colors.primary,
    color: "#fff",
  },
  secondary: {
    ...buttonBase,
    background: colors.secondary,
    color: "#fff",
  },
  outline: {
    ...buttonBase,
    background: "transparent",
    border: `1px solid ${colors.primary}`,
    color: colors.primary,
  },
  danger: {
    ...buttonBase,
    background: colors.danger,
    color: "#fff",
  },
};

// 📦 카드 공통 스타일
export const cardBase = {
  background: colors.background.card,
  borderRadius: radius.medium,
  boxShadow: shadows.soft,
  padding: "20px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};
