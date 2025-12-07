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

  // -----------------------------------
  // 🔹 시트 로딩
  // -----------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (!json || json.length === 0) {
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

  // -----------------------------------
  // 🔹 저장
  // -----------------------------------
  const saveSheet = async () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData(); // 값만 가져옴

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

  // -----------------------------------
  // 🔹 행 추가
  // -----------------------------------
  const addRow = () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData();

    const newRow = Array(hot.countCols()).fill("");
    hot.loadData([...data, newRow]);
  };

  // -----------------------------------
  // 🔹 열 추가
  // -----------------------------------
  const addCol = () => {
    const hot = hotRef.current.hotInstance;
    const data = hot.getData();

    const updated = data.map(row => [...row, ""]);
    const newColCount = hot.countCols() + 1;

    hot.updateSettings({
      data: updated,
      colHeaders: Array.from({ length: newColCount }, (_, i) => `COL ${i + 1}`)
    });
  };

  if (!sheetData.length) return <p style={{ padding: 20 }}>시트 로딩 중...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "auto" }}>
      <h2>{groupName}</h2>

      {/* 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px"
        }}
      >
        <button onClick={saveSheet} style={btnGreen}>저장</button>
        <button onClick={addRow} style={btnBlue}>행 추가</button>
        <button onClick={addCol} style={btnBlue}>열 추가</button>
      </div>

      {/* 🔹 필터 + 드롭다운 메뉴 활성화 */}
      <HotTable
        ref={hotRef}
        data={sheetData}
        rowHeaders={true}
        colHeaders={true}
        contextMenu={true}
        search={{}}           // 검색 안정화
        filters={true}        // ★ 필터 활성화
        dropdownMenu={true}   // ★ 필터 UI 버튼 활성화
        licenseKey="non-commercial-and-evaluation"
        width="100%"
        height="650px"
        stretchH="all"
      />
    </div>
  );
}

// -----------------------------------
// 🔵 버튼 스타일
// -----------------------------------
const btnBlue = {
  padding: "6px 12px",
  background: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnGreen = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
