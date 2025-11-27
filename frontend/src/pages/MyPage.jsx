import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import styles from "../styles/MyPage.module.css";
//되돌림


// 이미지 리사이즈 함수
function resizeImage(file, maxWidth = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = maxWidth / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.8 // 압축률
      );
    };
    img.src = URL.createObjectURL(file);
  });
}


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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const resized = await resizeImage(file, 800);
    setSelectedFile(resized);
    setPreview(URL.createObjectURL(resized));
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);

    try {
      await axiosInstance.post("/user/profile", formData);
      alert("프로필 저장 완료");
      window.location.reload();
    } catch (err) {
      alert("프로필 저장 실패");
    }
  };

  const handleSaveInfo = async () => {
    try {
      const res = await axiosInstance.put("/user/update", form);
      setUserInfo(res.data);
      alert("정보 수정 완료");
      setEditMode(false);
    } catch {
      alert("수정 실패");
    }
  };

  if (!userInfo) return <p>불러오는 중...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>내 정보</h2>

      <div className={styles.profileBox}>
        <img
          src={
            preview ||
            (userInfo.profileImage
              ? `${BASE_URL}${userInfo.profileImage}`
              : "/default_profile.png")
          }
          alt="프로필"
          className={styles.profileImg}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />

        <button className={styles.btn} onClick={handleSaveProfile}>
          프로필 저장
        </button>
      </div>

      <div className={styles.infoBox}>
        <p>
          <strong>아이디:</strong> {userInfo.userId}
        </p>

        <p>
          <strong>닉네임:</strong>
          {editMode ? (
            <input name="nickName" value={form.nickName} onChange={handleChange} />
          ) : (
            userInfo.nickName
          )}
        </p>

        <p>
          <strong>이름:</strong>
          {editMode ? (
            <input name="userName" value={form.userName} onChange={handleChange} />
          ) : (
            userInfo.userName
          )}
        </p>

        <p>
          <strong>이메일:</strong>
          {editMode ? (
            <input name="email" value={form.email} onChange={handleChange} />
          ) : (
            userInfo.email
          )}
        </p>

        <p>
          <strong>전화번호:</strong>
          {editMode ? (
            <input name="phone" value={form.phone} onChange={handleChange} />
          ) : (
            userInfo.phone
          )}
        </p>

        <p>
          <strong>현재 포인트:</strong>{" "}
          {userInfo.point?.toLocaleString()} P
        </p>

        <div className={styles.buttonBox}>
          {editMode ? (
            <button className={styles.btn} onClick={handleSaveInfo}>
              저장
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles.btnBlue}`}
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