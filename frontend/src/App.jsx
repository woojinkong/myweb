// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import NotificationPage from "./pages/NotificationPage";
import FindPassword from "./pages/FindPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBoardGroups from "./pages/AdminBoardGroups";
import AdminReports from "./pages/Reports";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import "./styles/Common.css";
import InBox from "./pages/InBox";
import Outbox from "./pages/Outbox";
import AppLayout from "./AppLayout";
import AdminAdSetting from "./pages/AdminAdSetting";
import AdminIpBlock from "./pages/AdminIpBlock";
import UserCommentList from "./pages/UserCommentList";
import BoardSheet from "./components/BoardSheet";

//라우터만담당
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/find-password" element={<FindPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🧾 게시판 관련 */}
              <Route
                path="/board"
                element={
                    <BoardList />
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
                    <BoardDetail />
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
                path="/board/search"
                element={
                    <BoardSearch />
                }
              />

              <Route
                path="/terms"
                element={
                    <Terms/>
                }
              />
              <Route
                path="/privacy"
                element={
                    <Privacy />
                }
              />
              <Route
                path="/contact"
                element={
                    <Contact />
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

              {/* ✉️ 쪽지함 */}
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <InBox />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/outbox"
                element={
                  <ProtectedRoute>
                    <Outbox />
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
              <Route
                path="/comments/user"
                element={
                  <UserCommentList />
                }
              />
               {/* 시트 기능*/}
              <Route
                path="/sheet/:groupId"
                element={
                  <BoardSheet />
                }
              />

              {/* 👑 관리자용 */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/board-groups"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminBoardGroups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/adsetting"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminAdSetting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ip-block"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminIpBlock />
                  </ProtectedRoute>
                }
              />
              
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;

