// src/pages/Privacy.jsx
import React from "react";

export default function Privacy() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>개인정보 처리방침</h2>

      <div style={styles.box}>
        <p>
          KongHome은 이용자의 개인정보를 소중히 여기며,
          개인정보 보호법 등 관련 법령을 준수합니다.
        </p>

        <h3>1. 수집하는 개인정보 항목</h3>
        <p>- 필수 항목: 아이디, 비밀번호, 이메일</p>

        <h3>2. 개인정보의 이용 목적</h3>
        <p>- 회원 관리, 서비스 제공, 이용자 문의 응대 등</p>

        <h3>3. 개인정보의 보관 기간</h3>
        <p>
          원칙적으로 목적 달성 후 즉시 파기하며, 관련 법령에 의해
          일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
        </p>

        <h3>4. 개인정보 보호 책임자</h3>
        <p>- 이메일: support@konghome.com</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "80px auto", padding: "20px" },
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "20px" },
  box: { lineHeight: "1.7", fontSize: "15px" },
};
