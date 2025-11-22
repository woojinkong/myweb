import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function AdminAdSetting() {
  const [ads, setAds] = useState([]);

  const positions = ["AD_TOP", "AD_BOTTOM"];

  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        positions.map(async (p) => {
          const res = await axiosInstance.get(`/ads/${p}`);
          return normalizeAd(res.data, p);
        })
      );
      setAds(results);
    };

    load();
  }, []);

  const normalizeAd = (data, position) => ({
    position,
    enabled: data?.enabled ?? false,
    imageUrl: data?.imageUrl ?? "",
    linkUrl: data?.linkUrl ?? "",
    width: data?.width ?? 728,
    height: data?.height ?? 90,
  });

  const update = async (ad) => {
    try {
      await axiosInstance.post("/ads/update", ad);
      alert("저장되었습니다.");
    } catch (e) {
      alert("저장 실패: 권한이 없거나 서버 오류");
      console.error(e);
    }
  };

  const handleChange = (i, field, value) => {
    const next = [...ads];
    next[i][field] = value;
    setAds(next);
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>광고 설정 관리</h2>

      {ads.map((ad, i) => (
        <div key={ad.position} style={styles.card}>
          <h3 style={styles.cardTitle}>
            {ad.position === "AD_TOP" ? "본문 상단 광고" : "본문 하단 광고"}
          </h3>

          {/* 광고 활성화 */}
          <div style={styles.row}>
            <label style={styles.label}>광고 활성화</label>
            <input
              type="checkbox"
              checked={ad.enabled}
              onChange={(e) => handleChange(i, "enabled", e.target.checked)}
              style={styles.checkbox}
            />
          </div>

          {/* 이미지 URL */}
          <div style={styles.row}>
            <label style={styles.label}>이미지 URL</label>
            <input
              type="text"
              value={ad.imageUrl}
              onChange={(e) => handleChange(i, "imageUrl", e.target.value)}
              style={styles.input}
              placeholder="ex) https://example.com/ad-banner.jpg"
            />
          </div>

          {/* 링크 URL */}
          <div style={styles.row}>
            <label style={styles.label}>링크 URL</label>
            <input
              type="text"
              value={ad.linkUrl}
              onChange={(e) => handleChange(i, "linkUrl", e.target.value)}
              style={styles.input}
              placeholder="클릭 시 이동할 URL"
            />
          </div>

          {/* 광고 크기 */}
          <div style={styles.row}>
            <label style={styles.label}>가로(px)</label>
            <input
              type="number"
              value={ad.width}
              onChange={(e) => handleChange(i, "width", e.target.value)}
              style={styles.inputShort}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>세로(px)</label>
            <input
              type="number"
              value={ad.height}
              onChange={(e) => handleChange(i, "height", e.target.value)}
              style={styles.inputShort}
            />
          </div>

          {/* 저장 버튼 */}
          <button style={styles.saveBtn} onClick={() => update(ad)}>
            저장
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================
   ADMIN 스타일 object
============================ */
const styles = {
  page: {
    maxWidth: "760px",
    margin: "40px auto",
    padding: "10px",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginBottom: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "18px",
  },

  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: "14px",
  },

  label: {
    width: "120px",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  inputShort: {
    width: "120px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  checkbox: {
    transform: "scale(1.2)",
  },

  saveBtn: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
