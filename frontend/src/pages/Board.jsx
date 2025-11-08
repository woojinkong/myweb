import { Link } from "react-router-dom";
import { buttons, cardBase, colors } from "../styles/common";

export default function Board() {
  return (
    <div style={{ ...cardBase, maxWidth: "800px", margin: "40px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "700", color: colors.text.main }}>
        📋 게시판 페이지
      </h1>
      <Link to="/board/write" style={{ ...buttons.primary, display: "inline-block", marginTop: "20px" }}>
        ✏️ 글쓰기
      </Link>
    </div>
  );
}
