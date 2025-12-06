import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jss = useRef(null);
  const [groupName, setGroupName] = useState("");

  // 폰트 사이즈 상태 (UI용)
  const [fontSize, setFontSize] = useState("14");

  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jss.current = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [10, 30],
          defaultColWidth: 120,
          tableOverflow: true,
          tableHeight: "620px",
          filters: true,
          columnSorting: true,
          search: true,
          toolbar: true,
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  /* ======================================
     📌 셀 스타일 함수들
  ====================================== */

  const getSelectedCells = () => {
  if (!jss.current) return [];

  const sel = jss.current.highlighted; // v4 전용 선택 API

  // 선택이 없으면 []
  if (!sel || !sel.length) return [];

  // [ [row, col], ... ] 그대로 return
  return sel;
    };

  const setBold = () => {
  const cells = getSelectedCells();
  if (!cells.length) return;

  cells.forEach(([row, col]) => {
    jss.current.setStyle(row, col, "font-weight", "bold");
  });
};


  const changeTextColor = (color) => {
  const cells = getSelectedCells();
  if (!cells.length) return;

  cells.forEach(([row, col]) => {
    jss.current.setStyle(row, col, "color", color);
  });
};


  const changeBgColor = (color) => {
  const cells = getSelectedCells();
  if (!cells.length) return;

  cells.forEach(([row, col]) => {
    jss.current.setStyle(row, col, "background-color", color);
  });
};


  const changeFontSize = () => {
  const px = fontSize.trim();
  if (!px) return;

  const cells = getSelectedCells();
  if (!cells.length) return;

  cells.forEach(([row, col]) => {
    jss.current.setStyle(row, col, "font-size", `${px}px`);
  });
};



  

  const handleSave = async () => {
    if (!jss.current) return;

    const jsonData = JSON.stringify(jss.current.getJson());
    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch {
      alert("저장 실패!");
    }
  };

  const handleExport = () => {
    if (jss.current) jss.current.download();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      {/* =========================================
          📌 커스텀 툴바 UI
      ========================================== */}
      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={setBold}>Bold</button>

        {/* 글자색 */}
        <label style={labelStyle}>글자색</label>
        <input
          type="color"
          onChange={(e) => changeTextColor(e.target.value)}
          style={colorPickerStyle}
        />

        {/* 배경색 */}
        <label style={labelStyle}>배경색</label>
        <input
          type="color"
          onChange={(e) => changeBgColor(e.target.value)}
          style={colorPickerStyle}
        />

        {/* 폰트 사이즈 */}
        <label style={labelStyle}>폰트크기(px)</label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={numberInputStyle}
          min="8"
          max="40"
        />
        <button style={btnStyle} onClick={changeFontSize}>적용</button>

        <button onClick={handleExport} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={greenBtn}>저장</button>
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}


/* ===========================================
   스타일 선언
=========================================== */
const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
  background: "#f5f5f5",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px"
};

const btnStyle = {
  padding: "6px 10px",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer"
};

const labelStyle = {
  fontSize: "14px"
};

const colorPickerStyle = {
  width: "32px",
  height: "32px",
  border: "none",
  cursor: "pointer"
};

const numberInputStyle = {
  width: "60px",
  padding: "4px",
  border: "1px solid #ccc",
  borderRadius: "4px"
};

const blueBtn = {
  padding: "6px 12px",
  background: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const greenBtn = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
