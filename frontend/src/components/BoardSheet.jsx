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
          tableHeight: "620px",
          tableOverflow: true,
          filters: true,
          columnSorting: true,
          search: true,

          // ⭐ 툴바 전체 커스텀
          toolbar: [
            { type: "i", content: "undo" },
            { type: "i", content: "redo" },
            { type: "i", content: "bold" },
            { type: "i", content: "italic" },
            { type: "i", content: "underline" },
            { type: "color", content: "forecolor" },  // 글자 색상
            { type: "color", content: "backcolor" }, // 배경 색상
            { type: "i", content: "alignleft" },
            { type: "i", content: "aligncenter" },
            { type: "i", content: "alignright" },
            { type: "i", content: "merge" },
          ],

          allowInsertColumn: true,
          allowInsertRow: true,
          allowDeleteColumn: true,
          allowDeleteRow: true,
          copyCompatibility: true,
        });

      } catch (err) {
        console.error("시트 로드 오류:", err);
      }
    };

    loadSheet();
  }, [groupId]);

  // ⭐ 저장
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

  // ⭐ 엑셀 다운로드
  const handleExport = () => {
    if (jssInstance.current) {
      jssInstance.current.download(); // XLSX 파일 다운로드
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>📄 시트 게시판</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.exportBtn} onClick={handleExport}>
            엑셀 다운로드
          </button>

          <button style={styles.saveBtn} onClick={handleSave}>
            저장하기
          </button>
        </div>
      </div>

      <div ref={sheetRef} style={styles.sheetBox}></div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  saveBtn: {
    background: "#4CAF50",
    padding: "10px 18px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  exportBtn: {
    background: "#2196F3",
    padding: "10px 18px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  sheetBox: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "6px",
    background: "#fff",
  },
};
