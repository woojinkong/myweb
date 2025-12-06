import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const [jss, setJss] = useState(null);

  // ================================
  // 🔥 시트 데이터 로드
  // ================================
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData
          ? JSON.parse(res.data.sheetData)
          : [];

        // 기존 DOM 제거 (중복 초기화 방지)
        if (sheetRef.current) {
          sheetRef.current.innerHTML = "";
        }

        // 시트 초기화
        const instance = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [6, 30],
          allowInsertColumn: true,
          allowInsertRow: true,
          allowDeleteColumn: true,
          allowDeleteRow: true,
          tableHeight: "600px",
          tableOverflow: true,
        });

        setJss(instance);
      } catch (e) {
        console.error("시트 불러오기 오류:", e);
      }
    };

    loadSheet();
  }, [groupId]);

  // ================================
  // 🔥 저장
  // ================================
  const handleSave = async () => {
    if (!jss) return;

    const jsonData = JSON.stringify(jss.getData());


    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장되었습니다!");
    } catch (e) {
      alert("저장 실패");
      console.error(e);
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
          marginBottom: "10px",
          borderRadius: "6px",
        }}
      >
        저장하기
      </button>

      <div ref={sheetRef}></div>
    </div>
  );
}
