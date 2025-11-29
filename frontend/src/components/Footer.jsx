// src/components/Footer.jsx
import React from "react";
import { colors } from "../styles/common";
import { fetchSiteName } from "../api/siteApi";
import { useEffect, useState } from "react";
import { FiInstagram, FiBookOpen } from "react-icons/fi"; // 아이콘 추가

export default function Footer() {
  const [siteTitle, setSiteTitle] = useState("KongHome");

  useEffect(() => {
    const loadName = async () => {
      try {
        const name = await fetchSiteName();
        setSiteTitle(name);
      } catch (err) {
        console.error("사이트 이름 로드 실패:", err);
      }
    };
    loadName();
  }, []);

  return (
    <footer className="footer-container" style={styles.footer}>
      <div className="footer-inner" style={styles.inner}>
        <p style={styles.text}>
          © 2025 <strong>{siteTitle}</strong>. All Rights Reserved.
        </p>

        {/* 링크 + SNS */}
        <p style={styles.links}>
          <a href="/terms" style={styles.link}>이용약관</a> ·{" "}
          <a href="/privacy" style={styles.link}>개인정보처리방침</a> ·{" "}
          <a href="/contact" style={styles.link}>문의하기</a> ·{" "}

          {/* 인스타 */}
          <a
            href="https://www.instagram.com/kong_woojin"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            <FiInstagram style={styles.icon} /> 
          </a> ·{" "}

          {/* 네이버 블로그 */}
          <a
            href="https://blog.naver.com/wjit_studio"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            <FiBookOpen style={styles.icon} /> 
          </a>
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: "100%",
    backgroundColor: "#fff",
    borderTop: "none",
    marginTop: "auto",
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
    marginRight: "6px",
  },
  icon: {
    marginRight: "4px",
    verticalAlign: "middle",
  },
};
