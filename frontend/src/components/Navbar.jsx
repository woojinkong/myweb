import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUnreadCount } from "../api/notificationApi";
import { fetchSiteName } from "../api/siteApi";
import { fetchUnreadMessages } from "../api/messageApi"; // ✅ 추가
import { FiSearch, FiBell, FiLogIn, FiLogOut, FiUserPlus, FiMail } from "react-icons/fi";
import useIsMobile from "../hooks/useIsMobile";


//navbar수정
export default function Navbar({ isSidebarOpen,toggleSidebar }) {
  const { user, logout,loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("title");
  const [unreadCount, setUnreadCount] = useState(0); // 알림
  const [unreadMsgCount, setUnreadMsgCount] = useState(0); // ✅ 쪽지 개수
  const [siteTitle, setSiteTitle] = useState("KongHome");
  const API_BASE = import.meta.env.VITE_API_URL;
  const isMobile = useIsMobile();

      


    useEffect(() => {
    const loadSiteName = async () => {
    try {
      const name = await fetchSiteName();
      setSiteTitle(name);
    } catch (err) {
      console.error("사이트 이름 로드 실패:", err);
    }
  };
  loadSiteName();
}, []);

  // ✅ 알림 + 쪽지 읽지 않은 개수 불러오기
  useEffect(() => {


    //const token = Cookies.get("accessToken");
    if (!user) return;
    //if(loading) return;

   //if (!user || !user.userId || !token) return;

    
  const loadUnread = async () => {
    try {
      const [notiCount, msgCount] = await Promise.all([
        fetchUnreadCount(),
        fetchUnreadMessages(),
      ]);
      setUnreadCount(notiCount);
      setUnreadMsgCount(msgCount);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) return;
      console.error("알림/쪽지 개수 조회 실패:", err);
    }
  };

    setTimeout(() => {
    loadUnread();
  }, 300); // 로그인 직후 토큰 생성 시간 확보
  const interval = setInterval(loadUnread, 30000);
  return () => clearInterval(interval);

}, [user]);

 // 🔥 여기서 loading UI 출력
  if (loading) {
    return (
      <nav style={{
        height: "60px",
        background: "#fff",
        borderBottom: "1px solid #eee",
      }} />
    );
  }


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return alert("검색어를 입력하세요!");
    navigate(`/board/search?keyword=${keyword}&type=${type}`);
    setShowSearch(false);
    setKeyword("");
  };


  const getProfileSrc = (user) => {
  if (!user?.profileImage) return "/default_profile.png";

  if (user.profileImage.startsWith("http")) return user.profileImage;

  return `${API_BASE}${user.profileImage}`;
};

  

  return (
      <nav
      className="navbar-container"
      style={{
        ...styles.nav,
         padding: isMobile ? "0 10px" : "0 40px",
        justifyContent: isMobile ? "flex-start" : "space-between",
        left: isMobile ? 0 : (isSidebarOpen ? 150 : 50),
        transition: isMobile ? "none" : "left 0.3s ease",
        width: "100%",
      }}
    >
      {isMobile && (
        <button onClick={(e)=>{
          toggleSidebar();
        }} 
        style={{
          fontSize: "22px",
          marginLeft: "10px",      // 왼쪽에 딱 붙기
          marginRight: "10px",     // 로고와 간격만 약간
          padding: "0",
        }}>
          ☰
        </button>
      )}


      {/* 로고 */}
      <div className="logo" style={styles.logoBox}>
        <Link to="/" style={styles.logo}>
          {siteTitle}
        </Link>
      </div>

      {/* 메뉴 */}
      <div className="navbar-menu" style={{
        ...styles.menu,
        gap: isMobile ? "8px" : "16px",
        marginLeft: "auto",
      }}>
        {/* 🔍 검색 */}
        {showSearch ? (
          <form className="navbar-search-form" onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={styles.select}
            >
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="userId">작성자</option>
            </select>
            <input
              type="text"
              placeholder="검색어 입력..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.iconButton}>
              <FiSearch />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              style={styles.iconButton}
            >
              ✖
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            style={styles.iconButton}
            title="검색"
          >
            <FiSearch />
          </button>
        )}

        {/* 🔔 알림 */}
        {user && (
          <div
            style={styles.notificationBox}
            onClick={() => navigate("/notifications")}
            title="알림"
          >
            <FiBell style={styles.iconBase} />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </div>
        )}

        {/* 📬 쪽지함 */}
        {user && (
          <div
            style={styles.notificationBox}
            onClick={() => navigate("inbox")}
            title="쪽지함"
          >
            <FiMail style={styles.iconBase} />
            {unreadMsgCount > 0 && (
              <span style={{ ...styles.badge, background: "orange" }}>
                {unreadMsgCount}
              </span>
            )}
          </div>
        )}

        {/* 👤 로그인 상태별 */}
        {user ? (
          <>
            {/* 👑 관리자 */}
            {user.role === "ADMIN" && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                style={styles.adminButton}
                title="관리자 페이지"
              >
                ⚙️
              </button>
            )}

            {/* 🧍 프로필 사진 */}
            <button
              onClick={() => navigate("/mypage")}
              style={styles.profileButton}
              title="내 정보"
            >
              <img
                src={getProfileSrc(user)}
                alt="프로필"
                style={styles.profileImage}
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith("/default_profile.png")) {
                    e.currentTarget.src = "/default_profile.png";
                  }
                }}
              />

            </button>

            {/* 🚪 로그아웃 */}
            <button onClick={logout} style={styles.iconButton} title="로그아웃">
              <FiLogOut />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.iconButton} title="로그인">
              <FiLogIn />
            </Link>
            <Link to="/signup" style={styles.iconButton} title="회원가입">
              <FiUserPlus />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    top: 0,
    height: "60px",
    background: "#ffffff",
    borderBottom: "1px solid #eee",
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    zIndex: 1900,
    transition: "left 0.3s ease, width 0.3s ease",
    boxSizing: "border-box",
  },
  logoBox: { display: "flex", alignItems: "center" },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    textDecoration: "none",
  },
  menu: { 
  display: "flex",
  alignItems: "center",   // ← 세로 정렬 통일
  gap: "16px",
  height: "60px",         // ← Navbar 높이에 맞춤 (중요)
},

  searchForm: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  padding: "6px 10px",
  borderRadius: "6px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  zIndex: 2000,
},
  select: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc" },
  input: {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "180px",
  },
  iconButton: {
  background: "transparent",
  border: "none",
  fontSize: "20px",
  color: "#444",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "60px",   // ★ Navbar와 동일
  padding: "0 4px", // 여백 최소화
},

  notificationBox: {
  position: "relative",
  fontSize: "20px",
  cursor: "pointer",
  height: "60px",           // ★ 네비바와 동일
  display: "flex",
  alignItems: "center",     // ★ 세로 중앙 정렬
  justifyContent: "center",
},

  badge: {
    position: "absolute",
    top: "-6px",
    right: "-10px",
    background: "red",
    color: "white",
    borderRadius: "50%",
    fontSize: "11px",
    padding: "2px 5px",
  },
  profileButton: {
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  height: "60px",              // ★ 동일 높이
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

  profileImage: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  adminButton: {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  height: "60px",          // ★ 모든 아이콘과 동일
  display: "flex",
  alignItems: "center",
  justifyContent:
   "center",
  padding: "0 4px",        // ★ 동일 여백 규칙
  fontSize: "20px",        // ★ 다른 아이콘과 완전히 동일
  color: "#ffbb00",        // ★ 관리자만 구분되는 색
},

  

};
