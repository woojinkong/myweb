import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Modal2 from "../components/Modal2";
import Terms from "./Terms";
import Privacy from "./Privacy";

export default function Signup() {
  const navigate = useNavigate();
  const [policyModal, setPolicyModal] = useState(null); 
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
const [sendingEmail, setSendingEmail] = useState(false);
const [nickNameChecked, setNickNameChecked] = useState(false);



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
                onClick={() => setPolicyModal("terms")}
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
                onClick={() => setPolicyModal("privacy")}
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
      {policyModal && (
        <Modal2
          title={policyModal === "terms" ? "이용약관" : "개인정보 처리방침"}
          onClose={() => setPolicyModal(null)}
        >
          {policyModal === "terms" && <Terms />}
          {policyModal === "privacy" && <Privacy />}
        </Modal2>
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
