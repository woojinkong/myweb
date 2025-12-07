import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";

export default function BoardSheet() {
  const { groupId } = useParams();

  const [groupName, setGroupName] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  /* ------------------------------------------------------
    1) 2D 배열 → React Data Grid 구조로 변환
  ------------------------------------------------------ */
  const convert2DToGrid = (data2d) => {
    if (!data2d || data2d.length === 0) {
      // 기본 10x30 시트 제공
      const defaultCols = [...Array(10)].map((_, i) => ({
        key: `col${i}`,
        name: `${i + 1}열`,
        editable: true
      }));

      const defaultRows = [...Array(30)].map((_, r) => {
        const obj = { id: r };
        for (let c = 0; c < 10; c++) obj[`col${c}`] = "";
        return obj;
      });

      return { columns: defaultCols, rows: defaultRows };
    }

    const colCount = data2d[0].length;

    const cols = [...Array(colCount)].map((_, i) => ({
      key: `col${i}`,
      name: `${i + 1}열`,
      editable: true
    }));

    const newRows = data2d.map((rowArr, rowIndex) => {
      const obj = { id: rowIndex };
      rowArr.forEach((v, colIndex) => {
        obj[`col${colIndex}`] = v ?? "";
      });
      return obj;
    });

    return { columns: cols, rows: newRows };
  };

  /* ------------------------------------------------------
    2) React Data Grid rows → 2D 배열로 변환 (저장)
  ------------------------------------------------------ */
  const convertGridTo2D = () => {
    const result = rows.map((row) =>
      columns.map((c) => row[c.key] ?? "")
    );
    return result;
  };

  /* ------------------------------------------------------
    3) 초기 데이터 로드
  ------------------------------------------------------ */
  useEffect(() => {
    const load = async () => {
      try {
        const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
        setGroupName(groupRes.data.name);

        const res = await axiosInstance.get(`/sheet/${groupId}`);
        const sheetJson = res.data.sheetData ? JSON.parse(res.data.sheetData) : [];

        const converted = convert2DToGrid(sheetJson);
        setColumns(converted.columns);
        setRows(converted.rows);

      } catch (err) {
        console.error("시트 불러오기 오류:", err);
      }
    };
    load();
  }, [groupId]);

  /* ------------------------------------------------------
    4) 행 추가
  ------------------------------------------------------ */
  const addRow = () => {
    const newRow = { id: rows.length };
    columns.forEach((c) => {
      newRow[c.key] = "";
    });
    setRows([...rows, newRow]);
  };

  /* ------------------------------------------------------
    5) 열 추가
  ------------------------------------------------------ */
  const addColumn = () => {
    const newColIndex = columns.length;
    const newKey = `col${newColIndex}`;

    const newCol = { key: newKey, name: `${newColIndex + 1}열`, editable: true };
    const newColumns = [...columns, newCol];

    const newRows = rows.map((r) => ({
      ...r,
      [newKey]: ""
    }));

    setColumns(newColumns);
    setRows(newRows);
  };

  /* ------------------------------------------------------
    6) 저장 (rows → 2D 변환 후 백엔드 전송)
  ------------------------------------------------------ */
  const saveSheet = async () => {
    const array2d = convertGridTo2D();
    try {
      await axiosInstance.post(`/sheet/${groupId}`, JSON.stringify(array2d), {
        headers: { "Content-Type": "application/json" }
      });
      alert("저장 완료!");
    } catch (err) {
      alert("저장 실패",err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📄 {groupName}</h2>

      {/* 커스텀 툴바 */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          padding: "10px",
          background: "#f7f7f7",
          borderRadius: "6px",
          border: "1px solid #ddd"
        }}
      >
        <button onClick={addRow}>행 추가</button>
        <button onClick={addColumn}>열 추가</button>
        <button onClick={saveSheet}>저장</button>
      </div>

      {/* React Data Grid */}
      <div style={{ height: "650px" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={setRows}
        />
      </div>
    </div>
  );
}
