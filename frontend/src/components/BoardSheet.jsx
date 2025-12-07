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

  const selectionRef = useRef(null); // { x1, y1, x2, y2 }
  const [groupName, setGroupName] = useState("");
  const [selectedText, setSelectedText] = useState("");

  /* ---------------------------------------------
     A1 좌표 → "A1" 문자열 변환
  --------------------------------------------- */
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let colName = "";
    while (col >= 0) {
      colName = letters[col % 26] + colName;
      col = Math.floor(col / 26) - 1;
    }
    return colName + (row + 1);
  };

  /* ---------------------------------------------
     IME 한국어 강제 적용
  --------------------------------------------- */
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

  /* ---------------------------------------------
     시트 로딩
  --------------------------------------------- */
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : {};

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        const colWidths = json.columnWidth || [];
        const rowHeights = json.rowHeight || [];

        jss.current = jspreadsheet(sheetRef.current, {
          data: json.data || [[]],
          style: json.style || {},

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

          /* ---------------------------------------------
             로딩 후: 선택상태 문자입력 방지 (영문1타 버그 방지)
          --------------------------------------------- */
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

          /* ---------------------------------------------
             편집 시작 → IME 적용
          --------------------------------------------- */
          oneditstart: (_, cell) => forceKoreanIME(cell),
          oneditionstart: (_, cell) => forceKoreanIME(cell),

          /* ---------------------------------------------
             드래그 선택 (범위 저장)
          --------------------------------------------- */
          onselection: (instance, x1, y1, x2, y2) => {
            if (!jss.current) return;
            selectionRef.current = { x1, y1, x2, y2 };

            const cellName = toCellName(x1, y1);
            const v = jss.current.getValue(cellName);
            setSelectedText(v ?? "");
          },

          /* ---------------------------------------------
             클릭 시 텍스트만 표시
          --------------------------------------------- */
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

  /* ---------------------------------------------
     저장
  --------------------------------------------- */
  const handleSave = async () => {
    if (!jss.current) return alert("시트가 아직 로드되지 않았습니다.");

    const saveObj = {
      data: jss.current.getJson(),
      style: jss.current.getStyle(),
      columnWidth: jss.current.getWidth(),
      rowHeight: jss.current.getHeight(),
    };

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(saveObj), {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패!", err);
    }
  };

  /* ---------------------------------------------
     선택범위 전체 적용 유틸
  --------------------------------------------- */
  const applyToSelection = (callback) => {
    const range = selectionRef.current;
    if (!range || !jss.current) return;

    const { x1, y1, x2, y2 } = range;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const cell = toCellName(x, y);
        callback(cell, x, y);
      }
    }
  };

  /* ---------------------------------------------
     배경색
  --------------------------------------------- */
  const applyBgColor = (color) => {
    applyToSelection((cell) =>
      jss.current.setStyle(cell, "background-color", color)
    );
  };

  /* ---------------------------------------------
     Bold
  --------------------------------------------- */
  const toggleBold = () => {
    applyToSelection((cell) => {
      const cur = jss.current.getStyle(cell)?.["font-weight"];
      const next = cur === "bold" ? "normal" : "bold";
      jss.current.setStyle(cell, "font-weight", next);
    });
  };

  /* ---------------------------------------------
     폰트 크기
  --------------------------------------------- */
  const applyFontSize = (size) => {
    const px = Number(size);
    if (!px || !jss.current) return;

    const rowsToResize = new Set();

    applyToSelection((cell, x, y) => {
      jss.current.setStyle(cell, "font-size", px + "px");
      rowsToResize.add(y);
    });

    rowsToResize.forEach((row) => {
      const expected = px + 10;
      const current = jss.current.getHeight(row);
      if (!current || current < expected) {
        jss.current.setRowHeight(row, expected);
      }
    });
  };

  /* ---------------------------------------------
     행/열 추가
  --------------------------------------------- */
  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  /* ---------------------------------------------
     행·열 크기 초기화
  --------------------------------------------- */
  const resetRowColSize = () => {
    const data = jss.current.options.data;
    const rows = data.length;
    const cols = data[0]?.length || 10;

    for (let r = 0; r < rows; r++) jss.current.setHeight(r, 30);
    for (let c = 0; c < cols; c++) jss.current.setWidth(c, 100);
  };

  /* ---------------------------------------------
     UI 렌더링
  --------------------------------------------- */
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

      {/* ---------------------------- Toolbar ---------------------------- */}
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
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button onClick={resetRowColSize} style={toolbarBtn}>간격초기화</button>
          <button onClick={() => jss.current?.download()} style={toolbarBtn}>⤵</button>
          <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
      </div>

      {/* 선택된 셀 내용 표시 */}
      <div style={selectedBoxStyle}>
        {selectedText || "선택된 셀 내용이 여기에 표시됩니다."}
      </div>

      {/* 시트 */}
      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   스타일
--------------------------------------------- */
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
  top: 0,
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
