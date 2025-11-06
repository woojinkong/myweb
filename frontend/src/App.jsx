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
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import MyPage from "./pages/MyPage";
import { useState } from "react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AuthProvider>
      <Router>
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
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

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
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
    content: {
    flex: 1,
    marginTop: "60px", // ✅ Navbar 높이 반영 (fixed라 필수)
    padding: "20px",
    background: "#fff",
    overflowY: "auto",
    overflowX: "hidden",
    boxSizing: "border-box",
    transition: "margin-left 0.3s ease",
  },

};

export default App;
