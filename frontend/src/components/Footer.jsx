// src/components/Footer.jsx
import React from "react";
import { colors } from "../styles/common";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <p style={styles.text}>© 2025 <strong>KongHome</strong>. All Rights Reserved.</p>
        <p style={styles.links}>
          <a href="/terms" style={styles.link}>이용약관</a> ·{" "}
          <a href="/privacy" style={styles.link}>개인정보처리방침</a> ·{" "}
          <a href="mailto:support@konghome.com" style={styles.link}>문의하기</a>
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: "100%",
    backgroundColor: "#fff", // ✅ 완전 흰색으로 변경
    borderTop: "none",       // ✅ 경계선 제거
    marginTop: "auto", // ✅ 항상 아래 고정
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  text: {
    fontSize: "14px",
    color: colors.text.sub,
    marginBottom: "8px",
  },
  links: {
    fontSize: "13px",
    color: colors.text.light,
  },
  link: {
    color: colors.secondary,
    textDecoration: "none",
  },
};
