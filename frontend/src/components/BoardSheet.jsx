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

  // ⭐ 선택된 셀 내용 표시용 상태
  const [selectedText, setSelectedText] = useState("");

  // ---------------------------------------
  // A1 표기법 변환
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
  // 🔹 시트 로딩
  // ---------------------------------------
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : null;

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jss.current = jspreadsheet(sheetRef.current, {
          data: json?.data || [],
          style: json?.style || {},
          minDimensions: [10, 30],
          tableHeight: "620px",
          tableOverflow: true,
          filters: true,
          search: true,
          columnSorting: true,
          toolbar: true,

          // ⭐ 셀 선택될 때마다 텍스트 표시
          onselection: (instance, x1, y1) => {
            selectionRef.current = [[y1, x1]];
            const cellName = toCellName(x1, y1);
            const value = instance.getValue(cellName) ?? "";
            setSelectedText(value);
            },


          // ⭐ 셀 클릭 시에도 텍스트 업데이트
          onclick: (instance, cell, x, y) => {
            const cellName = toCellName(x, y);
            const value = instance.getValue(cellName) ?? "";
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
  // ⭐ 저장(data + style)
  // ---------------------------------------
  const handleSave = async () => {
    const data = jss.current.getJson();
    const style = jss.current.getStyle();

    const saveObj = { data, style };

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(saveObj), {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch {
      alert("저장 실패!");
    }
  };

  // ---------------------------------------
  // ⭐ 행/열 추가
  // ---------------------------------------
  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  // ---------------------------------------
  // ⭐ 배경색
  // ---------------------------------------
  const applyBgColor = (color) => {
    if (!jss.current) return;

    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      jss.current.setStyle(cell, "background-color", color);
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={toolbarStyle}>
        <button onClick={handleAddRow} style={blueBtn}>행 추가</button>
        <button onClick={handleAddCol} style={blueBtn}>열 추가</button>

        <button onClick={() => applyBgColor("#fff176")} style={colorBtn("#fff176")}>노랑</button>
        <button onClick={() => applyBgColor("#eeeeee")} style={colorBtn("#eeeeee")}>연회색</button>
        <button onClick={() => applyBgColor("#d0f8ce")} style={colorBtn("#d0f8ce")}>연초록</button>
        <button onClick={() => applyBgColor("#fff9c4")} style={colorBtn("#fff9c4")}>연노랑</button>
        <button onClick={() => applyBgColor("#ffe0b2")} style={colorBtn("#ffe0b2")}>연주황</button>

        <button onClick={() => jss.current?.download()} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={greenBtn}>저장</button>
      </div>

      {/* ⭐ 툴바 아래 셀 내용 표시 박스 */}
      <div style={selectedBoxStyle}>
        {selectedText ? selectedText : "선택된 셀 내용이 여기에 표시됩니다."}
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
  whiteSpace: "pre-wrap", // ⭐ 줄바꿈 유지
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
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const greenBtn = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "#fff",
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
