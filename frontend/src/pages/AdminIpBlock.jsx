import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { cardBase } from "../styles/common";

export default function AdminIpBlock() {
  const [blocked, setBlocked] = useState([]);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    const res = await axiosInstance.get("/admin/ip-block/list");
    setBlocked(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const blockIp = async () => {
    if (!ip.trim()) return alert("IP를 입력하세요.");

    try {
      await axiosInstance.post("/admin/ip-block/block", { ip, reason });
      alert("IP 차단 완료");
      setIp("");
      setReason("");
      load();
    } catch (err) {
      alert("차단 실패");
      console.error(err);
    }
  };

  const unblockIp = async (id) => {
    if (!window.confirm("차단을 해제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/admin/ip-block/unblock/${id}`);
      load();
    } catch (err) {
      alert("해제 실패",err);
    }
  };

  return (
    <div style={{ ...cardBase, maxWidth: "800px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "20px" }}>🚫 IP 차단 관리</h2>

      <div style={{ marginBottom: "25px" }}>
        <input
          placeholder="차단할 IP 주소"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="차단 사유 (선택)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={styles.input}
        />

        <button onClick={blockIp} style={styles.addBtn}>
          차단 추가
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>IP 주소</th>
            <th>사유</th>
            <th>등록일</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {blocked.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.ip}</td>
              <td>{b.reason || "-"}</td>
              <td>{b.createdAt?.replace("T", " ").slice(0, 16)}</td>
              <td>
                <button
                  style={styles.deleteBtn}
                  onClick={() => unblockIp(b.id)}
                >
                  해제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  input: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginRight: "8px",
  },
  addBtn: {
    padding: "8px 14px",
    background: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  deleteBtn: {
    padding: "4px 10px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
