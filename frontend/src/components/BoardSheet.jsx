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

  // ---------------------------------------
  // 🔹 시트 로딩
  // ---------------------------------------
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const json = res.data.sheetData ? JSON.parse(res.data.sheetData) : null;

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jss.current = jspreadsheet(sheetRef.current, {
          data: json?.data || [],
          style: json?.style || {},
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


  // ---------------------------------------
  // ⭐ 저장 기능(data + style)
  // ---------------------------------------
  const handleSave = async () => {
    const data = jss.current.getJson();
    const style = jss.current.getStyle();

    const saveObj = { data, style };
    const jsonData = JSON.stringify(saveObj);

    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("저장 완료!");
    } catch {
      alert("저장 실패!");
    }
  };

  // ---------------------------------------
  // ⭐ 엑셀 다운로드
  // ---------------------------------------
  const handleExport = () => {
    if (jss.current) jss.current.download();
  };

  // ---------------------------------------
  // ⭐ 행 추가
  // ---------------------------------------
  const handleAddRow = () => {
    if (!jss.current) return;
    jss.current.insertRow();
  };

  // ---------------------------------------
  // ⭐ 열 추가
  // ---------------------------------------
  const handleAddCol = () => {
    if (!jss.current) return;
    jss.current.insertColumn();
  };

  // ---------------------------------------
  // ⭐ 배경색 적용 공통 함수
  // ---------------------------------------
  const applyBgColor = (color) => {
    if (!jss.current) return;
    selectionRef.current.forEach(([r, c]) => {
      jss.current.setStyle(`${c}-${r}`, "background-color", color);
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={toolbarStyle}>

        {/* 행/열 추가 */}
        <button onClick={handleAddRow} style={blueBtn}>행 추가</button>
        <button onClick={handleAddCol} style={blueBtn}>열 추가</button>

        {/* 배경색 버튼 */}
        <button onClick={() => applyBgColor("yellow")} style={colorBtn("#fff176")}>
          노랑
        </button>
        <button onClick={() => applyBgColor("#eeeeee")} style={colorBtn("#eeeeee")}>
          연한 회색
        </button>
        <button onClick={() => applyBgColor("#d0f8ce")} style={colorBtn("#d0f8ce")}>
          연한 초록
        </button>
        <button onClick={() => applyBgColor("#fff9c4")} style={colorBtn("#fff9c4")}>
          연한 노랑
        </button>
        <button onClick={() => applyBgColor("#ffe0b2")} style={colorBtn("#ffe0b2")}>
          연한 주황
        </button>

        {/* 내보내기 + 저장 */}
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
  borderRadius: "8px",
  flexWrap: "wrap"
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

const colorBtn = (bg) => ({
  padding: "6px 10px",
  background: bg,
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer"
});
