import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiFileText, FiX } from "react-icons/fi";
import SendMessageModal from "./SendMessageModal"; // ✅ 쪽지 모달
import { useNavigate } from "react-router-dom";


export default function UserProfilePopup({ userId, onClose, position }) {
  const popupRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();


  // ✅ 외부 클릭 시 닫기
  // ✅ 외부 클릭 시 닫기 (단, 쪽지 모달이나 오버레이 클릭은 무시)
useEffect(() => {
  const handleClickOutside = (e) => {
    // 쪽지 모달이 열려 있으면 닫기 무시
    if (showMessageModal) {
      // 모달 영역이나 오버레이 클릭 시 닫히지 않게
      const modal = document.querySelector(".send-message-modal");
      if (modal && modal.contains(e.target)) return;
      const overlay = document.querySelector(".send-message-overlay");
      if (overlay && overlay.contains(e.target)) return;
      return; // 🔥 완전 차단
    }

    // 팝업 외부 클릭 시 닫기
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [onClose, showMessageModal]);

  // ✅ 유저 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/user/info/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };
    fetchUser();
  }, [userId]);

  if (!profile)
    return (
      <div style={styles.loadingBox}>
        ⏳ 유저 정보 불러오는 중...
      </div>
    );

  return (
    <>
      <div ref={popupRef} 
      style={{
        ...styles.popup,
        top: position.y + 10,  // 클릭 지점 아래로 살짝
        left: position.x + 10, // 클릭 지점 오른쪽으로 살짝
      }}>
        <button onClick={onClose} style={styles.closeBtn}>
          <FiX />
        </button>

        <div style={styles.header}>
          <img
            src={
              profile.profileImage
                ? profile.profileImage.startsWith("http")
                  ? profile.profileImage
                  : `${BASE_URL}${profile.profileImage}`
                : "/images/default_profile.png"
            }
            alt="프로필"
            style={styles.profileImage}
          />
          <div>
            <h3 style={styles.name}>{profile.nickName}</h3> {/* ✅ 아이디 표시 */}
            <p style={styles.role}>
              {profile.role === "ADMIN" ? "관리자" : "일반 회원"}
            </p>
          </div>
        </div>

        {/* <div style={styles.infoBox}>
          <p>
            <strong>이름:</strong> {profile.userName}
          </p>
          <p>
            <strong>이메일:</strong> {profile.email || "비공개"}
          </p>
        </div> */}

        <div style={styles.buttons}>
          <button
            style={styles.actionBtn}
            onClick={() => setShowMessageModal(true)}
          >
            <FiMail /> 쪽지 보내기
          </button>
          <button
            style={styles.actionBtn}
            onClick={() =>
              navigate(`/board/search?type=userId&keyword=${profile.userId}`)
            }
          >
            <FiFileText /> 작성글 보기
          </button>
        </div>
      </div>

      {/* ✅ 쪽지 모달 */}
      {showMessageModal && (
        <SendMessageModal
          receiverId={profile.userId}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </>
  );
}

const styles = {
  popup: {
    position: "fixed",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  padding: "20px",
  width: "280px",
  zIndex: 9999,
  },
  closeBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  profileImage: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ddd",
  },
  name: {
    fontSize: "17px",
    margin: 0,
    fontWeight: "600",
  },
  role: {
    fontSize: "13px",
    color: "#888",
    marginTop: "2px",
  },
  infoBox: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "16px",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px",
    borderRadius: "6px",
    background: "#f5f5f5",
    border: "1px solid #ddd",
    cursor: "pointer",
    fontSize: "14px",
  },
  loadingBox: {
    position: "absolute",
    top: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    fontSize: "14px",
  },
};
