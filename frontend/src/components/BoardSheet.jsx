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

  const selectionRef = useRef(null);
  const [groupName, setGroupName] = useState("");
  const [selectedText, setSelectedText] = useState("");

  /* --------------------------------------------------
     A1 좌표 변환
  -------------------------------------------------- */
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "";
    while (col >= 0) {
      name = letters[col % 26] + name;
      col = Math.floor(col / 26) - 1;
    }
    return name + (row + 1);
  };

  /* --------------------------------------------------
     IME 강제 한국어
  -------------------------------------------------- */
  const forceKoreanIME = (cell) => {
    setTimeout(() => {
      const input = cell?.querySelector("input");
      if (!input) return;

      input.setAttribute("lang", "ko");
      input.setAttribute("inputmode", "text");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("autocomplete", "off");
      input.setAttribute("spellcheck", "false");
      input.style.imeMode = "active";

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 5);
  };

  /* --------------------------------------------------
     시트 로딩
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const sheetRes = await axiosInstance.get(`/sheet/${groupId}`);
        const saved = sheetRes.data?.sheetData
          ? JSON.parse(sheetRes.data.sheetData)
          : {};

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jss.current = jspreadsheet(sheetRef.current, {
          data: saved.data || [[]],
          style: saved.style || {},

          columns: (saved.columnWidth || []).map((w) => ({ width: w })),
          rows: (saved.rowHeight || []).reduce((acc, h, i) => {
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

          onload: (instance) => {
            const el = instance.content;
            if (!el) return;

            el.addEventListener("keydown", (e) => {
              if (!instance.edition) {
                const allow = [
                  "F2",
                  "Enter",
                  "Tab",
                  "ArrowUp",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowRight",
                ];
                if (!allow.includes(e.key)) {
                  e.preventDefault();
                  return false;
                }
              }
            });
          },

          oneditstart: (_, cell) => forceKoreanIME(cell),
          oneditionstart: (_, cell) => forceKoreanIME(cell),

          onselection: (_, x1, y1, x2, y2) => {
            selectionRef.current = { x1, y1, x2, y2 };
            const v = jss.current.getValue(toCellName(x1, y1));
            setSelectedText(v ?? "");
          },

          onclick: (_, __, x, y) => {
            const v = jss.current.getValue(toCellName(x, y));
            setSelectedText(v ?? "");
          },
        });
      } catch (e) {
        console.error("시트 로드 실패", e);
      }
    };

    load();
  }, [groupId]);

  /* --------------------------------------------------
     저장 (🔥 핵심 수정 포인트)
  -------------------------------------------------- */
  const handleSave = async () => {
    if (!jss.current) return;

    const payload = {
      data: jss.current.getData(),     // ✅ getJson 제거
      style: jss.current.getStyle(),
      columnWidth: jss.current.getWidth(),
      rowHeight: jss.current.getHeight(),
    };

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료");
    } catch {
      alert("저장 실패");
    }
  };

  /* --------------------------------------------------
     선택범위 유틸
  -------------------------------------------------- */
  const applyToSelection = (cb) => {
    const r = selectionRef.current;
    if (!r || !jss.current) return;
    for (let y = r.y1; y <= r.y2; y++) {
      for (let x = r.x1; x <= r.x2; x++) {
        cb(toCellName(x, y), x, y);
      }
    }
  };

  /* --------------------------------------------------
     스타일 기능
  -------------------------------------------------- */
  const applyBgColor = (c) =>
    applyToSelection((cell) =>
      jss.current.setStyle(cell, "background-color", c)
    );

  const toggleBold = () =>
    applyToSelection((cell) => {
      const cur = jss.current.getStyle(cell)?.["font-weight"];
      jss.current.setStyle(cell, "font-weight", cur === "bold" ? "normal" : "bold");
    });

  const applyFontSize = (size) => {
    const px = Number(size);
    if (!px) return;

    const rows = new Set();
    applyToSelection((cell, _, y) => {
      jss.current.setStyle(cell, "font-size", px + "px");
      rows.add(y);
    });

    rows.forEach((r) => {
      if (jss.current.getHeight(r) < px + 10) {
        jss.current.setRowHeight(r, px + 10);
      }
    });
  };

  /* --------------------------------------------------
     행/열
  -------------------------------------------------- */
  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  const resetRowColSize = () => {
    const rows = jss.current.options.data.length;
    const cols = jss.current.options.data[0]?.length || 10;
    for (let r = 0; r < rows; r++) jss.current.setHeight(r, 30);
    for (let c = 0; c < cols; c++) jss.current.setWidth(c, 100);
  };

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <div style={headerRow}>
        <h2>📄 {groupName}</h2>
        <input
          placeholder="검색"
          onChange={(e) => jss.current?.search(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={toolbarWrapper}>
        <div style={toolbarGroup}>
          <button onClick={handleAddRow} style={toolbarBtn}>＋행</button>
          <button onClick={handleAddCol} style={toolbarBtn}>＋열</button>
        </div>

        <div style={toolbarGroup}>
          {["#fff", "#eee", "#d0f8ce", "#ffe0b2", "#ff8a80", "#333"].map((c) => (
            <div key={c} onClick={() => applyBgColor(c)} style={{ ...colorDot, background: c }} />
          ))}
        </div>

        <div style={toolbarGroup}>
          <button onClick={toggleBold} style={toolbarBtn}>B</button>
          <select onChange={(e) => applyFontSize(e.target.value)} style={fontSelect}>
            <option value="">크기</option>
            {[12,14,16,18,20,24,28,36].map(n => <option key={n}>{n}</option>)}
          </select>
          <button onClick={resetRowColSize} style={toolbarBtn}>초기화</button>
          <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
      </div>

      <div style={selectedBoxStyle}>
        {selectedText || "선택된 셀 내용"}
      </div>

      <div ref={sheetRef}></div>
    </div>
  );
}

/* -------------------- styles -------------------- */
const headerRow = { display: "flex", justifyContent: "space-between", marginBottom: 12 };
const searchInputStyle = { padding: 6, borderRadius: 6, border: "1px solid #ccc" };
const toolbarWrapper = { display: "flex", justifyContent: "space-between", marginBottom: 12 };
const toolbarGroup = { display: "flex", gap: 8 };
const toolbarBtn = { padding: "6px 10px", cursor: "pointer" };
const saveBtn = { ...toolbarBtn, background: "#4caf50", color: "#fff" };
const colorDot = { width: 20, height: 20, border: "1px solid #ccc", cursor: "pointer" };
const fontSelect = { padding: 6 };
const selectedBoxStyle = { padding: 10, minHeight: 60, border: "1px solid #ccc" };
