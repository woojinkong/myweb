import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { cardBase, buttons } from "../styles/common";

/* ===============================
   기본 폼
=============================== */
const defaultForm = {
  name: "",
  type: "BOARD",          // BOARD | LINK | DIVIDER
  linkUrl: "",

  adminOnly: false,
  adminOnlyWrite: false,
  allowComment: true,
  sheetEnabled: false,
  writePoint: 0,

  passwordEnabled: false,
  password: "",
  passwordConfirm: "",
};

export default function AdminBoardGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const isEditMode = editingId !== null;

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
      목록 조회
  =============================== */
  const loadGroups = async () => {
    const res = await axiosInstance.get("/board-group");
    setGroups(res.data);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  /* ===============================
      비밀번호 검증
  =============================== */
  const validatePassword = (f) => {
    if (!f.passwordEnabled) return true;
    if (!f.password || f.password !== f.passwordConfirm) {
      alert("비밀번호가 비어있거나 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  /* ===============================
      구분선 생성
  =============================== */
  const createDivider = async () => {
    if (isEditMode) return;

    const title = prompt("구분선 제목을 입력하세요:");
    if (!title) return;

    await axiosInstance.post("/board-group", {
      name: title,
      type: "DIVIDER",
    });

    loadGroups();
  };

  /* ===============================
      생성 / 수정
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(form)) return;

    if (form.type === "LINK" && !form.linkUrl) {
      alert("외부 링크 주소를 입력하세요.");
      return;
    }

    const payload = {
      ...form,
      password: form.passwordEnabled ? form.password : null,
      linkUrl: form.type === "LINK" ? form.linkUrl : null,
    };

    if (editingId) {
      await axiosInstance.put(`/board-group/${editingId}`, payload);
      alert("게시판 수정 완료");
      setEditingId(null);
    } else {
      await axiosInstance.post("/board-group", payload);
      alert("게시판 생성 완료");
    }

    setForm(defaultForm);
    loadGroups();
  };

  /* ===============================
      수정 시작
  =============================== */
  const startEdit = (g) => {
    setEditingId(g.id);
    setForm({
      ...defaultForm,
      ...g,
      password: "",
      passwordConfirm: "",
    });
  };

  /* ===============================
      순서 / 삭제
  =============================== */
  const move = async (id, up) => {
    if (isEditMode) return;
    await axiosInstance.post(
      `/board-group/${id}/${up ? "move-up" : "move-down"}`
    );
    loadGroups();
  };

  const remove = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await axiosInstance.delete(`/board-group/${id}`);
    loadGroups();
  };



  const removeAllBoardsInGroup = async (groupId, groupName) => {
  const ok = window.confirm(
    `[${groupName}] 게시판의 게시글을 전부 삭제할까요?\n되돌릴 수 없습니다.`
  );
  if (!ok) return;

  try {
    const res = await axiosInstance.delete(`/admin/board-group/${groupId}/boards`);
    alert(`삭제 완료: ${res.data?.deletedCount ?? 0}개`);
  } catch (err) {
    alert("삭제 중 오류가 발생했습니다.");
    console.error(err);
  }
};


  /* ===============================
      렌더
  =============================== */
  return (
    <div style={{ ...cardBase, maxWidth: 900, margin: "50px auto", padding: 40 }}>
      <h2 style={styles.title}>📋 게시판 관리</h2>

      {/* 생성 / 수정 폼 */}
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="게시판 이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={form.type === "LINK"}
            onChange={(e) =>
              setForm({
                ...defaultForm,
                type: e.target.checked ? "LINK" : "BOARD",
              })
            }
          />
          외부 링크 게시판
        </label>

        {form.type === "LINK" && (
          <input
            style={styles.input}
            placeholder="https://example.com"
            value={form.linkUrl}
            onChange={(e) =>
              setForm({ ...form, linkUrl: e.target.value })
            }
          />
        )}

        {form.type === "BOARD" && (
          <>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={form.adminOnly}
                onChange={(e) =>
                  setForm({ ...form, adminOnly: e.target.checked })
                }
              />
              관리자만 보기
            </label>

            <label style={styles.label}>
              <input
                type="checkbox"
                checked={form.adminOnlyWrite}
                onChange={(e) =>
                  setForm({ ...form, adminOnlyWrite: e.target.checked })
                }
              />
              관리자만 글쓰기
            </label>

            <label style={styles.label}>
              <input
                type="checkbox"
                checked={form.allowComment}
                onChange={(e) =>
                  setForm({ ...form, allowComment: e.target.checked })
                }
              />
              댓글 허용
            </label>

            <label style={styles.label}>
              <input
                type="checkbox"
                checked={form.sheetEnabled}
                onChange={(e) =>
                  setForm({ ...form, sheetEnabled: e.target.checked })
                }
              />
              시트 게시판
            </label>

            <input
              type="number"
              style={styles.inputSmall}
              placeholder="필요 포인트"
              value={form.writePoint}
              onChange={(e) =>
                setForm({ ...form, writePoint: Number(e.target.value) })
              }
            />

            <label style={styles.label}>
              <input
                type="checkbox"
                checked={form.passwordEnabled}
                onChange={(e) =>
                  setForm({ ...form, passwordEnabled: e.target.checked })
                }
              />
              게시판 비밀번호
            </label>

            {form.passwordEnabled && (
              <>
                <input
                  type="password"
                  style={styles.inputSmall}
                  placeholder="비밀번호"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <input
                  type="password"
                  style={styles.inputSmall}
                  placeholder="비밀번호 확인"
                  onChange={(e) =>
                    setForm({ ...form, passwordConfirm: e.target.value })
                  }
                />
              </>
            )}
          </>
        )}

        <button type="submit" style={buttons.primary}>
          {editingId ? "게시판 수정" : "게시판 생성"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(defaultForm);
            }}
          >
            수정 취소
          </button>
        )}
      </form>

      <hr style={{ margin: "24px 0" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          disabled={isEditMode}
          onClick={createDivider}
          style={{
            background: "#f1f3f5",
            border: "1px dashed #adb5bd",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#495057",
            fontSize: "13px",
          }}
        >
          ➕ 구분선 추가
        </button>
      </div>

      {/* 목록 */}
      <ul style={styles.list}>
        {groups.map((g, i) => (
          <li key={g.id} style={styles.listItem}>
           {g.type === "DIVIDER" ? (
              <>
                <strong style={{ color: "#777" }}>── {g.name} ──</strong>
                <div style={styles.btnGroup}>
                  <button
                    onClick={() => move(g.id, true)}
                    disabled={i === 0 || isEditMode}
                  >
                    ⬆
                  </button>
                  <button
                    onClick={() => move(g.id, false)}
                    disabled={i === groups.length - 1 || isEditMode}
                  >
                    ⬇
                  </button>
                  <button onClick={() => startEdit(g)}>수정</button>
                  <button onClick={() => remove(g.id)}>삭제</button>
                </div>
              </>
            ) : (
              <>
                <strong>{g.name}</strong>
                <div style={styles.btnGroup}>
                  <button onClick={() => move(g.id, true)} disabled={i === 0 || isEditMode}>⬆</button>
                  <button onClick={() => move(g.id, false)} disabled={i === groups.length - 1 || isEditMode}>⬇</button>
                  <button onClick={() => startEdit(g)}>수정</button>
                  {g.type === "BOARD" && (
                    <button
                      type="button"
                      onClick={() => removeAllBoardsInGroup(g.id, g.name)}
                      disabled={isEditMode}
                      style={{ background: "#ffe3e3", border: "1px solid #ffa8a8" }}
                    >
                      글 전체삭제
                    </button>
                  )}
                  <button onClick={() => remove(g.id)}>삭제</button>
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
  inputSmall: { padding: "8px", width: "220px", marginBottom: "8px" },
  label: { display: "flex", gap: "6px", marginBottom: "8px" },
  list: { listStyle: "none", padding: 0, marginTop: "30px" },
  listItem: {
    border: "1px solid #ddd",
    padding: "12px",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnGroup: { display: "flex", gap: "6px" },
};
