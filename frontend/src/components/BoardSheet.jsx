import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();

  const sheetRef = useRef(null);
  const jssRef = useRef(null);
  const selectionRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const [groupName, setGroupName] = useState("");
  const [tooltip, setTooltip] = useState({ visible: false, text: "" });

  /* ==================================================
     공통 유틸
  ================================================== */
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "";
    while (col >= 0) {
      name = letters[col % 26] + name;
      col = Math.floor(col / 26) - 1;
    }
    return name + (row + 1);
  };

  const applyToSelection = (cb) => {
    const r = selectionRef.current;
    const jss = jssRef.current;
    if (!r || !jss) return;

    for (let y = r.y1; y <= r.y2; y++) {
      for (let x = r.x1; x <= r.x2; x++) {
        cb(toCellName(x, y), x, y);
      }
    }
  };

  /* ==================================================
     IME (한글)
  ================================================== */
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

  /* ==================================================
     시트 로딩
  ================================================== */
  useEffect(() => {

    const load = async () => {
      const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
      setGroupName(groupRes.data.name);

      const sheetRes = await axiosInstance.get(`/sheet/${groupId}`);
      const saved = sheetRes.data?.sheetData
        ? JSON.parse(sheetRes.data.sheetData)
        : {};

      if (sheetRef.current) sheetRef.current.innerHTML = "";

      const jss = jspreadsheet(sheetRef.current, {
        data: saved.data || [[]],
        style: saved.style || {},
        columns: (saved.columnWidth || []).map((w) => ({ width: w })),
        rows: (saved.rowHeight || []).reduce((a, h, i) => {
          a[i] = { height: h };
          return a;
        }, {}),

        minDimensions: [10, 30],
        tableHeight: "620px",
        tableOverflow: true,
        filters: true,
        columnSorting: true,
        rowResize: true,
        editable: true,

        oneditstart: (_, cell) => forceKoreanIME(cell),
        oneditionstart: (_, cell) => forceKoreanIME(cell),

        onselection: (_, x1, y1, x2, y2) => {
          selectionRef.current = { x1, y1, x2, y2 };
        },

        onload: (instance) => {
          // ✅ 가장 안전한 루트
          const root =
            instance.content ||
            instance.table?.parentNode;

          if (!root) {
            console.warn("jspreadsheet root not ready");
            return;
          }

          let lastCell = null;

          const onMove = (e) => {
            mousePosRef.current = {
              x: e.clientX + 12,
              y: e.clientY + 12,
            };
          };

          const onOver = (e) => {
            const td = e.target.closest("td");
            if (!td || td === lastCell || instance.edition) return;

            const col = td.getAttribute("data-col");
            const row = td.getAttribute("data-row");
            if (col == null || row == null) return;

            if (td.scrollWidth <= td.clientWidth) return;

            const value = instance.getValueFromCoords(+col, +row);
            if (!value) return;

            lastCell = td;
            setTooltip({ visible: true, text: value });
          };

          const onOut = (e) => {
            const td = e.target.closest("td");
            if (!td || td.contains(e.relatedTarget)) return;

            lastCell = null;
            setTooltip({ visible: false, text: "" });
          };

          root.addEventListener("mousemove", onMove);
          root.addEventListener("mouseover", onOver);
          root.addEventListener("mouseout", onOut);

          instance._tooltipCleanup = () => {
            root.removeEventListener("mousemove", onMove);
            root.removeEventListener("mouseover", onOver);
            root.removeEventListener("mouseout", onOut);
          };
        },

      });

      jssRef.current = jss;
    };

    load();

    return () => {
       jssRef.current?._tooltipCleanup?.();
      jssRef.current?.destroy?.();
    };
  }, [groupId]);

  /* ==================================================
     저장
  ================================================== */
  const handleSave = async () => {
    const jss = jssRef.current;
    if (!jss) return;

    const payload = {
      data: jss.getData(),
      style: jss.getStyle(),
      columnWidth: jss.getWidth(),
      rowHeight: jss.getHeight(),
    };

    await axiosInstance.post(`/sheet/${groupId}`, payload);
    alert("저장 완료");
  };

  /* ==================================================
     스타일 / 정렬
  ================================================== */
  const setAlign = (align) =>
    applyToSelection((cell) =>
      jssRef.current.setStyle(cell, "text-align", align)
    );

  const toggleBold = () =>
    applyToSelection((cell) => {
      const cur = jssRef.current.getStyle(cell)?.["font-weight"];
      jssRef.current.setStyle(
        cell,
        "font-weight",
        cur === "bold" ? "normal" : "bold"
      );
    });

  const setBg = (color) =>
    applyToSelection((cell) =>
      jssRef.current.setStyle(cell, "background-color", color)
    );

  /* ==================================================
     UI
  ================================================== */
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <h2>📄 {groupName}</h2>

      <div style={toolbar}>
        <button onClick={() => setAlign("left")}>⯇</button>
        <button onClick={() => setAlign("center")}>≡</button>
        <button onClick={() => setAlign("right")}>⯈</button>

        <button onClick={toggleBold}>B</button>

        {["#fff", "#eee", "#d0f8ce", "#ffe0b2"].map((c) => (
          <div
            key={c}
            onClick={() => setBg(c)}
            style={{ ...colorDot, background: c }}
          />
        ))}

        <button onClick={handleSave}>저장</button>
      </div>

      <div ref={sheetRef} />

      {tooltip.visible && (
        <div style={tooltipStyle(mousePosRef.current)}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

/* ==================================================
   styles
================================================== */
const toolbar = {
  display: "flex",
  gap: 8,
  marginBottom: 10,
  alignItems: "center",
};

const colorDot = {
  width: 20,
  height: 20,
  border: "1px solid #ccc",
  cursor: "pointer",
};

const tooltipStyle = (pos) => ({
  position: "fixed",
  left: pos.x,
  top: pos.y,
  maxWidth: 320,
  padding: "8px 10px",
  background: "#222",
  color: "#fff",
  fontSize: 13,
  borderRadius: 6,
  pointerEvents: "none",
  zIndex: 9999,
  whiteSpace: "pre-wrap",
});
