import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function BoardSheet() {
  const { groupId } = useParams();
  const sheetRef = useRef(null);
  const jssInstance = useRef(null);

  useEffect(() => {
    const loadSheet = async () => {
      try {
        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        if (sheetRef.current) sheetRef.current.innerHTML = "";

        jssInstance.current = jspreadsheet(sheetRef.current, {
          data: sheetJson,
          minDimensions: [10, 30],
          defaultColWidth: 120,
          tableOverflow: true,
          tableHeight: "620px",

          filters: true,
          columnSorting: true,
          search: true,

          toolbar: [
            { type: "button", content: "undo", onclick: () => jssInstance.current.undo() },
            { type: "button", content: "redo", onclick: () => jssInstance.current.redo() },

            { type: "button", content: "bold", onclick: () => jssInstance.current.setStyle("font-weight", "bold") },
            { type: "button", content: "italic", onclick: () => jssInstance.current.setStyle("font-style", "italic") },
            { type: "button", content: "underline", onclick: () => jssInstance.current.setStyle("text-decoration", "underline") },

            { type: "color", content: "forecolor" },
            { type: "color", content: "backcolor" },
          ],

          allowInsertColumn: true,
          allowInsertRow: true,
          allowDeleteColumn: true,
          allowDeleteRow: true,
        });
      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  const handleSave = async () => {
    if (!jssInstance.current) return;

    const jsonData = JSON.stringify(jssInstance.current.getJson());
    try {
      await axiosInstance.post(`/sheet/${groupId}`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패!");
      console.error(err);
    }
  };

  const handleExport = () => {
    if (jssInstance.current) jssInstance.current.download();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 시트 게시판</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <button onClick={handleExport} style={styles.exportBtn}>엑셀 다운로드</button>
        <button onClick={handleSave} style={styles.saveBtn}>저장하기</button>
      </div>

      <div ref={sheetRef}></div>
    </div>
  );
}

const styles = {
  saveBtn: {
    padding: "10px 16px",
    background: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  exportBtn: {
    padding: "10px 16px",
    background: "#2196f3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};
