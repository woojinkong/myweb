import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

import Modal from "../components/Modal";   // ⭐ 네가 제공한 모달

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jss = useRef(null);

  const selectionRef = useRef([]);
  const [groupName, setGroupName] = useState("");

  // ⭐ 모달 관련 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState({ x: null, y: null });
  const [editingValue, setEditingValue] = useState("");

  // ---------------------------------------
  // A1 표기법 변환
  // ---------------------------------------
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

          // ⭐ 선택 좌표 저장
          onselection: (instance, x1, y1, x2, y2) => {
            const selected = [];
            for (let r = y1; r <= y2; r++) {
              for (let c = x1; c <= x2; c++) {
                selected.push([r, c]);
              }
            }
            selectionRef.current = selected;
          },

          // ⭐ 더블클릭 → 모달 오픈
          oncellDblClick: (instance, cell, x, y) => {
            const cellName = toCellName(x, y);
            const value = instance.getValue(cellName) ?? "";

            setEditingCell({ x, y });
            setEditingValue(value);

            setModalOpen(true);
          },
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // ---------------------------------------
  // ⭐ 팝업(모달)에서 저장
  // ---------------------------------------
  const saveEdit = () => {
    const { x, y } = editingCell;
    if (x === null || y === null) return;

    const cellName = toCellName(x, y);
    jss.current.setValue(cellName, editingValue);

    setModalOpen(false);
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
  // ⭐ 저장(data + style)
  // ---------------------------------------
  const saveSheet = async () => {
    const data = jss.current.getJson();
    const style = jss.current.getStyle();

    const saveObj = { data, style };

    try {
      await axiosInstance.post(
        `/sheet/${groupId}`,
        JSON.stringify(saveObj),
        { headers: { "Content-Type": "application/json" } }
      );
      alert("저장 완료!");
    } catch {
      alert("저장 실패!");
    }
  };

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

        <button onClick={() => jss.current?.download()} style={blueBtn}>엑셀 다운로드</button>
        <button onClick={saveSheet} style={greenBtn}>저장</button>
      </div>

      <div className="jss-container">
        <div ref={sheetRef}></div>
      </div>

      {/* ⭐ 셀 내용 수정 모달 */}
      {modalOpen && (
        <Modal
          title="셀 내용 수정"
          onClose={() => setModalOpen(false)}
          content={
            <div>
              <textarea
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={{
                  width: "100%",
                  height: "150px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
              />

              <button
                onClick={saveEdit}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  background: "#28a745",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                저장
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}


// -----------------------------------------------------
// 스타일
// -----------------------------------------------------
const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
  background: "#f5f5f5",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  flexWrap: "wrap",
};

const blueBtn = {
  padding: "6px 12px",
  background: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const greenBtn = {
  padding: "6px 12px",
  background: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const colorBtn = (bg) => ({
  padding: "6px 10px",
  background: bg,
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
});
