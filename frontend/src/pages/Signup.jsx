import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    userPwd: "",
    confirmPwd: "",
    userName: "",
    userAge: "",
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

const termsText = `
제1조 (목적)
본 약관은 회사가 제공하는 인터넷 서비스(이하 “서비스”) 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. “서비스”란 회사가 제공하는 모든 온라인 서비스를 의미합니다.
2. “이용자”란 회사의 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
3. “회원”이란 회사에 개인정보를 제공하여 회원 등록을 하고, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.

제3조 (서비스의 제공 및 변경)
1. 회사는 다음 서비스를 제공합니다.
   - 게시판 서비스
   - 회원제 서비스
   - 기타 회사가 정하는 서비스
2. 회사는 서비스 변경이 필요한 경우 변경 내용을 사전에 공지합니다.

제4조 (서비스의 중단)
1. 회사는 시스템 점검, 고장, 통신 두절 등의 사유로 서비스 제공을 일시 중단할 수 있습니다.
2. 서비스 중단으로 인한 손해에 대해 회사는 책임을 지지 않습니다.

제5조 (회원가입)
1. 이용자는 회사가 정한 가입 양식에 따라 정보를 입력하고 약관에 동의함으로써 회원가입을 신청합니다.
2. 회사는 회원가입 신청이 아래의 조건을 위반하지 않을 경우 승낙합니다.

제6조 (회원탈퇴 및 자격상실)
1. 회원은 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 처리합니다.
2. 회원이 다음 사유에 해당할 경우 회사는 회원 자격을 제한 또는 정지시킬 수 있습니다.

제7조 (개인정보보호)
회사는 관련 법령에 따라 개인정보처리방침을 별도로 수립하여 운영합니다.

제8조 (회사의 의무)
1. 회사는 법령과 본 약관에 따라 서비스 제공에 최선을 다합니다.
2. 회사는 이용자가 안전하게 서비스를 사용할 수 있도록 개인정보 보호를 위한 보안 시스템을 갖추고 있습니다.

제9조 (이용자의 의무)
이용자는 다음 행위를 해서는 안 됩니다.
1. 허위 정보 등록
2. 타인의 정보 도용
3. 회사 정보의 임의 변경
4. 회사가 허용하지 않은 정보 게시
5. 회사 및 제3자의 지적재산권 침해
6. 명예훼손 및 업무 방해
7. 음란하거나 폭력적인 정보 게시 등 불법 정보 공유

제10조 (저작권)
1. 회사가 제공한 콘텐츠의 저작권은 회사에 귀속됩니다.
2. 이용자는 회사의 사전 승낙 없이 콘텐츠를 영리 목적으로 사용할 수 없습니다.

제11조 (분쟁 해결)
1. 회사는 이용자의 의견을 반영하고 문제를 해결하기 위한 기구를 운영합니다.
2. 회사와 이용자 간의 분쟁은 이용자의 주소지를 관할하는 법원의 전속 관할로 합니다.

제12조 (준거법)
본 약관은 대한민국 법령의 적용을 받습니다.`;

const privacyText = `
제1조 (개인정보의 처리 목적)
회사는 다음의 목적으로 개인정보를 처리하며, 목적 외 사용 시 별도의 동의를 받습니다.
1. 회원가입 및 관리: 본인 확인, 회원제 서비스 제공, 부정 이용 방지
2. 서비스 제공: 콘텐츠 제공, 맞춤 서비스 제공, 본인 인증, 결제·정산
3. 민원 처리: 민원인의 신원확인, 사실조사, 처리 결과 통보

제2조 (개인정보 보유 기간)
회사는 관련 법령 또는 정보주체 동의에 따른 기간 동안 개인정보를 보유합니다.
1. 회원가입 및 관리: 회원 탈퇴 시까지
2. 서비스 제공: 서비스 공급 완료 및 요금 정산 시까지

제3조 (처리하는 개인정보 항목)
1. 회원가입 및 관리
   - 필수 항목: 이름, 아이디, 비밀번호, 이메일, 전화번호
2. 인터넷 서비스 이용 과정에서 생성될 수 있는 항목
   - IP, 쿠키, 방문 기록, 이용 기록 등

제4조 (개인정보의 제3자 제공)
회사는 법령에 따른 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.

제5조 (개인정보 처리 위탁)
회사는 개인정보 처리 업무를 외부에 위탁하지 않습니다.

제6조 (정보주체의 권리)
정보주체는 다음 권리를 행사할 수 있습니다.
1. 열람청구
2. 정정·삭제 요구
3. 처리정지 요구

제7조 (개인정보의 파기)
1. 보유 기간이 만료되거나 처리 목적이 달성된 경우 회사는 즉시 파기합니다.
2. 법령에 따라 계속 보존해야 하는 경우 별도 DB에 분리 보관합니다.

제8조 (개인정보 보호 조치)
회사는 다음 조치를 통해 개인정보 안전성을 확보합니다.
1. 관리적 조치: 내규 관리, 직원 교육
2. 기술적 조치: 접근통제, 암호화, 보안 프로그램 설치
3. 물리적 조치: 전산실·자료보관실 접근 통제

제9조 (개인정보 보호책임자)
- 성명: 공우진
- 직책: 관리자
- 연락처: dodejqn6@naver.com

제10조 (처리방침 변경)
본 개인정보처리방침은 개정 시 공지사항을 통해 사전 안내합니다.
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
    form.userId &&
    form.userPwd &&
    form.confirmPwd &&
    form.userName &&
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

        <input
          type="number"
          name="userAge"
          placeholder="나이"
          value={form.userAge}
          onChange={handleChange}
          style={styles.input}
        />

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
