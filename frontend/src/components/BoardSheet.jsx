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
  const editingCell = useRef({ x: null, y: null });

  const popupRef = useRef(null);
  const [groupName, setGroupName] = useState("");

  // ⭐ 숫자 좌표 → A1 형태 변환
  const toCellName = (col, row) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let colName = "";

    while (col >= 0) {
      colName = letters[col % 26] + colName;
      col = Math.floor(col / 26) - 1;
    }
    return colName + (row + 1);
  };

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

          // 선택된 셀 정보 저장
          onselection: (instance, x1, y1, x2, y2) => {
            const selected = [];
            for (let r = y1; r <= y2; r++) {
              for (let c = x1; c <= x2; c++) {
                selected.push([r, c]);
              }
            }
            selectionRef.current = selected;
          },

          // ⭐ 더블클릭 → 팝업 열기
          oncellDblClick: (instance, cell, x, y) => {
            const cellName = toCellName(x, y);
            const value = instance.getValue(cellName);
            const rect = cell.getBoundingClientRect();

            editingCell.current = { x, y }; // 현재 셀 기억

            const popup = popupRef.current;
            const textarea = document.getElementById("popupTextarea");

            textarea.value = value ?? "";

            popup.style.left = rect.left + "px";
            popup.style.top = rect.top + "px";
            popup.style.display = "block";
          }
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // ---------------------------------------
  // ⭐ 팝업에서 저장 버튼 클릭 → 셀 수정
  // ---------------------------------------
  useEffect(() => {
    const popup = popupRef.current;

    const saveBtn = document.getElementById("popupSaveBtn");
    const textarea = document.getElementById("popupTextarea");

    if (!saveBtn) return;

    const handleSave = () => {
      if (!jss.current) return;

      const { x, y } = editingCell.current;
      if (x === null || y === null) return;

      const cellName = toCellName(x, y);
      const newValue = textarea.value;

      jss.current.setValue(cellName, newValue);
      popup.style.display = "none";
    };

    saveBtn.addEventListener("click", handleSave);

    return () => saveBtn.removeEventListener("click", handleSave);
  }, []);

  // ---------------------------------------
  // ⭐ 저장(data + style)
  // ---------------------------------------
  const handleSaveSheet = async () => {
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
  // ⭐ 행/열 추가
  // ---------------------------------------
  const handleAddRow = () => jss.current?.insertRow();
  const handleAddCol = () => jss.current?.insertColumn();

  // ---------------------------------------
  // ⭐ 배경색 적용
  // ---------------------------------------
  const applyBgColor = (color) => {
    if (!jss.current) return;

    selectionRef.current.forEach(([r, c]) => {
      const cell = toCellName(c, r);
      jss.current.setStyle(cell, "background-color", color);
    });
  };

  // ---------------------------------------
  // ⭐ 시트 다운로드
  // ---------------------------------------
  const handleExport = () => jss.current?.download();

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName || "시트"}</h2>

      <div style={toolbarStyle}>
        <button onClick={handleAddRow} style={blueBtn}>행 추가</button>
        <button onClick={handleAddCol} style={blueBtn}>열 추가</button>

        <button onClick={() => applyBgColor("#fff176")} style={colorBtn("#fff176")}>노랑</button>
        <button onClick={() => applyBgColor("#eeeeee")} style={colorBtn("#eeeeee")}>연회색</button>
        <button onClick={() => applyBgColor("#d0f8ce")} style={colorBtn("#d0f8ce")}>연초록</button>
        <button onClick={() => applyBgColor("#fff9c4")} style={colorBtn("#fff9c4")}>연노랑</button>
        <button onClick={() => applyBgColor("#ffe0b2")} style={colorBtn("#ffe0b2")}>연주황</button>

        <button onClick={handleExport} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={handleSaveSheet} style={greenBtn}>저장</button>
      </div>

      {/* ⭐ 셀 팝업 */}
      <div ref={popupRef} style={popupStyle} onClick={(e) => e.stopPropagation()}>
        <textarea
          id="popupTextarea"
          style={{
            width: "260px",
            height: "120px",
            padding: "8px",
            resize: "none",
            borderRadius: "6px",
            border: "1px solid #bbb",
            fontSize: "14px"
          }}
        ></textarea>

        <button
          id="popupSaveBtn"
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            background: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          저장
        </button>
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>
    </div>
  );
}

const popupStyle = {
  display: "none",
  position: "fixed",
  padding: "12px",
  background: "#fff",
  border: "1px solid #aaa",
  borderRadius: "8px",
  zIndex: 9999,
  maxWidth: "300px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.25)"
};

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
