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
  const [groupName, setGroupName] = useState("");
  

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
            const editor =
              cell?.querySelector("textarea") ||
              cell?.querySelector("input");

            if (!editor) return;

            editor.setAttribute("lang", "ko");
            editor.style.imeMode = "active";
            editor.style.whiteSpace = "pre-wrap";
            editor.style.minHeight = "80px";
            editor.style.width = "100%";

            // 🔥 핵심: capture 단계에서 jspreadsheet 키 차단
            const keyHandler = (e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                e.stopImmediatePropagation();

                const start = editor.selectionStart;
                const end = editor.selectionEnd;

                editor.value =
                  editor.value.slice(0, start) +
                  "\n" +
                  editor.value.slice(end);

                editor.selectionStart = editor.selectionEnd = start + 1;
              }
            };

            document.addEventListener("keydown", keyHandler, true);

            // 편집 종료 시 정리
            editor.addEventListener("blur", () => {
              document.removeEventListener("keydown", keyHandler, true);
            });

            editor.focus();
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
        columns: (saved.columnWidth || []).map((w) => ({
          width: w,
        type: "textarea",
        })),

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

    const COMMON_COLORS = [
      "#ffffff", // 기본
      "#f5f5f5", // 연회색
      "#e0e0e0", // 중간회색
      "#d0f8ce", // 연초록 (확인)
      "#fff9c4", // 연노랑 (강조)
      "#ffe0b2", // 연주황 (주의)
      "#ffcdd2", // 연빨강 (경고)
      "#cfd8dc", // 비활성
    ];


  /* ==================================================
     UI
  ================================================== */
  return (
    <div style={{ padding: 20 }}>
      <h2>📄 {groupName}</h2>

      <div style={toolbar}>
        <button onClick={() => setAlign("left")}>⯇</button>
        <button onClick={() => setAlign("center")}>≡</button>
        <button onClick={() => setAlign("right")}>⯈</button>

        <button onClick={toggleBold}>B</button>
        

        {COMMON_COLORS.map((c) => (
        <div
          key={c}
          onClick={() => setBg(c)}
          style={{ ...colorDot, background: c }}
          title={c}
        />
      ))}


        <button onClick={handleSave}>저장</button>
      </div>

    <div className="board-sheet-wrapper">
      <div ref={sheetRef} />
    </div>

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


