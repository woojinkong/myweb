import { useEffect, useRef, useState, useCallback } from "react";
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
  const toCellName = useCallback((col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "";
    while (col >= 0) {
      name = letters[col % 26] + name;
      col = Math.floor(col / 26) - 1;
    }
    return name + (row + 1);
  }, []);

  const applyToSelection = useCallback(
    (cb) => {
      const r = selectionRef.current;
      const jss = jssRef.current;
      if (!r || !jss) return;

      for (let y = r.y1; y <= r.y2; y++) {
        for (let x = r.x1; x <= r.x2; x++) {
          cb(toCellName(x, y));
        }
      }
    },
    [toCellName]
  );


  /* ==================================================
     시트 로딩
  ================================================== */
  useEffect(() => {
    let destroyed = false;

    const load = async () => {
      const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
      if (destroyed) return;
      setGroupName(groupRes.data.name);

      const sheetRes = await axiosInstance.get(`/sheet/${groupId}`);
      if (destroyed) return;

      const saved = sheetRes.data?.sheetData
        ? JSON.parse(sheetRes.data.sheetData)
        : {};

      if (sheetRef.current) sheetRef.current.innerHTML = "";

      const jss = jspreadsheet(sheetRef.current, {
        data: saved.data || [[]],

        style: {
          "*": {
            "white-space": "pre-wrap",
            "word-break": "break-word",
            "overflow-wrap": "anywhere",
          },
          ...(saved.style || {}),
        },

        columns: (saved.columnWidth || []).map((w) => ({
          width: w,
          type: "textarea",
        })),

        rows: (saved.rowHeight || []).reduce((acc, h, i) => {
          acc[i] = { height: h };
          return acc;
        }, {}),

        minDimensions: [10, 30],
        tableOverflow: false,
        filters: true,
        columnSorting: true,
        rowResize: true,
        editable: true,

        onselection: (_, x1, y1, x2, y2) => {
          selectionRef.current = { x1, y1, x2, y2 };
        },
      });

      jssRef.current = jss;
    };

    load();

    return () => {
      destroyed = true;
      jssRef.current?.destroy?.();
      jssRef.current = null;
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
    "#ffffff",
    "#f5f5f5",
    "#e0e0e0",
    "#d0f8ce",
    "#fff9c4",
    "#ffe0b2",
    "#ffcdd2",
    "#cfd8dc",
  ];

  const insertNewLine = () => {
    const jss = jssRef.current;
    const r = selectionRef.current;
    if (!jss || !r) return;

    for (let y = r.y1; y <= r.y2; y++) {
      for (let x = r.x1; x <= r.x2; x++) {
        const cell = toCellName(x, y);
        const cur = jss.getValue(cell) ?? "";

        // 커서 위치 개념이 없으므로 "끝에 줄바꿈" 삽입
        jss.setValue(cell, cur + "\n");
      }
    }
};


  /* ==================================================
     UI
  ================================================== */
  return (
  <div style={{ padding: 20 }}>
  <h2>📄 {groupName}</h2>

  {/* 세로 스크롤 */}
  <div className="board-scroll-container">

    {/* 가로 스크롤 */}
    <div className="board-sheet-wrapper">

      {/* toolbar는 반드시 여기 */}
      <div className="board-toolbar">
        <button onClick={() => setAlign("left")}>⯇</button>
        <button onClick={() => setAlign("center")}>≡</button>
        <button onClick={() => setAlign("right")}>⯈</button>

        <button onClick={toggleBold}>B</button>
        <button onClick={insertNewLine}>↵</button>

        {COMMON_COLORS.map((c) => (
          <div
            key={c}
            className="color-dot"
            onClick={() => setBg(c)}
            style={{ background: c }}
          />
        ))}

        <button onClick={handleSave}>저장</button>
      </div>

      {/* sheet */}
      <div ref={sheetRef} />
    </div>
  </div>
</div>
);

}
