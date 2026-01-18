import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "../styles/BoardSheet.css";

export default function BoardSheet() {
  const { groupId } = useParams();

  const sheetRef = useRef(null);
  const jssRef = useRef(null);
  const selectionRef = useRef(null);
  const textareaRef = useRef(null);

  const [groupName, setGroupName] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [editorCell, setEditorCell] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimerRef = useRef(null);
  const savingRef = useRef(false);


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

  useEffect(() => {
  if (editorOpen) {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }
  }, [editorOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setEditorOpen(false);
    };
    if (editorOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen]);




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

      const data = saved.data || [[]];
      const colCount = data[0]?.length || 1;

      const jss = jspreadsheet(sheetRef.current, {
        data,

        style: {
          "*": {
            "white-space": "pre-wrap",
            "word-break": "break-word",
            "overflow-wrap": "anywhere",
          },
          ...(saved.style || {}),
        },

        columns: Array.from({ length: colCount }, (_, i) => ({
        width: saved.columnWidth?.[i] || 120,
        type: "textarea",

      })),

      rows: (saved.rowHeight || []).reduce((acc, h, i) => {
        acc[i] = { height: h };
        return acc;
      }, {}),

      ondblclick: (instance, cell, x, y) => {
        if (x < 0 || y < 0) return; // 헤더/비셀 영역 차단

        const cellName = toCellName(x, y);
        const value = instance.getValue(cellName) ?? "";

        setEditorCell(cellName);
        setEditorValue(value);
        setEditorOpen(true);

        return false;
      },


        minDimensions: undefined,
        tableOverflow: false,
        filters: true,
        columnSorting: true,
        rowResize: true,
        editable: true,

        onselection: (_, x1, y1, x2, y2) => {
          selectionRef.current = { x1, y1, x2, y2 };
        },

        onchange: () => {
        if (savingRef.current) return;
        setIsDirty(true);
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

    savingRef.current = true;

    const payload = {
    data: jss.getData(),
    style: jss.getStyle(),
    columnWidth: jss.getWidth().slice(0, jss.getData()[0].length),
    rowHeight: jss.getHeight(),
  };

    await axiosInstance.post(`/sheet/${groupId}`, payload);
    savingRef.current = false;
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

    useEffect(() => {
    if (!isDirty) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      handleSave();
      setIsDirty(false);
    }, 2000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isDirty, groupId]); // handleSave 직접 의존 X

    useEffect(() => {
    const beforeUnload = (e) => {
      if (isDirty) {
        handleSave();
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);





  /* ==================================================
     UI
  ================================================== */
  return (
  <div style={{ padding: 20 }}>
  <h2>📄 {groupName}</h2>


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

      {editorOpen && (
        <div className="sheet-modal-backdrop">
          <div className="sheet-modal">
            <h3>셀 내용 편집</h3>

            <textarea
               ref={textareaRef}
              value={editorValue}
              onChange={(e) => setEditorValue(e.target.value)}
              style={{
                width: "100%",
                height: "200px",
                resize: "vertical",
              }}
            />

            <div className="modal-actions">
              <button onClick={() => setEditorOpen(false)}>취소</button>
              <button
                onClick={() => {
                  if (editorCell) {
                    jssRef.current.setValue(editorCell, editorValue);
                    const rowIndex = parseInt(editorCell.match(/\d+/)[0], 10) - 1;
                    jssRef.current.setRowHeight(rowIndex, "auto");
                  }
                  setEditorOpen(false);
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);

}
