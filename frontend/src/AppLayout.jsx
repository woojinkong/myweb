import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import useIsMobile from "./hooks/useIsMobile";

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

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

      <main
        className="main-content"
        style={{
          flex: 1,
          marginTop: "60px",
          padding: "20px",
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
