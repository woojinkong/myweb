import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jssInstance = useRef(null);

  // ================================
  // 🔥 시트 데이터 로드
  // ================================
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const res = await axiosInstance.get(`/api/sheet/${groupId}`);
        const sheetJson = res.data.sheetData
          ? JSON.parse(res.data.sheetData)
          : [];

        // 새로 렌더링할 때 기존 시트 제거
        if (sheetRef.current) {
          sheetRef.current.innerHTML = "";
        }

        // ⭐ jspreadsheet 4.x 초기화 방식
        jssInstance.current = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [6, 30],
          tableOverflow: true,
          tableHeight: "600px",
          allowInsertColumn: true,
          allowInsertRow: true,
          allowDeleteColumn: true,
          allowDeleteRow: true,
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // ================================
  // 🔥 저장
  // ================================
  const handleSave = async () => {
    if (!jssInstance.current) return;

    const jsonData = JSON.stringify(jssInstance.current.getJson());

    try {
      await axiosInstance.post(`/api/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패!");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📄 시트 게시판</h2>

      <button
        onClick={handleSave}
        style={{
          padding: "10px 16px",
          background: "#4caf50",
          color: "#fff",
          border: "none",
          marginBottom: "12px",
          borderRadius: "6px",
        }}
      >
        저장하기
      </button>

      {/* ⭐ 시트가 생성될 div */}
      <div ref={sheetRef}></div>
    </div>
  );
}
