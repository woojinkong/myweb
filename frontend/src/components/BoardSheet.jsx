import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

// ⭐ jspreadsheet v4.13.2 import
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jss = useRef(null);

  const selectionRef = useRef([]);

  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jss.current = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [10, 30],
          tableHeight: "620px",
          tableOverflow: true,
          filters: true,
          search: true,
          columnSorting: true,
          toolbar: true,

          onselection: (instance, x1, y1, x2, y2) => {
            const selected = [];
            for (let r = y1; r <= y2; r++) {
              for (let c = x1; c <= x2; c++) {
                selected.push([r, c]);
              }
            }
            selectionRef.current = selected;
          }
        });

      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // -----------------------------------
  // ⭐ 저장 기능
  // -----------------------------------
  const handleSave = async () => {
    const jsonData = JSON.stringify(jss.current.getJson());
    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("저장 완료!");
    } catch {
      alert("저장 실패!");
    }
  };

  // -----------------------------------
  // ⭐ 엑셀 다운로드
  // -----------------------------------
  const handleExport = () => {
    if (jss.current) jss.current.download();
  };

  // -----------------------------------
  // ⭐ 행 추가 기능
  // -----------------------------------
  const handleAddRow = () => {
    if (!jss.current) return;
    jss.current.insertRow();
  };

  // -----------------------------------
  // ⭐ 열 추가 기능
  // -----------------------------------
  const handleAddCol = () => {
    if (!jss.current) return;
    jss.current.insertColumn();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={toolbarStyle}>

        <button onClick={handleAddRow} style={blueBtn}>행 추가</button>
        <button onClick={handleAddCol} style={blueBtn}>열 추가</button>

        <button onClick={handleExport} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={greenBtn}>저장</button>
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
  background: "#f5f5f5",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px"
};

const blueBtn = {
  padding: "6px 12px",
  background: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const greenBtn = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
