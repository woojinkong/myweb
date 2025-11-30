import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    nickName: "",
    userPwd: "",
    confirmPwd: "",
    userName: "",
    email: "",
    phone: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [idChecked, setIdChecked] = useState(false); // ✅ 아이디 중복확인 완료 여부

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // 🆕 약관 동의 상태
const [agreeAll, setAgreeAll] = useState(false);
const [agreeTerms, setAgreeTerms] = useState(false);
const [agreePrivacy, setAgreePrivacy] = useState(false);
const [modalOpen, setModalOpen] = useState(false);
const [modalContent, setModalContent] = useState("");
const [modalTitle, setModalTitle] = useState("");
const [sendingEmail, setSendingEmail] = useState(false);
const [nickNameChecked, setNickNameChecked] = useState(false);
const termsText = `
제1조 (목적)
본 약관은 KongHome(이하 “회사”)가 제공하는 인터넷 서비스(커뮤니티, 게시판, 정보 제공 등, 이하 “서비스”)의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (정의)

“서비스”란 회사가 제공하는 온라인 기반의 커뮤니티, 게시물 열람·작성, 정보 제공 등 일체의 기능을 의미합니다.

“이용자”란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.

“회원”이란 회사가 정한 절차에 따라 가입을 완료하고 서비스를 지속적으로 이용할 수 있는 자를 말합니다.

“게시물”이란 이용자가 서비스 내에 게시한 글, 댓글, 이미지, 링크, 메시지 등을 의미합니다.

제3조 (약관의 효력 및 변경)

본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.

회사는 관련 법령을 위반하지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 최소 7일 전 공지합니다.

제4조 (서비스의 제공 및 변경)

회사는 다음 서비스를 제공합니다.

부동산 관련 정보 제공

게시판 및 커뮤니티 서비스

회원 간 쪽지, 팔로우 기능

기타 회사가 정한 서비스

회사는 서비스 개선을 위해 일부 또는 전부를 변경할 수 있습니다.

제5조 (서비스의 중단)

회사는 시스템 점검, 장애, 통신 두절 등의 사유로 서비스 제공을 일시 중지할 수 있습니다.

회사의 고의 또는 중대한 과실이 없는 한 서비스 중단으로 발생한 손해에 대해 책임지지 않습니다.

제6조 (회원가입)

이용자는 회사가 정한 양식에 따라 정보를 입력하고 약관에 동의함으로써 회원가입을 신청합니다.

회사는 다음 사유가 있을 경우 가입을 승낙하지 않을 수 있습니다.

허위 정보 입력

타인의 명의를 도용한 경우

서비스 질서를 저해할 우려가 있다고 판단되는 경우

제7조 (회원탈퇴 및 자격상실)

회원은 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 처리합니다.

회사는 다음 사유가 있을 경우 회원 자격을 제한·정지 또는 상실시킬 수 있습니다.

불법정보 유포

욕설·비방·명예훼손 행위

스팸성 게시물, 광고 게시

타인의 권리를 침해하는 경우

제8조 (게시물의 저작권 및 활용)

이용자가 서비스에 게시한 게시물의 저작권은 원칙적으로 이용자에게 귀속됩니다.

이용자는 회사에 대해 서비스 운영, 홍보, 노출(검색, 공유 포함)을 위한 범위 내에서 게시물을 무상으로 사용할 수 있는 권리를 부여합니다.

이용자는 다음의 게시물을 게시해서는 안 됩니다.

타인의 권리를 침해하는 게시물

음란물, 폭력물, 불법정보

악성코드, 스팸 게시물

회사는 법령 또는 약관을 위반한 게시물을 사전 통지 없이 삭제할 수 있습니다.

제9조 (회사의 의무)

회사는 관련 법령에 따라 안정적인 서비스 제공을 위해 최선을 다합니다.

회사는 개인정보보호법 등 관련 법령을 준수합니다.

제10조 (이용자의 의무)
이용자는 다음 행위를 하여서는 안 됩니다.

타인의 정보 도용

서비스에 대한 해킹·시도

불법 게시물 작성

광고·홍보 목적의 대량 게시

서비스 운영을 저해하는 행위

제11조 (저작권 및 지적재산권)
회사 제공 콘텐츠의 저작권은 회사에 있으며 이용자는 이를 무단 복제·배포할 수 없습니다.

제12조 (분쟁 해결)

회사는 이용자의 편의를 위해 분쟁 처리 절차를 운영합니다.

회사와 이용자 간 분쟁은 대한민국 법령을 준거법으로 하며, 회사 소재지를 관할하는 법원을 전속 관할로 합니다.

제13조 (기타)
본 약관에서 정하지 않은 사항은 관련 법령 및 회사의 정책에 따릅니다.`;

