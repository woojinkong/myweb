import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Board from "./pages/Board";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Navbar />
          <div style={{ display: "flex", flex: 1, marginTop: "50px" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "30px", background: "#fff", overflowY: "auto" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/board"
                  element={
                    <ProtectedRoute>
                      <Board />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
