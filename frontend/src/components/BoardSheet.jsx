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
  const [fontSize, setFontSize] = useState("14");

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

  const getSelectedCells = () => {
    return selectionRef.current || [];
  };

  // ⭐ Bold
  const setBold = () => {
    const cells = getSelectedCells();
    cells.forEach(([r, c]) => {
      jss.current.setStyle(r, c, "font-weight", "bold");
    });
  };

  // ⭐ 글자색
  const changeTextColor = (color) => {
    const cells = getSelectedCells();
    cells.forEach(([r, c]) => {
      jss.current.setStyle(r, c, "color", color);
    });
  };

  // ⭐ 배경색
  const changeBgColor = (color) => {
    const cells = getSelectedCells();
    cells.forEach(([r, c]) => {
      jss.current.setStyle(r, c, "background-color", color);
    });
  };

  // ⭐ 폰트 크기
  const changeFontSize = () => {
    const px = fontSize.trim();
    if (!px) return;

    const cells = getSelectedCells();
    cells.forEach(([r, c]) => {
      jss.current.setStyle(r, c, "font-size", `${px}px`);
    });
  };

  // ⭐ 저장 기능
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

  // ⭐ 엑셀 다운로드
  const handleExport = () => {
    if (jss.current) jss.current.download();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={setBold}>Bold</button>

        <label style={labelStyle}>글자색</label>
        <input type="color" style={colorPickerStyle} onChange={(e) => changeTextColor(e.target.value)} />

        <label style={labelStyle}>배경색</label>
        <input type="color" style={colorPickerStyle} onChange={(e) => changeBgColor(e.target.value)} />

        <label style={labelStyle}>폰트(px)</label>
        <input type="number" min="8" max="40" value={fontSize}
               style={numberInputStyle}
               onChange={(e) => setFontSize(e.target.value)} />

        <button style={btnStyle} onClick={changeFontSize}>적용</button>

        <button onClick={handleExport} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={greenBtn}>저장</button>
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

/* =========================== 스타일 ====================== */

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

const btnStyle = {
  padding: "6px 10px",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer"
};

const labelStyle = { fontSize: "14px" };

const colorPickerStyle = {
  width: "32px",
  height: "32px",
  border: "none",
  cursor: "pointer"
};

const numberInputStyle = {
  width: "60px",
  padding: "4px",
  border: "1px solid #ccc",
  borderRadius: "4px"
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
