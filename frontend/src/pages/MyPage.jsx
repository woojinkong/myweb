import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Cookies from "js-cookie";
//되돌림
export default function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get("/user/myinfo");
        setUserInfo(res.data);
        setForm(res.data);
        if (res.data.profileImage)
          setPreview(`${BASE_URL}${res.data.profileImage}`);
      } catch (err) {
        console.error("내 정보 불러오기 실패:", err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);

    try {
      await axiosInstance.post("/user/profile", formData, {
        withCredentials: true, // ✅ 쿠키 포함 (refresh token용)
        headers: { 
            "Content-Type": "multipart/form-data",
             
         },
      });
      alert("프로필이 수정되었습니다!");
      window.location.reload();
    } catch (err) {
      console.error("프로필 수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleSaveInfo = async () => {
  try {
    const res = await axiosInstance.put("/user/update", form);
    setUserInfo(res.data);   // ★ 최신 데이터 화면에 적용
    setForm(res.data);       // ★ input 값도 갱신
    alert("내 정보가 수정되었습니다!");
    setEditMode(false);
  } catch (err) {
    console.error("내 정보 수정 실패:", err);
    alert("수정 중 오류가 발생했습니다.");
  }
};


  if (!userInfo) return <p style={{ textAlign: "center" }}>⏳ 불러오는 중...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 내 정보</h2>

      <div style={styles.profileBox}>
        <img
          src={
            preview ||
            (userInfo.profileImage
              ? `${BASE_URL}${userInfo.profileImage}`
              : "https://via.placeholder.com/120?text=Profile")
          }
          alt="프로필"
          style={styles.profileImg}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button style={styles.saveBtn} onClick={handleSaveProfile}>
          프로필 저장
        </button>
      </div>

      <div style={styles.infoBox}>
        <p>
          <strong>아이디:</strong> {userInfo.userId}
        </p>
          <p>
          <strong>닉네임:</strong>{" "}
          {editMode ? (
            <input
              name="nickName"
              value={form.nickName || ""}
              onChange={handleChange}
            />
          ) : (
            userInfo.nickName
          )}
        </p>

        <p>
          <strong>이름:</strong>{" "}
          {editMode ? (
            <input
              name="userName"
              value={form.userName || ""}
              onChange={handleChange}
            />
          ) : (
            userInfo.userName
          )}
        </p>

        <p>
          <strong>이메일:</strong>{" "}
          {editMode ? (
            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
            />
          ) : (
            userInfo.email
          )}
        </p>

        <p>
          <strong>전화번호:</strong>{" "}
          {editMode ? (
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
            />
          ) : (
            userInfo.phone
          )}
        </p>
        <p>
          <strong>현재 포인트:</strong> 
          {userInfo.point?.toLocaleString()} P
        </p>


        <div style={styles.buttonBox}>
          {editMode ? (
            <button style={styles.saveBtn} onClick={handleSaveInfo}>
              저장
            </button>
          ) : (
            <button
              style={{ ...styles.saveBtn, background: "#2196F3" }}
              onClick={() => setEditMode(true)}
            >
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "60px auto",
    padding: "30px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  profileBox: {
    textAlign: "center",
    marginBottom: "30px",
  },
  profileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
  saveBtn: {
    marginTop: "10px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
  infoBox: {
    fontSize: "16px",
    lineHeight: "1.8",
  },
  buttonBox: {
    textAlign: "center",
    marginTop: "20px",
  },
};
