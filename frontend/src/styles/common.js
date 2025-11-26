// src/styles/common.js

// 🎨 색상 팔레트
export const colors = {
  primary: "#4CAF50",
  secondary: "#007BFF",
  danger: "#DC3545",
  warning: "#FFC107",
  success: "#28A745",

  text: {
    main: "#333",
    sub: "#555",
    light: "#888",
  },

  background: {
    page: "#f9f9f9",
    card: "#fff",
    input: "#fafafa",
    editor: "#ffffff",
  },
};

// 🌫 그림자 스타일
export const shadows = {
  soft: "0 2px 6px rgba(0,0,0,0.05)",
  medium: "0 4px 12px rgba(0,0,0,0.12)",
  hover: "0 6px 16px rgba(0,0,0,0.18)",
};

// 🧱 테두리 둥글기
export const radius = {
  small: "6px",
  medium: "10px",
  large: "12px",
  round: "50%",
};

// ✏ 텍스트 스타일
export const textStyles = {
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: colors.text.main,
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: colors.text.sub,
  },
  body: {
    fontSize: "15px",
    fontWeight: "400",
    color: colors.text.main,
  },
  small: {
    fontSize: "13px",
    color: colors.text.light,
  },
};

// 🧩 버튼 기본 속성
export const buttonBase = {
  border: "none",
  borderRadius: radius.medium,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.15s ease",
};

// 🟢 버튼 스타일 모음
export const buttons = {
  primary: {
    ...buttonBase,
    background: colors.primary,
    color: "#fff",
    ":hover": {
      background: "#3e9a45",
    },
  },
  secondary: {
    ...buttonBase,
    background: colors.secondary,
    color: "#fff",
    ":hover": {
      background: "#0069d9",
    },
  },
  outline: {
    ...buttonBase,
    background: "transparent",
    border: `1px solid ${colors.primary}`,
    color: colors.primary,
    ":hover": {
      background: "rgba(76,175,80,0.1)",
    },
  },
  danger: {
    ...buttonBase,
    background: colors.danger,
    color: "#fff",
    ":hover": {
      background: "#c82333",
    },
  },
};

// 📦 카드 스타일
export const cardBase = {
  background: colors.background.card,
  borderRadius: radius.medium,
  boxShadow: shadows.soft,
  padding: "20px",
  transition: "all 0.2s ease",
};

// 📦 카드 hover 버전
export const cardHover = {
  ...cardBase,
  ":hover": {
    boxShadow: shadows.hover,
    transform: "translateY(-3px)",
  },
};

// ✏️ TipTap 에디터 스타일
export const editorStyles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: radius.medium,
    padding: "12px",
    minHeight: "300px",
    background: colors.background.editor,
  },
  content: {
    fontSize: "16px",
    color: colors.text.main,
    lineHeight: "1.6",
    overflowWrap: "break-word",
  },
};