const privacyText = `
제1조 (개인정보의 처리 목적)
회사는 다음 목적을 위해 최소한의 개인정보를 처리합니다.

회원가입 및 본인 확인

커뮤니티 서비스 제공

게시글·댓글 작성 기능 제공

알림, 쪽지, 팔로우 등 이용자 간 기능 제공

불법 이용 방지 및 이용자 보호

서비스 개선 및 보안 유지

민원 처리

제2조 (처리하는 개인정보 항목)

회원가입 시

필수: 아이디, 비밀번호, 닉네임, 이메일

서비스 이용 과정에서 자동 수집

IP 주소, 접속 로그, 기기 정보, 쿠키, 방문 기록

선택

프로필 이미지(업로드 시)

제3조 (개인정보의 보유 및 이용 기간)

회원탈퇴 시 즉시 파기

단, 법령에 따라 다음 기간 동안 보관

계약·청약철회·결제 기록: 5년

소비자 불만 처리 기록: 3년

접속 기록: 3개월 (통신비밀보호법)

제4조 (개인정보의 제3자 제공)
회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
다만 다음의 경우는 예외로 합니다.

이용자가 사전에 동의한 경우

법령에 의해 요구되는 경우

제5조 (개인정보 처리 위탁)
회사는 서비스 제공을 위해 다음 업체에 일부 업무를 위탁할 수 있습니다.

서버 및 데이터 보관: AWS (Amazon Web Services)

트래픽 처리 및 보안: Cloudflare (사용하는 경우)

검색엔진 노출 처리: Prerender.io (사용하는 경우)

기타 기술적 환경 제공을 위한 서비스 제공 업체

모든 위탁 업체는 개인정보보호법을 준수하도록 관리·감독합니다.

제6조 (정보주체 권리)
이용자는 언제든지 다음 권리를 행사할 수 있습니다.

개인정보 열람

정정·삭제 요청

처리정지 요청

회원탈퇴 요청

제7조 (개인정보 파기)

처리 목적 달성 시 즉시 파기합니다.

법령상 보관 의무가 있는 경우 별도 DB에 분리 보관합니다.

제8조 (개인정보의 안전성 확보조치)
회사는 개인정보 보호를 위해 다음 조치를 시행합니다.

기술적 조치

비밀번호 암호화

접근 통제

서버 보안 업데이트

관리적 조치

내부 관리지침 수립

운영자 교육

물리적 조치

서버 접근 권한 제한

제9조 (쿠키 사용 안내)
회사는 로그인 상태 유지, 사용자 경험 개선, 분석 목적 등으로 쿠키를 사용할 수 있습니다.
이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.

제10조 (개인정보 보호책임자)

이름: 공우진

직책: 운영자

이메일: dodejqn6@naver.com

제11조 (개정 고지)
개인정보처리방침은 개정 시 공지사항으로 안내합니다.
`;


  const handleAgreeAll = () => {
  const newValue = !agreeAll;
  setAgreeAll(newValue);
  setAgreeTerms(newValue);
  setAgreePrivacy(newValue);
};

  const handleAgreeTerms = () => {
  const newValue = !agreeTerms;
  setAgreeTerms(newValue);
  setAgreeAll(newValue && agreePrivacy);
};

