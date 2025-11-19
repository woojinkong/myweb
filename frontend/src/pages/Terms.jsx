// src/pages/Terms.jsx
import React from "react";

export default function Terms() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>이용약관</h2>

      <div style={styles.box}>
        <p>본 약관은 KongHome 서비스 이용과 관련하여 필요한 사항을 규정합니다.</p>

        <h3>1. 목적</h3>
        <p>
          이 약관은 KongHome(이하 “서비스”)의 이용조건 및 절차, 이용자와
          서비스 제공자의 권리·의무 등을 규정함을 목적으로 합니다.
        </p>

        <h3>2. 회원의 의무</h3>
        <p>
          회원은 서비스 이용 시 관련 법령과 약관을 준수해야 하며,
          부정한 목적의 이용을 금합니다.
        </p>

        <h3>3. 서비스의 변경 및 중단</h3>
        <p>
          서비스 제공자는 필요한 경우 서비스를 변경하거나 종료할 수 있으며,
          중요한 변경 시 사전 공지합니다.
        </p>

        <h3>4. 기타</h3>
        <p>
          기타 명시되지 않은 규정은 관련 법령 및 일반적인 인터넷 관례를 따릅니다.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "80px auto", padding: "20px" },
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "20px" },
  box: { lineHeight: "1.7", fontSize: "15px" },
};
