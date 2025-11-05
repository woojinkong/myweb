import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: "180px",
      background: "#f4f4f4",
      height: "100%",
      padding: "20px 10px",
      boxSizing: "border-box",
      borderRight: "1px solid #ddd"
    }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ marginBottom: "15px" }}>
          <Link to="/board" style={{ textDecoration: "none", color: "#333", fontSize: "16px" }}>
            📋 게시판
          </Link>
        </li>
      </ul>
    </div>
  );
}
