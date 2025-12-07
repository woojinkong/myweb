// src/components/HotSheet.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";

export default function HotSheet() {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const hotRef = useRef(null);

  // 1) 서버에서 데이터 로드
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

  // 2) 저장
  const saveSheet = async () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData();

    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });
      alert("저장 완료!");
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }
  };

  if (!sheetData.length) return <p style={{ padding: 20 }}>시트 로딩 중...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "auto" }}>
      <h2>📘 Handsontable 시트 — {groupName}</h2>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={saveSheet}
          style={{
            padding: "6px 12px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          저장
        </button>
      </div>

      {/* 핵심: HotTable */}
      <HotTable
        ref={hotRef}
        data={sheetData}
        rowHeaders={true}
        colHeaders={true}
        contextMenu={true}
        licenseKey="non-commercial-and-evaluation"
        width="100%"
        height="650px"
        stretchH="all"
      />
    </div>
  );
}
