import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

// ⭐ jspreadsheet import
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jss = useRef(null);

  const selectionRef = useRef([]);
  const [groupName, setGroupName] = useState("");
  const [selectedText, setSelectedText] = useState("");

  // ---------------------------------------
  // A1 표기 변환
  // ---------------------------------------
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let colName = "";

    while (col >= 0) {
      colName = letters[col % 26] + colName;
      col = Math.floor(col / 26) - 1;
    }
    return colName + (row + 1);
  };

  // ---------------------------------------
  // 시트 로딩
  // ---------------------------------------
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : null;

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        const colWidths = json?.columnWidth || [];
        const rowHeights = json?.rowHeight || [];

        jss.current = jspreadsheet(sheetRef.current, {
          data: json?.data || [],
          style: json?.style || {},

          columns: colWidths.map((w) => ({ width: w })),
          rows: rowHeights.reduce((acc, h, i) => {
            acc[i] = { height: h };
            return acc;
          }, {}),

          minDimensions: [10, 30],
          tableHeight: "620px",
          tableOverflow: true,
          filters: true,
          search: true,
          columnSorting: true,
          rowResize: true,
          toolbar: true,

          // ⭐ 드래그된 영역을 selectionRef에 저장
          onselection: (instance, x1, y1, x2, y2) => {
            const selected = [];
            for (let r = y1; r <= y2; r++) {
              for (let c = x1; c <= x2; c++) {
                selected.push([r, c]);
              }
            }
            selectionRef.current = selected;

            const firstCell = toCellName(x1, y1);
            const value = jss.current.getValue(firstCell) ?? "";
            setSelectedText(value);
          },

          onclick: (instance, cell, x, y) => {
            const cellName = toCellName(x, y);
            const value = jss.current.getValue(cellName) ?? "";
            setSelectedText(value);
          },
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // ---------------------------------------
  // 저장
  // ---------------------------------------
  const handleSave = async () => {
    const data = jss.current.getJson();
    const style = jss.current.getStyle();
    const columnWidth = jss.current.getWidth();
    const rowHeight = jss.current.getHeight();

    const saveObj = { data, style, columnWidth, rowHeight };

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(saveObj), {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패!", err);
    }
  };

  // ---------------------------------------
  // 배경색 적용 (드래그 영역 포함)
  // ---------------------------------------
  const applyBgColor = (color) => {
    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      jss.current.setStyle(cell, "background-color", color);
    });
  };

  // ---------------------------------------
  // Bold 토글
  // ---------------------------------------
  const toggleBold = () => {
    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      const current = jss.current.getStyle(cell)?.["font-weight"];
      const newWeight = current === "bold" ? "normal" : "bold";
      jss.current.setStyle(cell, "font-weight", newWeight);
    });
  };

  // ---------------------------------------
  // 글씨 크기 변경
  // ---------------------------------------
  const applyFontSize = (size) => {
    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      jss.current.setStyle(cell, "font-size", size + "px");
    });
  };

  // ---------------------------------------
  // 행/열 추가
  // ---------------------------------------
  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      {/* ⭐ 커스텀 툴바 */}
      <div style={toolbarStyle}>
        <button onClick={handleAddRow} style={blueBtn}>행 추가</button>
        <button onClick={handleAddCol} style={blueBtn}>열 추가</button>

        {/* 색상 */}
        <button onClick={() => applyBgColor("#fff176")} style={colorBtn("#fff176")}>노랑</button>
        <button onClick={() => applyBgColor("#eeeeee")} style={colorBtn("#eeeeee")}>연회색</button>
        <button onClick={() => applyBgColor("#d0f8ce")} style={colorBtn("#d0f8ce")}>연초록</button>
        <button onClick={() => applyBgColor("#fff9c4")} style={colorBtn("#fff9c4")}>연노랑</button>
        <button onClick={() => applyBgColor("#ffe0b2")} style={colorBtn("#ffe0b2")}>연주황</button>

        {/* 추가 요청 색상 */}
        <button onClick={() => applyBgColor("#ffb74d")} style={colorBtn("#ffb74d")}>주황</button>
        <button onClick={() => applyBgColor("#ff8a80")} style={colorBtn("#ff8a80")}>빨강</button>

        {/* 글자 스타일 */}
        <button onClick={toggleBold} style={blueBtn}>Bold</button>

        <select onChange={(e) => applyFontSize(e.target.value)} style={fontSelectStyle}>
          <option value="">글씨 크기</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
        </select>

        {/* 다운로드 & 저장 */}
        <button onClick={() => jss.current?.download()} style={blueBtn}>엑셀</button>
        <button onClick={handleSave} style={greenBtn}>저장</button>
      </div>

      {/* 선택된 셀 내용 */}
      <div style={selectedBoxStyle}>
        {selectedText || "선택된 셀 내용이 여기에 표시됩니다."}
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// 스타일
// -----------------------------------------------------
const selectedBoxStyle = {
  margin: "10px 0 20px 0",
  padding: "12px",
  minHeight: "70px",
  background: "#fafafa",
  border: "1px solid #ccc",
  borderRadius: "6px",
  whiteSpace: "pre-wrap",
  overflowY: "auto",
  maxHeight: "200px",
  fontSize: "14px",
  lineHeight: "1.5",
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
  background: "#f5f5f5",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  flexWrap: "wrap",
};

const blueBtn = {
  padding: "6px 12px",
  background: "#2196f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const greenBtn = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const colorBtn = (bg) => ({
  padding: "6px 10px",
  background: bg,
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
});

const fontSelectStyle = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "white",
};
