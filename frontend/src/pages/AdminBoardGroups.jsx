import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { cardBase, buttons } from "../styles/common";

export default function AdminBoardGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    adminOnlyWrite: false,
    allowComment: true,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    adminOnlyWrite: false,
    allowComment: true,
  });

  // ================================
  //   관리자 체크
  // ================================
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  // ================================
  //   게시판 목록 조회
  // ================================
  const loadGroups = async () => {
    try {
      const res = await axiosInstance.get("/board-group");
      setGroups(res.data);
    } catch (err) {
      console.error("📛 게시판 목록 조회 실패:", err);
      alert("게시판 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // ================================
  //   게시판 생성
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/board-group", form);

      alert("게시판이 생성되었습니다!");
      setForm({ name: "", adminOnlyWrite: false, allowComment: true });

      loadGroups();
    } catch (err) {
      console.error("📛 게시판 생성 실패:", err);
      alert("게시판 생성에 실패했습니다.");
    }
  };

  // ================================
  //   게시판 삭제
  // ================================
  const handleDelete = async (id) => {
    const ok = window.confirm(
      "정말 삭제하시겠습니까?\n해당 게시판의 게시글도 함께 삭제될 수 있습니다."
    );
    if (!ok) return;

    try {
      await axiosInstance.delete(`/board-group/${id}`);
      alert("게시판이 삭제되었습니다.");
      loadGroups();
    } catch (err) {
      console.error("📛 게시판 삭제 실패:", err);
      alert("게시판 삭제에 실패했습니다.");
    }
  };

  // ================================
  //   수정 모드 활성화
  // ================================
  const startEdit = (g) => {
    setEditingId(g.id);
    setEditForm({
      name: g.name,
      adminOnlyWrite: g.adminOnlyWrite,
      allowComment: g.allowComment,
    });
  };

  // ================================
  //   수정 저장
  // ================================
  const submitEdit = async (id) => {
    try {
      await axiosInstance.put(`/board-group/${id}`, editForm);

      alert("수정이 완료되었습니다!");
      setEditingId(null);
      loadGroups();
    } catch (err) {
      alert("수정 실패!",err);
    }
  };

  // ================================
  //   순서 변경
  // ================================
  const moveUp = async (id) => {
    await axiosInstance.post(`/board-group/${id}/move-up`);
    loadGroups();
  };

  const moveDown = async (id) => {
    await axiosInstance.post(`/board-group/${id}/move-down`);
    loadGroups();
  };

  return (
    <div style={{ ...cardBase, maxWidth: "900px", margin: "50px auto", padding: "40px" }}>
      <h2 style={styles.title}>📋 게시판 관리</h2>

      {/* -------------------------------- */}
      {/* 새 게시판 생성 폼 */}
      {/* -------------------------------- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="게시판 이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={styles.input}
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={form.adminOnlyWrite}
            onChange={(e) => setForm({ ...form, adminOnlyWrite: e.target.checked })}
          />
          관리자만 글쓰기
        </label>

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={form.allowComment}
            onChange={(e) => setForm({ ...form, allowComment: e.target.checked })}
          />
          댓글 허용
        </label>

        <button type="submit" style={{ ...buttons.primary, marginTop: "8px" }}>
          생성하기
        </button>
      </form>

      {/* -------------------------------- */}
      {/* 게시판 목록 */}
      {/* -------------------------------- */}
      <h3 style={styles.listTitle}>📚 생성된 게시판 목록</h3>

      <ul style={styles.list}>
        {groups.map((g, index) => (
          <li key={g.id} style={styles.listItem}>
            {/* 수정 모드 */}
            {editingId === g.id ? (
              <>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={styles.inputSmall}
                />

                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={editForm.adminOnlyWrite}
                    onChange={(e) =>
                      setEditForm({ ...editForm, adminOnlyWrite: e.target.checked })
                    }
                  />
                  관리자만 글쓰기
                </label>

                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={editForm.allowComment}
                    onChange={(e) =>
                      setEditForm({ ...editForm, allowComment: e.target.checked })
                    }
                  />
                  댓글 허용
                </label>

                <button onClick={() => submitEdit(g.id)} style={styles.saveBtn}>
                  저장
                </button>

                <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>
                  취소
                </button>
              </>
            ) : (
              <>
                {/* 일반 표시 모드 */}
                <div>
                  <strong>{g.name}</strong>{" "}
                  {g.adminOnlyWrite && "👑"}
                  {!g.allowComment && " 🚫"}
                  <span style={{ color: "#555", marginLeft: "10px" }}>
                    ({g.boardCount}개 글)
                  </span>
                </div>

                <div style={styles.btnGroup}>
                  {/* 순서 변경 버튼 */}
                  <button
                    onClick={() => moveUp(g.id)}
                    disabled={index === 0}
                    style={styles.moveBtn}
                  >
                    ⬆
                  </button>
                  <button
                    onClick={() => moveDown(g.id)}
                    disabled={index === groups.length - 1}
                    style={styles.moveBtn}
                  >
                    ⬇
                  </button>

                  {/* 수정 버튼 */}
                  <button onClick={() => startEdit(g)} style={styles.editBtn}>
                    수정
                  </button>

                  {/* 삭제 버튼 */}
                  <button onClick={() => handleDelete(g.id)} style={styles.deleteBtn}>
                    삭제
                  </button>


                    

                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ================================
//   스타일 모음
// ================================
const styles = {
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    width: "300px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    display: "block",
  },
  inputSmall: {
    padding: "8px",
    width: "180px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  listTitle: {
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "600",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    marginBottom: "10px",
    padding: "12px 10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
  },
  moveBtn: {
    padding: "5px 8px",
    background: "#ededed",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  editBtn: {
    padding: "5px 10px",
    background: "#4dabf7",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
  deleteBtn: {
    padding: "5px 10px",
    background: "#e03131",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
  saveBtn: {
    padding: "5px 10px",
    background: "#51cf66",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
  cancelBtn: {
    padding: "5px 10px",
    background: "#adb5bd",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
};