const handleAgreePrivacy = () => {
  const newValue = !agreePrivacy;
  setAgreePrivacy(newValue);
  setAgreeAll(newValue && agreeTerms);
};



  // ✅ 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // ✅ 비밀번호 불일치 실시간 표시
    if ((name === "userPwd" || name === "confirmPwd") && form.confirmPwd) {
      if (name === "confirmPwd" && value !== form.userPwd) {
        setError("비밀번호가 일치하지 않습니다.");
      } else if (name === "userPwd" && form.confirmPwd !== value) {
        setError("비밀번호가 일치하지 않습니다.");
      } else {
        setError("");
      }
    }

    // ✅ 아이디 변경 시 중복확인 상태 초기화
    if (name === "userId") setIdChecked(false);
  };

  // ✅ 아이디 중복확인
  const handleCheckUserId = async () => {
    if (!form.userId.trim()) return alert("아이디를 입력해주세요!");

    try {
      const res = await axiosInstance.get(`/auth/check-id`, {
        params: { userId: form.userId },
      });

      if (res.data.exists) {
        alert("이미 사용 중인 아이디입니다.");
        setError("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다!");
        setError("");
        setIdChecked(true);
      }
    } catch (err) {
      console.error(err);
      alert("아이디 중복 확인 중 오류가 발생했습니다.");
    }
  };


  
  const handleCheckNickName = async () => {
  if (!form.nickName.trim()) return alert("닉네임을 입력해주세요!");

  try {
    const res = await axiosInstance.get("/user/check-nickName", {
      params: { nickName: form.nickName },
    });

    if (res.data.exists) {
      alert("이미 사용 중인 닉네임입니다.");
      setNickNameChecked(false);
    } else {
      alert("사용 가능한 닉네임입니다!");
      setNickNameChecked(true);
    }
  } catch (err) {
    console.error(err);
    alert("닉네임 중복 확인 중 오류가 발생했습니다.");
  }
};


  // ✅ 이메일 인증번호 전송
  const handleSendEmail = async () => {
    if (sendingEmail) return;       // 🔥 중복 클릭 방지
     setSendingEmail(true);
    if (!form.email) return alert("이메일을 입력해주세요!");
    if (!emailRegex.test(form.email)) return alert("올바른 이메일 형식이 아닙니다!");

    try {
      const res = await axiosInstance.post("/auth/send-email-code", { email: form.email });
      if(res.data.success){
        setEmailSent(true);
      alert("인증번호가 이메일로 발송되었습니다!");
      }
    } catch (err) {
      console.error(err);

      // 🛑 이메일 중복일 경우 서버에서 409 반환
    if (err.response?.status === 409) {
      alert("이미 가입된 이메일입니다.");
      return;
    }


      alert("이메일 전송 중 오류가 발생했습니다.");
    }finally {
      setSendingEmail(false);    // 🔥 요청 종료 후 재활성화
   }
  };

  // ✅ 이메일 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) return alert("인증번호를 입력해주세요!");

    try {
      const res = await axiosInstance.post("/auth/verify-email-code", {
        email: form.email,
        code: verifyCode,
      });

      if (res.data.success) {
        setEmailVerified(true);
        alert("이메일 인증이 완료되었습니다!");
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("인증 확인 중 오류가 발생했습니다.");
    }
  };

  // ✅ 회원가입 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(submitting) return;

    setSubmitting(true);

    setError("");
    setSuccess("");

    if (!idChecked) return setError("아이디 중복확인을 해주세요.");
    if (!emailRegex.test(form.email)) return setError("올바른 이메일 형식이 아닙니다.");
    if (form.userPwd !== form.confirmPwd)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!emailVerified)
      return setError("이메일 인증을 완료해야 회원가입이 가능합니다.");

    try {
      const res = await axiosInstance.post("/auth/signup", form);
      if (res.status === 200) {
        setSuccess("회원가입이 완료되었습니다!");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      if (err.response?.data?.message)
        setError(err.response.data.message);
      else setError("회원가입 중 오류가 발생했습니다.");
    }
  };

  // ✅ 모든 조건 충족 시 버튼 활성화
  const isFormValid =
    idChecked &&
    nickNameChecked &&       // ⭐ 추가
    form.userId &&
    form.userPwd &&
    form.confirmPwd &&
    form.userName &&
    form.nickName &&         // ⭐ 추가
    emailVerified &&
    emailRegex.test(form.email) &&
    form.userPwd === form.confirmPwd &&
    agreeTerms &&            // ★ 필수 추가
    agreePrivacy;            // ★ 필수 추가

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>회원가입</h2>
      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ✅ 아이디 입력 + 중복확인 */}
        <div style={styles.emailBox}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={form.userId}
            onChange={handleChange}
            required
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleCheckUserId}
            style={{
              ...styles.smallButton,
              backgroundColor: idChecked ? "#28a745" : "#007BFF",
            }}
          >
            {idChecked ? "사용가능" : "중복확인"}
          </button>
        </div>
        <input
          type="text"
          name="nickName"
          placeholder="닉네임"
          value={form.nickName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="button" onClick={handleCheckNickName}>중복확인</button>


        <input
          type="password"
          name="userPwd"
          placeholder="비밀번호"
          value={form.userPwd}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="confirmPwd"
          placeholder="비밀번호 확인"
          value={form.confirmPwd}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {form.userPwd && form.confirmPwd && form.userPwd !== form.confirmPwd && (
          <p style={styles.error}>비밀번호가 일치하지 않습니다.</p>
        )}

        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={form.userName}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {/* <input
          type="number"
          name="userAge"
          placeholder="나이"
          value={form.userAge}
          onChange={handleChange}
          style={styles.input}
        /> */}

        {/* ✅ 이메일 입력 + 인증 요청 */}
        <div style={styles.emailBox}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={emailVerified || sendingEmail}
            style={{
              ...styles.smallButton,
              backgroundColor: emailVerified ? "#28a745" : "#007BFF",
              opacity: emailVerified ? 0.8 : 1,
              cursor: (emailVerified || sendingEmail) ? "not-allowed" : "pointer",
            }}
          >
            {emailVerified ? "인증완료" : (sendingEmail ? "전송중..." : "인증요청")}
          </button>
        </div>

        {emailSent && !emailVerified && (
          <div style={styles.emailBox}>
            <input
              type="text"
              placeholder="인증번호 입력"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              style={{
                ...styles.smallButton,
                backgroundColor: "#007BFF",
              }}
            >
              인증확인
            </button>
          </div>
        )}

        <input
          type="text"
          name="phone"
          placeholder="핸드폰번호"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
        />

          {/* ================================ */}
          {/*   약관 동의 Section               */}
          {/* ================================ */}

          <div style={styles.agreeBox}>
            <h3 style={styles.agreeTitle}>약관 동의</h3>

            {/* 전체 동의 */}
            <label style={styles.checkboxRow}>
              <input type="checkbox" checked={agreeAll} onChange={handleAgreeAll} />
              전체 동의
            </label>

            <hr style={{ margin: "15px 0" }} />

            {/* 이용약관 */}
            <div style={styles.checkboxInnerRow}>
              <label>
                <input type="checkbox" checked={agreeTerms} onChange={handleAgreeTerms} />
                <span style={{ marginLeft: "6px" }}>* 이용약관 동의</span>
              </label>
              <button
                type="button"
                style={styles.viewBtn}
                onClick={() => {
                  setModalTitle("이용약관");
                  setModalContent(termsText);
                  setModalOpen(true);
                }}
              >
                내용보기
              </button>
            </div>

            {/* 개인정보 처리방침 */}
            <div style={styles.checkboxInnerRow}>
              <label>
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={handleAgreePrivacy}
                />
                <span style={{ marginLeft: "6px" }}>* 개인정보 처리방침 동의</span>
              </label>
              <button
                type="button"
                style={styles.viewBtn}
                onClick={() => {
                  setModalTitle("개인정보 처리방침");
                  setModalContent(privacyText);
                  setModalOpen(true);
                }}
              >
                내용보기
              </button>

            </div>

            <p style={styles.required}>* 표시는 필수 동의 항목입니다.</p>
          </div>


        <button
          type="submit"
          disabled={!isFormValid || submitting}
          style={{
            ...styles.button,
            backgroundColor: isFormValid ? "#4CAF50" : "#aaa",
            cursor: isFormValid ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "처리중..." : "회원가입"}
        </button>
      </form>
      {modalOpen && (
        <Modal
          title={modalTitle}
          content={modalContent}
          onClose={() => setModalOpen(false)}
        />
      )}

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "80px auto",
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  title: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  emailBox: { display: "flex", gap: "8px" },
  smallButton: {
    padding: "8px 10px",
    borderRadius: "5px",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    color: "white",
    border: "none",
  },
  error: { color: "red", marginTop: "5px", fontSize: "14px" },
  success: { color: "green", marginTop: "10px" },
  agreeBox: {
  border: "1px solid #ccc",
  padding: "20px",
  borderRadius: "8px",
  background: "#f9f9f9",
  marginTop: "20px",
  textAlign: "left",
},

agreeTitle: {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "15px",
},

checkboxRow: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "15px",
  marginBottom: "10px",
},

checkboxInnerRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  fontSize: "14px",
},

viewBtn: {
  fontSize: "12px",
  padding: "4px 8px",
  border: "1px solid #007bff",
  color: "#007bff",
  background: "white",
  borderRadius: "4px",
  cursor: "pointer",
},

required: {
  marginTop: "10px",
  fontSize: "13px",
  color: "red",
},

};
