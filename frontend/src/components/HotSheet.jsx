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
  const [searchText, setSearchText] = useState("");

  const hotRef = useRef(null);

  // 1) 데이터 로드
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


  // 2) 저장 기능
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


  // 3) 행 추가
  const addRow = () => {
    const hot = hotRef.current.hotInstance;
    hot.alter("insert_row", hot.countRows()); // 마지막에 추가
  };


  // 4) 열 추가
  const addCol = () => {
    const hot = hotRef.current.hotInstance;
    hot.alter("insert_col", hot.countCols());
  };


  // 5) 검색 기능 적용
  const handleSearch = (value) => {
    setSearchText(value);

    const hot = hotRef.current.hotInstance;
    const searchPlugin = hot.getPlugin("search");

    searchPlugin.query(value);  // 검색어 적용
    hot.render();               // 테이블 새로 렌더링
  };


  if (!sheetData.length) return <p style={{ padding: 20 }}>시트 로딩 중...</p>;


  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "auto" }}>
      <h2>{groupName}</h2>

      {/* 버튼 / 툴바 */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "12px"
        }}
      >
        <button onClick={saveSheet} style={btnGreen}>저장</button>
        <button onClick={addRow} style={btnBlue}>행 추가</button>
        <button onClick={addCol} style={btnBlue}>열 추가</button>

        {/* 검색 */}
        <input
          type="text"
          placeholder="검색..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginLeft: "auto"
          }}
        />
      </div>

      {/* 시트 */}
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
        search={true}  // 검색 플러그인 활성화
      />
    </div>
  );
}


/* 버튼 스타일 */
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
