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
          search: false,
          columnSorting: true,
          rowResize: true,
          toolbar: true,
          transition: "0.15s",


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
      {/* 제목 + 검색 */}
        <div style={headerRow}>
        <h2 style={{ margin: 0 }}>📄 {groupName || "시트"}</h2>

        <input
            type="text"
            placeholder="검색어 입력"
            onChange={(e) => jss.current?.search(e.target.value)}
            style={searchInputStyle}
        />
        </div>


      {/* ⭐ 새 툴바 */}
        <div style={toolbarWrapper}>
        {/* 왼쪽: 구조 편집 */}
        <div style={toolbarGroup}>
            <button onClick={handleAddRow} style={toolbarBtn}>＋ 행</button>
            <button onClick={handleAddCol} style={toolbarBtn}>＋ 열</button>
        </div>

         {/* 가운데: 색상 팔레트 */}
            <div style={toolbarGroup}>
                {/* 색상 팔레트 (더 세련됨) */}
                {[
                "#fff176", "#eeeeee", "#d0f8ce", "#fff9c4", "#ffe0b2",
                "#ffb74d", "#ff8a80"
                ].map((c) => (
                <div
                    key={c}
                    onClick={() => applyBgColor(c)}
                    style={{ ...colorDot, background: c }}
                ></div>
                ))}
            </div>
    

        {/* 오른쪽: 폰트 옵션 */}
        <div style={toolbarGroup}>
            <button onClick={toggleBold} style={toolbarBtn}>B</button>

            <select onChange={(e) => applyFontSize(e.target.value)} style={fontSelect}>
            <option value="">크기</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            </select>

            <button onClick={() => jss.current?.download()} style={toolbarBtn}>⤵</button>
            <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
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


// ▣ 툴바 최상위 컨테이너 (전체 라인 디자인)
const toolbarWrapper = {
  position: "sticky",
  top: "0",
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  background: "#ffffff",
  border: "1px solid #ddd",
  borderRadius: "10px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  marginBottom: "14px",
};


// ▣ 툴바 그룹 (좌/중/우 영역)
const toolbarGroup = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

// ▣ 기본 툴바 버튼
const toolbarBtn = {
  padding: "6px 10px",
  background: "#f3f3f3",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  transition: "0.15s",
};

toolbarBtn[':hover'] = {
  background: "#e9e9e9"
};


const saveBtn = {
  ...toolbarBtn,
  background: "#4caf50",
  color: "white",
  border: "none",
};

// ▣ 색상 팔레트 Dot (컬러칩)
const colorDot = {
  width: "20px",
  height: "20px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  cursor: "pointer",
};

// ▣ 폰트 크기 선택
const fontSelect = {
  padding: "5px 8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "14px",
};

const searchInputStyle = {
  padding: "6px 12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "220px",
  fontSize: "14px",
  background: "#fafafa",
};
