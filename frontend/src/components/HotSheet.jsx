// src/components/HotSheet.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react-wrapper";

// Handsontable 스타일
import "handsontable/dist/handsontable.full.min.css";

// ⭐ 엑셀 다운로드 플러그인
import { registerPlugin } from "handsontable/plugins";
import { ExportFile } from "handsontable/plugins/exportFile";
registerPlugin(ExportFile);

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
    3) CSV/엑셀 다운로드
  --------------------------------------------------------- */
  const exportExcel = () => {
    const hot = hotRef.current.hotInstance;
    const plugin = hot.getPlugin("exportFile");

    plugin.downloadFile("csv", {
      filename: `${groupName}_sheet`,
      bom: true,
    });
  };

  /* ---------------------------------------------------------
    4) 셀 스타일 커스터마이즈 (배경색 + 글자크기)
  --------------------------------------------------------- */
  const customRenderer = (instance, td, row, col, prop, value) => {
    Handsontable.renderers.TextRenderer.apply(this, [
      instance,
      td,
      row,
      col,
      prop,
      value,
    ]);

    // 셀 배경색
    if (String(value).includes("!yellow")) {
      td.style.backgroundColor = "#fff6b2";
      td.innerText = value.replace("!yellow", "");
    }

    // 글자 크게
    if (String(value).includes("!big")) {
      td.style.fontSize = "16px";
      td.innerText = value.replace("!big", "");
    }

    // 글자 작게
    if (String(value).includes("!small")) {
      td.style.fontSize = "11px";
      td.innerText = value.replace("!small", "");
    }
  };

  if (!sheetData.length) return <p style={{ padding: 20 }}>시트 로딩 중...</p>;

  /* ==========================================================
      RENDER
  ========================================================== */
  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "auto" }}>
      <h2>📘 Handsontable 시트 — {groupName}</h2>

      {/* 버튼 영역 */}
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

      {/* 🔥 최종 Handsontable */}
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
        renderer={customRenderer}
      />
    </div>
  );
}
