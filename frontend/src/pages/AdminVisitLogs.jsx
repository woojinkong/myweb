import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { cardBase, colors } from "../styles/common";

export default function AdminVisitLogs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* ==========================
     🔐 관리자 접근 체크
  ========================== */
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  /* ==========================
     📊 방문 로그 로딩
  ========================== */
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await axiosInstance.get("/admin/visit-logs", {
          params: { page, size: 30 },
        });

        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("방문 로그 불러오기 실패:", err);
      }
    };
    loadLogs();
  }, [page]);

  /* ==========================
     📈 유입 경로 집계
  ========================== */
  const sourceStats = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      const key = log.sourceType || "ETC";
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [logs]);

  const totalCount = useMemo(
    () => Object.values(sourceStats).reduce((a, b) => a + b, 0),
    [sourceStats]
  );

  /* ==========================
     🎨 헬퍼
  ========================== */
  const getSourceColor = (source) => {
    const map = {
      NAVER: "#03c75a",
      GOOGLE: "#4285F4",
      DAUM: "#4682B4",
      SNS: "#E1306C",
      DIRECT: "#6c757d",
      ETC: "#999",
    };
    return map[source] || "#999";
  };

  const renderSourceBadge = (source) => (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "12px",
        color: "white",
        background: getSourceColor(source),
      }}
    >
      {source}
    </span>
  );

  /* ==========================
     🖥️ 렌더
  ========================== */
  return (
    <div style={{ ...cardBase, maxWidth: "1200px", margin: "60px auto" }}>
      <h2 style={{ marginBottom: "25px", color: colors.text.main }}>
        📊 방문자 유입 로그
      </h2>

      {/* ==========================
          📈 유입 비율 요약
      ========================== */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "10px",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>
          📈 유입 경로 비율 (현재 페이지 기준)
        </h3>

        {totalCount === 0 && (
          <p style={{ color: "#777" }}>데이터가 없습니다.</p>
        )}

        {Object.entries(sourceStats).map(([source, count]) => {
          const percent = ((count / totalCount) * 100).toFixed(1);

          return (
            <div key={source} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "13px",
                  marginBottom: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{source}</span>
                <span>
                  {count}명 ({percent}%)
                </span>
              </div>

              <div
                style={{
                  height: "10px",
                  background: "#e9ecef",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: getSourceColor(source),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================
          📋 방문 로그 테이블
      ========================== */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f1f3f5" }}>
            <th style={th}>시간</th>
            <th style={th}>유입</th>
            <th style={th}>유저 / IP</th>
            <th style={th}>접속 경로</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.visitId} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>
                {new Date(log.visitDate).toLocaleString()}
              </td>
              <td style={td}>{renderSourceBadge(log.sourceType)}</td>
              <td style={td}>
                {log.userId ? (
                  <>
                    <strong>{log.nickname}</strong>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      ({log.userId})
                    </div>
                  </>
                ) : (
                  <span style={{ color: "#999" }}>{log.ipAddress}</span>
                )}
              </td>
              <td style={td}>{log.visitPath}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==========================
          🔁 페이지네이션
      ========================== */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          style={pageBtn}
        >
          이전
        </button>
        <span style={{ margin: "0 12px" }}>
          {page + 1} / {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          style={pageBtn}
        >
          다음
        </button>
      </div>
    </div>
  );
}

/* ==========================
   💅 스타일
========================== */
const th = {
  padding: "12px",
  fontSize: "14px",
  textAlign: "left",
};

const td = {
  padding: "12px",
  fontSize: "14px",
};

const pageBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer",
};
