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
    writePoint: 0,
    adminOnly: false,
    sheetEnabled: false,

    passwordEnabled: false,
    password: "",
    passwordConfirm: "",

    type: "BOARD",
    linkUrl: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    adminOnlyWrite: false,
    allowComment: true,
    writePoint: 0,
    adminOnly: false,
    sheetEnabled: false,

    passwordEnabled: false,
    password: "",
    passwordConfirm: "",

    type: "BOARD",
    linkUrl: "",
  });

  /* ===============================
      관리자 체크
  =============================== */
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  /* ===============================
      게시판 목록 조회
  =============================== */
  const loadGroups = async () => {
    try {
      const res = await axiosInstance.get("/board-group");
      setGroups(res.data);
    } catch (err) {
      console.error("📛 게시판 목록 조회 실패:", err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  /* ===============================
      게시판 생성
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.passwordEnabled) {
      if (!form.password || form.password !== form.passwordConfirm) {
        alert("비밀번호가 비어있거나 일치하지 않습니다.");
        return;
      }
    }

    if (form.type === "LINK" && !form.linkUrl) {
      alert("외부 링크 주소를 입력하세요.");
      return;
    }

    const payload = {
      name: form.name,
      adminOnlyWrite: form.adminOnlyWrite,
      allowComment: form.allowComment,
      writePoint: form.writePoint,
      adminOnly: form.adminOnly,
      sheetEnabled: form.sheetEnabled,
      passwordEnabled: form.passwordEnabled,
      password: form.passwordEnabled ? form.password : null,

      type: form.type,
      linkUrl: form.type === "LINK" ? form.linkUrl : null,
    };

    try {
      await axiosInstance.post("/board-group", payload);
      alert("게시판이 생성되었습니다!");
      setForm({
        name: "",
        adminOnlyWrite: false,
        allowComment: true,
        writePoint: 0,
        adminOnly: false,
        sheetEnabled: false,
        passwordEnabled: false,
        password: "",
        passwordConfirm: "",
        type: "BOARD",
        linkUrl: "",
      });
      loadGroups();
    } catch (err) {
      alert("게시판 생성 실패",err);
    }
  };

  /* ===============================
      구분선 생성
  =============================== */
  const createDivider = async () => {
    const title = prompt("구분선 제목을 입력하세요:");
    if (!title) return;

    try {
      await axiosInstance.post("/board-group", {
        name: title,
        type: "DIVIDER",
        adminOnlyWrite: false,
        allowComment: false,
      });
      loadGroups();
    } catch {
      alert("구분선 생성 실패");
    }
  };

  /* ===============================
      수정 모드
  =============================== */
  const startEdit = (g) => {
    setEditingId(g.id);
    setEditForm({
      name: g.name,
      adminOnlyWrite: g.adminOnlyWrite,
      allowComment: g.allowComment,
      writePoint: g.writePoint,
      adminOnly: g.adminOnly,
      sheetEnabled: g.sheetEnabled,
      passwordEnabled: g.passwordEnabled,
      password: "",
      passwordConfirm: "",
      type: g.type || "BOARD",
      linkUrl: g.linkUrl || "",
    });
  };

  const submitEdit = async (id) => {

  /* =========================
     1. 비밀번호 검증 (먼저)
  ========================= */
  if (editForm.passwordEnabled) {
    // 비밀번호 변경을 시도한 경우만 검증
    if (editForm.password || editForm.passwordConfirm) {
      if (
        !editForm.password ||
        editForm.password !== editForm.passwordConfirm
      ) {
        alert("비밀번호가 비어있거나 일치하지 않습니다.");
        return;
      }
    }
  }

    // 🔗 LINK 게시판 검증
  if (editForm.type === "LINK" && !editForm.linkUrl) {
    alert("외부 링크 주소를 입력하세요.");
    return;
  }


  /* =========================
     2. 기본 payload
  ========================= */
  const payload = {
    name: editForm.name,
    adminOnlyWrite: editForm.adminOnlyWrite,
    allowComment: editForm.allowComment,
    writePoint: editForm.writePoint,
    adminOnly: editForm.adminOnly,
    sheetEnabled: editForm.sheetEnabled,
    passwordEnabled: editForm.passwordEnabled,

    type: editForm.type,
   linkUrl: editForm.type === "LINK" ? editForm.linkUrl : null,
  };

  /* =========================
     3. 비밀번호 정책 반영
  ========================= */
  if (!editForm.passwordEnabled) {
    // 비밀번호 사용 OFF → 제거
    payload.password = null;
  } else if (editForm.password) {
    // 비밀번호 변경
    payload.password = editForm.password;
  }
  // else:
  // passwordEnabled = true && password 없음
  // → 기존 비밀번호 유지 (아무것도 보내지 않음)

  /* =========================
     4. 전송
  ========================= */
  try {
    await axiosInstance.put(`/board-group/${id}`, payload);
    alert("수정 완료");
    setEditingId(null);
    loadGroups();
  } catch (err) {
    alert("수정 실패",err);
  }
};


  /* ===============================
      순서 변경
  =============================== */
  const moveUp = async (id) => {
    await axiosInstance.post(`/board-group/${id}/move-up`);
    loadGroups();
  };

  const moveDown = async (id) => {
    await axiosInstance.post(`/board-group/${id}/move-down`);
    loadGroups();
  };

  /* ===============================
      삭제
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axiosInstance.delete(`/board-group/${id}`);
    loadGroups();
  };

  return (
    <div style={{ ...cardBase, maxWidth: "900px", margin: "50px auto", padding: "40px" }}>
      <h2 style={styles.title}>📋 게시판 관리</h2>

      {/* 생성 */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="게시판 이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={styles.input}
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={form.type === "LINK"}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.checked ? "LINK" : "BOARD",
                linkUrl: "",
                passwordEnabled: false,
                sheetEnabled: false,
              })
            }

          />
          외부 링크 게시판
        </label>

        {form.type === "LINK" && (
          <input
            type="url"
            placeholder="https://example.com"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            required
            style={styles.input}
          />
        )}

        <button type="submit" style={buttons.primary}>게시판 생성</button>

        <div style={{ marginTop: "10px", cursor: "pointer" }} onClick={createDivider}>
          ➕ 구분선 추가
        </div>
      </form>

      {/* 목록 */}
      <ul style={styles.list}>
        {groups.map((g, index) => (
          <li key={g.id} style={styles.listItem}>
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
                    checked={editForm.type === "LINK"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        type: e.target.checked ? "LINK" : "BOARD",
                        linkUrl: "",
                      })
                    }
                  />
                  외부 링크 게시판
                </label>

                {editForm.type === "LINK" && (
                  <input
                    type="url"
                    value={editForm.linkUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, linkUrl: e.target.value })
                    }
                    style={styles.inputSmall}
                  />
                )}

                <button onClick={() => submitEdit(g.id)} style={styles.saveBtn}>저장</button>
                <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>취소</button>
              </>
            ) : (
              <>
                <strong>{g.name}</strong>
                {g.type === "LINK" && " 🔗"}
                <div style={styles.btnGroup}>
                  <button onClick={() => moveUp(g.id)} disabled={index === 0}>⬆</button>
                  <button onClick={() => moveDown(g.id)} disabled={index === groups.length - 1}>⬇</button>
                  <button onClick={() => startEdit(g)}>수정</button>
                  <button onClick={() => handleDelete(g.id)}>삭제</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ===============================
    스타일
=============================== */
const styles = {
  title: { fontSize: "22px", marginBottom: "20px" },
  input: { padding: "10px", width: "300px", marginBottom: "10px" },
  inputSmall: { padding: "8px", width: "220px" },
  label: { display: "flex", gap: "6px", marginBottom: "8px" },
  list: { listStyle: "none", padding: 0 },
  listItem: {
    border: "1px solid #ddd",
    padding: "12px",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
  btnGroup: { display: "flex", gap: "6px" },
  saveBtn: { background: "#51cf66", color: "#fff" },
  cancelBtn: { background: "#adb5bd", color: "#fff" },
};
