import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jssInstance = useRef(null);

  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const loadSheet = async () => {
      try {
        // ----------------------------------
        // 📌 1) 게시판 정보 불러오기 (이름)
        // ----------------------------------
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        // ----------------------------------
        // 📌 2) 시트 데이터 불러오기
        // ----------------------------------
        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jssInstance.current = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [10, 30],
          defaultColWidth: 120,
          tableOverflow: true,
          tableHeight: "620px",

          filters: true,
          columnSorting: true,
          search: true,
          
          toolbar: true,   // ★ 기본 툴바 사용 (권장)

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

  const handleSave = async () => {
    if (!jssInstance.current) return;

    const jsonData = JSON.stringify(jssInstance.current.getJson());
    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패!");
      console.error(err);
    }
  };

  const handleExport = () => {
    if (jssInstance.current) jssInstance.current.download();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <button onClick={handleExport} style={styles.exportBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={styles.saveBtn}>저장하기</button>
      </div>

        <div className="jss-container">
        <div ref={sheetRef}></div>
        </div>
    </div>
  );
}

const styles = {
  saveBtn: {
    padding: "10px 16px",
    background: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  exportBtn: {
    padding: "10px 16px",
    background: "#2196f3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};
