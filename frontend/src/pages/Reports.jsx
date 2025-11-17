import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { cardBase, colors } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await axiosInstance.get("/board/report");
        setReports(res.data);
      } catch (err) {
        console.error("신고 목록 불러오기 실패:", err);
      }
    };
    loadReports();
  }, []);

  return (
    <div style={{ ...cardBase, maxWidth: "900px", margin: "60px auto", padding: "30px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "700", color: colors.text.main }}>
        🚨 신고된 게시글 목록
      </h2>

      {reports.length === 0 ? (
        <p style={{ color: "#666", marginTop: "20px" }}>신고된 글이 없습니다.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>게시글 제목</th>
              <th>신고자</th>
              <th>사유</th>
              <th>신고 시간</th>
              <th>보기</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.board?.title}</td>
                <td>{r.reporterId}</td>
                <td>{r.reason}</td>
                <td>{new Date(r.reportedAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => navigate(`/board/${r.board.boardNo}`)}
                    style={styles.viewBtn}
                  >
                    이동 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  viewBtn: {
    padding: "5px 8px",
    border: "1px solid #4CAF50",
    background: "white",
    color: "#4CAF50",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "12px",
  },
  th: {
    background: "#f2f2f2"
  }
};
