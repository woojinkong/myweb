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

  // ✅ (핵심) data 구조를 jspreadsheet가 절대 안 터지게 정규화
  const normalizeData = useCallback((raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [[""]];

    // row가 배열이 아닐 수도 있으니 방어
    const safeRows = raw.map((r) => (Array.isArray(r) ? r : []));

    const maxCols = Math.max(
      ...safeRows.map((r) => r.length),
      1
    );

    // 모든 row를 maxCols 길이로 맞춤
    return safeRows.map((row) => {
      const padded = row.slice(0, maxCols);
      while (padded.length < maxCols) padded.push("");
      return padded;
    });
  }, []);

  /* ==================================================
     모달 포커스 / ESC 닫기
  ================================================== */
  useEffect(() => {
    if (!editorOpen) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [editorOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setEditorOpen(false);
    };
    if (editorOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen]);

  /* ==================================================
     저장 (자동저장/수동저장 공용)
  ================================================== */
  const handleSave = useCallback(async () => {
    const jss = jssRef.current;
    if (!jss) return;

    // 저장 중에 onchange가 또 dirty로 만들지 않게
    savingRef.current = true;

    try {
      const gridData = jss.getData();
      const colCount = gridData?.[0]?.length || 1;

      const payload = {
        data: gridData,
        style: jss.getStyle(),
        // getWidth()는 전체 컬럼 폭 배열을 주는데, 현재 colCount까지만 저장
        columnWidth: (jss.getWidth?.() || []).slice(0, colCount),
        rowHeight: jss.getHeight?.() || [],
      };

      await axiosInstance.post(`/sheet/${groupId}`, payload);
    } finally {
      savingRef.current = false;
    }
  }, [groupId]);

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

      // ✅ 저장된 데이터 기반으로 안정적으로 정규화
      const data = normalizeData(saved.data);
      const colCount = data[0].length;

      // ✅ columnWidth도 colCount 길이로 강제 보정
      const columnWidth = Array.from({ length: colCount }, (_, i) => {
        const w = saved.columnWidth?.[i];
        return typeof w === "number" && w > 0 ? w : 120;
      });

      // ✅ rows(height)도 row 개수까지만 반영
      const rows = {};
      for (let i = 0; i < data.length; i++) {
        const h = saved.rowHeight?.[i];
        if (typeof h === "number" && h > 0) rows[i] = { height: h };
      }

      if (sheetRef.current) sheetRef.current.innerHTML = "";

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

        columns: columnWidth.map((w) => ({
          width: w,
          type: "textarea",
        })),

        rows,

        ondblclick: (instance, cell, x, y) => {
          if (x < 0 || y < 0) return; // 헤더/비셀 영역 차단

          const cellName = toCellName(x, y);
          const value = instance.getValue(cellName) ?? "";

          setEditorCell(cellName);
          setEditorValue(value);
          setEditorOpen(true);

          return false; // 기본 편집 차단
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
      setIsDirty(false); // 로드 직후 dirty 해제
    };

    load();

    return () => {
      destroyed = true;
      jssRef.current?.destroy?.();
      jssRef.current = null;
    };
  }, [groupId, normalizeData, toCellName]);

  /* ==================================================
     자동저장 (디바운스)
  ================================================== */
  useEffect(() => {
    if (!isDirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      handleSave();
      setIsDirty(false);
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, handleSave]);

  // 새로고침/닫기 직전에 저장 시도
  useEffect(() => {
    const beforeUnload = (e) => {
      if (!isDirty) return;

      // 주의: beforeunload에서 비동기 완료 보장 불가 (브라우저 정책)
      handleSave();

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty, handleSave]);

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
        jss.setValue(cell, cur + "\n"); // 끝에 줄바꿈 추가
      }
    }
  };

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

          {/* 수동 저장 버튼 유지 (자동저장 있어도 안전장치로 추천) */}
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
                    if (editorCell && jssRef.current?.setRowHeight) {
                      const rowIndex =
                        parseInt(editorCell.match(/\d+/)[0], 10) - 1;

                      jssRef.current.setRowHeight(rowIndex, 40); // 숫자(px) 권장
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
