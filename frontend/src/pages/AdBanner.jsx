import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function AdBanner({ position }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const loadAd = async () => {
      try {
        const res = await axiosInstance.get(`/ads/${position}`);
        setAd(res.data);
      } catch (err) {
        console.error("광고 불러오기 실패:", err);
      }
    };

    loadAd();
  }, [position]);

  if (!ad || !ad.enabled) return null;

  return (
    <div
      className="ad-banner"
      style={{
        margin: "20px auto",
        width: ad.width || 728,
        height: ad.height || 90,
      }}
    >
      <a href={ad.linkUrl} target="_blank">
        <img
          src={ad.imageUrl}
          alt="광고"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      </a>
    </div>
  );
}
