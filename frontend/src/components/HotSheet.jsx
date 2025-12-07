// src/components/HotSheet.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react-wrapper";

// Handsontable 스타일
import "handsontable/dist/handsontable.full.min.css";

/* ---------------------------------------------------------
  🔥 1) 커스텀 렌더러 등록 (이게 핵심)
--------------------------------------------------------- */
const customRenderer = function (instance, td, row, col, prop, value) {
  Handsontable.renderers.TextRenderer.apply(this, [
    instance,
    td,
    row,
    col,
    prop,
    value,
  ]);

  if (String(value).includes("!yellow")) {
    td.style.backgroundColor = "#fff6b2";
    td.innerText = value.replace("!yellow", "");
  }

  if (String(value).includes("!big")) {
    td.style.fontSize = "16px";
    td.innerText = value.replace("!big", "");
  }

  if (String(value).includes("!small")) {
    td.style.fontSize = "11px";
    td.innerText = value.replace("!small", "");
  }
};

// 🔥 Handsontable 렌더러 등록
Handsontable.renderers.registerRenderer("customRenderer", customRenderer);

export default function HotSheet() {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const hotRef = useRef(null);

  /* ---------------------------------------------------------
    1) 데이터 로딩
  --------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (json.length === 0) {
          const empty = Array(30)
            .fill(null)
            .map(() => Array(10).fill(""));
          setSheetData(empty);
        } else {
          setSheetData(json);
        }
      } catch (e) {
        console.error("시트 로드 오류:", e);
      }
    };
    load();
  }, [groupId]);

  /* ---------------------------------------------------------
    2) 저장
  --------------------------------------------------------- */
  const saveSheet = async () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData();

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }
  };

  /* ---------------------------------------------------------
    3) CSV 다운로드
  --------------------------------------------------------- */
  const exportExcel = () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData();

    const csv = data.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupName}_sheet.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!sheetData.length) return <p style={{ padding: 20 }}>시트 로딩 중...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "auto" }}>
      <h2>📘 Handsontable 시트 — {groupName}</h2>

      <div style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
        <button
          onClick={saveSheet}
          style={{
            padding: "6px 12px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          저장
        </button>

        <button
          onClick={exportExcel}
          style={{
            padding: "6px 12px",
            background: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          CSV 다운로드
        </button>
      </div>

      <HotTable
        ref={hotRef}
        data={sheetData}
        rowHeaders={true}
        colHeaders={true}
        contextMenu={true}
        manualColumnMove={true}
        manualRowMove={true}
        autoColumnSize={true}
        fixedColumnsLeft={1}
        filters={true}
        dropdownMenu={true}
        mergeCells={true}
        width="100%"
        height="650"
        stretchH="all"
        licenseKey="non-commercial-and-evaluation"
        colWidths={120}
        renderer="customRenderer"   // ← 문자열!
      />
    </div>
  );
}
