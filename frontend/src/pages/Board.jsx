import { Link } from "react-router-dom";

export default function Board() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>📋 게시판 페이지</h1>
      <Link
        to="/board/write"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          background: "#4CAF50",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        ✏️ 글쓰기
      </Link>
    </div>
  );
}
