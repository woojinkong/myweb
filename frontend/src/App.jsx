// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BoardList from "./pages/BoardList";
import BoardWrite from "./pages/BoardWrite";
import BoardDetail from "./pages/BoardDetail";
import BoardEdit from "./pages/BoardEdit";
import BoardSearch from "./pages/BoardSearch";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import MyPage from "./pages/MyPage";
import { useState } from "react";
import NotificationPage from "./pages/NotificationPage";
import Footer from "./components/Footer";
import FindPassword from "./pages/FindPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    // ✅ Router를 최상단에 두고 AuthProvider를 그 안으로 이동
    <Router>
      <AuthProvider>
        <div style={styles.layout}>
          <Navbar isSidebarOpen={isSidebarOpen} />
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          <main
            style={{
              ...styles.content,
              marginLeft: isSidebarOpen ? "200px" : "70px",
              width: isSidebarOpen ? "calc(100% - 200px)" : "calc(100% - 70px)",
            }}
          >
            <Routes>
              {/* 🏠 홈 */}
              <Route path="/" element={<Home />} />

              {/* 👤 인증 관련 */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/find-password" element={<FindPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🧾 게시판 관련 */}
              <Route
                path="/board"
                element={
                  <ProtectedRoute>
                    <BoardList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board/write"
                element={
                  <ProtectedRoute>
                    <BoardWrite />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board/:id"
                element={
                  <ProtectedRoute>
                    <BoardDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board/edit/:id"
                element={
                  <ProtectedRoute>
                    <BoardEdit />
                  </ProtectedRoute>
                }
              />

              {/* 🔍 검색 페이지 */}
              <Route
                path="/board/search"
                element={
                  <ProtectedRoute>
                    <BoardSearch />
                  </ProtectedRoute>
                }
              />

              {/* 🔔 알림페이지 */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />

              {/* 🙍 마이페이지 */}
              <Route
                path="/mypage"
                element={
                  <ProtectedRoute>
                    <MyPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* ✅ Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    marginTop: "60px",
    padding: "20px",
    background: "#fff",
    overflowY: "auto",
    overflowX: "hidden",
    transition: "margin-left 0.3s ease",
  },
};

export default App;
