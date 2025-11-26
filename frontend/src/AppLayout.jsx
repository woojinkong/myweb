import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import useIsMobile from "./hooks/useIsMobile";

export default function AppLayout({ children }) {
  
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); 
  // 모바일이면 false, PC면 true
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const closeSidebar = () => setIsSidebarOpen(false); // ⭐ 추가

  return (
    <div className="layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* ⭐ 모바일 + 사이드바 열림 상태에서만 표시되는 Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={styles.overlay}
        />
      )}

      <main
        className="main-content"
        style={{
          flex: 1,
          marginTop: "50px",
          padding: "10px",
          marginLeft: isMobile ? 0 : (isSidebarOpen ? "150px" : "50px"),
          width: isMobile
            ? "100%"
            : (isSidebarOpen ? "calc(100% - 150px)" : "calc(100% - 50px)"),
          transition: "all 0.3s ease",
          background: "#fff",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)", // 어두운 반투명 효과
    zIndex: 1500, // Sidebar 보다 아래, main 보다 위
  }
};
