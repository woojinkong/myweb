import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { cardBase, colors } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  const loadReports = async (pageNo = 0) => {
    try {
      const res = await axiosInstance.get(`/board/report?page=${pageNo}&size=10`);

      setReports(res.data.reports);
      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("신고 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadReports(0);
  }, []);

  return (
    <div style={{ ...cardBase, maxWidth: "900px", margin: "60px auto", padding: "30px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "700", color: colors.text.main }}>
        🚨 신고된 게시글 목록
      </h2>

      {reports.length === 0 ? (
        <p style={{ color: "#666", marginTop: "20px" }}>신고된 글이 없습니다.</p>
      ) : (
        <>
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

          {/* ⭐ 페이징 UI 추가 ⭐ */}
          <div style={pagination.container}>
            <button
              disabled={page === 0}
              onClick={() => loadReports(page - 1)}
              style={pagination.btn}
            >
              이전
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => loadReports(idx)}
                style={{
                  ...pagination.btn,
                  fontWeight: page === idx ? "bold" : "normal",
                  background: page === idx ? "#007bff" : "#fff",
                  color: page === idx ? "#fff" : "#333",
                }}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={page + 1 === totalPages}
              onClick={() => loadReports(page + 1)}
              style={pagination.btn}
            >
              다음
            </button>
          </div>
        </>
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
};

const pagination = {
  container: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    marginTop: "20px",
  },
  btn: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  },
};
