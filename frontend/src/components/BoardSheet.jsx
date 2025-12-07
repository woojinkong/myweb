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

  const selectionRef = useRef([]);
  const [groupName, setGroupName] = useState("");
  const [selectedText, setSelectedText] = useState("");

  /* -----------------------------------------------------
     A1 좌표 변환
  ----------------------------------------------------- */
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let colName = "";
    while (col >= 0) {
      colName = letters[col % 26] + colName;
      col = Math.floor(col / 26) - 1;
    }
    return colName + (row + 1);
  };

  /* -----------------------------------------------------
     IME 한국어 강제 적용
  ----------------------------------------------------- */
  const forceKoreanIME = (cell) => {
    const apply = () => {
      const input = cell.querySelector("input");
      if (!input) return;

      input.setAttribute("inputmode", "text");
      input.setAttribute("lang", "ko");
      input.setAttribute("autocapitalize", "off");
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("spellcheck", "false");

      input.style.imeMode = "active";

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
    setTimeout(apply, 5);
  };

  /* -----------------------------------------------------
     시트 로딩
  ----------------------------------------------------- */
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
          data: json?.data || [[]],                 // <-- 최소 Row 보정
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
          editable: true,
          textInput: true,

          /* -----------------------------------------------------
             로딩후 KeyDown 필터 (편집모드 진입 금지)
          ----------------------------------------------------- */
          onload: (instance) => {
            const target = instance.content;
            if (!target) return;

            target.addEventListener("keydown", (event) => {
              const editing = instance.edition;

              if (!editing) {
                const allowed = [
                  "F2",
                  "Enter",
                  "Tab",
                  "ArrowUp",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowRight",
                ];

                if (!allowed.includes(event.key)) {
                  event.preventDefault();
                  return false;
                }
              }
            });
          },

          /* -----------------------------------------------------
             편집 시작 시 IME 적용
          ----------------------------------------------------- */
          oneditstart: (_, cell) => forceKoreanIME(cell),
          oneditionstart: (_, cell) => forceKoreanIME(cell),

          /* -----------------------------------------------------
             셀 선택 이벤트 (안전장치 추가)
          ----------------------------------------------------- */
          onselection: (instance, x1, y1) => {
            if (!jss.current) return;
            if (x1 == null || y1 == null) return;

            const cellName = toCellName(x1, y1);
            const v = jss.current.getValue(cellName);
            setSelectedText(v ?? "");

            selectionRef.current = [[y1, x1]];
          },

          /* -----------------------------------------------------
             클릭 시 내용만 표시 (편집 금지)
          ----------------------------------------------------- */
          onclick: (instance, cell, x, y) => {
            if (!jss.current) return;
            const cellName = toCellName(x, y);
            const v = jss.current.getValue(cellName);
            setSelectedText(v ?? "");
          },
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  /* -----------------------------------------------------
     저장
  ----------------------------------------------------- */
  const handleSave = async () => {
    if (!jss.current) {
      alert("시트가 아직 로드되지 않았습니다.");
      return;
    }

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

  /* -----------------------------------------------------
     배경색 적용
  ----------------------------------------------------- */
  const applyBgColor = (color) => {
    if (!jss.current) return;

    selectionRef.current.forEach(([r, c]) => {
      jss.current.setStyle(toCellName(c, r), "background-color", color);
    });
  };

  /* -----------------------------------------------------
     행·열 크기 초기화
  ----------------------------------------------------- */
  const resetRowColSize = () => {
    if (!jss.current) return;

    const rows = jss.current.options.data.length;
    const cols = jss.current.options.data[0]?.length || 10;

    for (let r = 0; r < rows; r++) jss.current.setHeight(r, 30);
    for (let c = 0; c < cols; c++) jss.current.setWidth(c, 100);
  };

  /* -----------------------------------------------------
     Bold
  ----------------------------------------------------- */
  const toggleBold = () => {
    if (!jss.current) return;

    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      const w = jss.current.getStyle(cell)?.["font-weight"];
      jss.current.setStyle(cell, "font-weight", w === "bold" ? "normal" : "bold");
    });
  };

  /* -----------------------------------------------------
     폰트 크기
  ----------------------------------------------------- */
  const applyFontSize = (size) => {
    if (!jss.current) return;

    const fontSize = Number(size);
    if (!fontSize) return;

    const rowsToResize = new Set();

    selectionRef.current.forEach(([r, c]) => {
      jss.current.setStyle(toCellName(c, r), "font-size", fontSize + "px");
      rowsToResize.add(r);
    });

    rowsToResize.forEach((row) => {
      const currentHeight = jss.current.getHeight(row);
      const expected = fontSize + 10;

      if (!currentHeight || currentHeight < expected) {
        jss.current.setRowHeight(row, expected);
      }
    });
  };

  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  /* -----------------------------------------------------
     UI
  ----------------------------------------------------- */
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <div style={headerRow}>
        <h2 style={{ margin: 0 }}>📄 {groupName || "시트"}</h2>
        <input
          type="text"
          placeholder="검색어 입력"
          onChange={(e) => jss.current?.search(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={toolbarWrapper}>
        <div style={toolbarGroup}>
          <button onClick={handleAddRow} style={toolbarBtn}>＋ 행</button>
          <button onClick={handleAddCol} style={toolbarBtn}>＋ 열</button>
        </div>

        <div style={toolbarGroup}>
          {[
            "#ffffff", "#fff176", "#eeeeee", "#d0f8ce", "#fff9c4",
            "#ffe0b2", "#ffb74d", "#ff8a80", "#333333"
          ].map((c) => (
            <div
              key={c}
              onClick={() => applyBgColor(c)}
              style={{ ...colorDot, background: c }}
            ></div>
          ))}
        </div>

        <div style={toolbarGroup}>
          <button onClick={toggleBold} style={toolbarBtn}>B</button>

          <select onChange={(e) => applyFontSize(e.target.value)} style={fontSelect}>
            <option value="">크기</option>
            {[12, 14, 16, 18, 20, 24, 28, 36, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button onClick={resetRowColSize} style={toolbarBtn}>간격초기화</button>
          <button onClick={() => jss.current?.download()} style={toolbarBtn}>⤵</button>
          <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
      </div>

      <div style={selectedBoxStyle}>
        {selectedText || "선택된 셀 내용이 여기에 표시됩니다."}
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   스타일 정의
----------------------------------------------------- */
const selectedBoxStyle = {
  margin: "10px 0 20px",
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
  marginBottom: "14px",
};

const toolbarGroup = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const toolbarBtn = {
  padding: "6px 10px",
  background: "#f3f3f3",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

const saveBtn = {
  ...toolbarBtn,
  background: "#4caf50",
  color: "white",
  border: "none",
};

const colorDot = {
  width: "20px",
  height: "20px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  cursor: "pointer",
};

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
