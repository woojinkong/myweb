// src/pages/Privacy.jsx
import React from "react";

export default function Privacy() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>개인정보 처리방침</h2>

      <div style={styles.box}>

        <p>
          <strong>제1조 (개인정보의 처리 목적)</strong><br />
          회사는 다음 목적을 위해 최소한의 개인정보를 처리합니다.<br />
          - 회원가입 및 본인 확인<br />
          - 커뮤니티 서비스 제공<br />
          - 게시글·댓글 작성 기능 제공<br />
          - 알림, 쪽지, 팔로우 등 이용자 간 기능 제공<br />
          - 불법 이용 방지 및 이용자 보호<br />
          - 서비스 개선 및 보안 유지<br />
          - 민원 처리
        </p>

        <p>
          <strong>제2조 (처리하는 개인정보 항목)</strong><br />
          <u>회원가입 시 수집되는 항목</u><br />
          - 필수: 아이디, 비밀번호, 닉네임, 이메일<br /><br />

          <u>서비스 이용 과정에서 자동 수집되는 항목</u><br />
          - IP 주소, 접속 로그, 기기 정보, 쿠키, 방문 기록<br /><br />

          <u>선택 항목</u><br />
          - 프로필 이미지(업로드 시)
        </p>

        <p>
          <strong>제3조 (개인정보의 보유 및 이용 기간)</strong><br />
          1. 회원탈퇴 시 즉시 파기합니다.<br /><br />

          2. 단, 법령에 따라 다음 기간 동안 보관할 수 있습니다.<br />
          - 계약·청약철회·결제 기록: 5년<br />
          - 소비자 불만 처리 기록: 3년<br />
          - 접속 기록: 3개월 (통신비밀보호법)
        </p>

        <p>
          <strong>제4조 (개인정보의 제3자 제공)</strong><br />
          회사는 원칙적으로 개인정보를 외부에 제공하지 않습니다.<br />
          다만 아래의 경우 예외로 합니다.<br />
          - 이용자가 사전에 동의한 경우<br />
          - 법령에 의해 요구되는 경우
        </p>

        <p>
          <strong>제5조 (개인정보 처리 위탁)</strong><br />
          회사는 서비스 제공을 위해 다음 업무를 위탁할 수 있습니다.<br /><br />

          - 서버 및 데이터 보관: AWS (Amazon Web Services)<br />
          - 트래픽 처리 및 보안: Cloudflare (사용하는 경우)<br />
          - 검색엔진 노출 처리: Prerender.io (사용하는 경우)<br />
          - 기타 기술적 환경 제공 업체<br /><br />

          모든 위탁 업체는 개인정보보호법을 준수하도록 관리·감독합니다.
        </p>

        <p>
          <strong>제6조 (정보주체의 권리)</strong><br />
          이용자는 언제든지 다음 권리를 행사할 수 있습니다.<br />
          - 개인정보 열람<br />
          - 정정·삭제 요청<br />
          - 처리정지 요청<br />
          - 회원탈퇴 요청
        </p>

        <p>
          <strong>제7조 (개인정보 파기)</strong><br />
          1. 처리 목적 달성 시 즉시 파기합니다.<br />
          2. 법령상 보관 의무가 있는 경우 별도 DB에 분리 보관합니다.
        </p>

        <p>
          <strong>제8조 (개인정보의 안전성 확보 조치)</strong><br />
          회사는 개인정보 보호를 위해 다음 조치를 시행합니다.<br /><br />

          <u>기술적 조치</u><br />
          - 비밀번호 암호화<br />
          - 접근 통제<br />
          - 서버 보안 업데이트<br /><br />

          <u>관리적 조치</u><br />
          - 내부 관리지침 수립<br />
          - 운영자 교육<br /><br />

          <u>물리적 조치</u><br />
          - 서버 접근 권한 제한
        </p>

        <p>
          <strong>제9조 (쿠키 사용 안내)</strong><br />
          회사는 로그인 상태 유지, 사용자 경험 개선, 분석 목적 등으로 쿠키를 사용할 수 있습니다.<br />
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
        </p>

        <p>
          <strong>제10조 (개인정보 보호책임자)</strong><br />
          - 이름: 공우진<br />
          - 직책: 운영자<br />
          - 이메일: dodejqn6@naver.com
        </p>

        <p>
          <strong>제11조 (개정 고지)</strong><br />
          개인정보처리방침은 개정 시 공지사항을 통해 안내합니다.
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "80px auto", padding: "20px" },
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "20px" },
  box: { lineHeight: "1.8", fontSize: "15px", whiteSpace: "pre-line" },
};
