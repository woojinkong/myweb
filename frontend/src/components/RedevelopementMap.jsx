// src/components/RedevelopmentMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const mapStyle = {
  width: "100%",
  height: "500px", // 높이 꼭 지정해야 화면에 보임
  borderRadius: "8px",
  overflow: "hidden",
};

export default function RedevelopmentMap() {
  // 서울 시청 근처 좌표 (원하면 청량리 쪽 좌표로 바꿔도 됨)
  const seoulCenter = [37.5665, 126.9780];

  return (
    <div style={{ maxWidth: "900px", margin: "80px auto", padding: "0 16px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
        지도보기
      </h2>
      <p style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>
         지도를 확인할 수 있습니다.
      </p>

      <MapContainer
        center={seoulCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={mapStyle}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 테스트용 마커 하나 */}
        <Marker position={seoulCenter}>
          <Popup>
            서울중심마커
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
