// src/components/RedevelopmentMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

//map-icon 수정뒷배경제거
const customMarkerIcon = L.icon({
  iconUrl: "/icons/map-icon.png", // public/icons/map-icon.png
  iconSize: [32, 32],             // 아이콘 크기
  iconAnchor: [16, 32],           // 마커 위치 중심
  popupAnchor: [0, -32],          // 팝업 위치
});

const mapStyle = {
  width: "100%",
  height: "500px", // 높이 꼭 지정해야 화면에 보임
  borderRadius: "8px",
  overflow: "hidden",
};

export default function RedevelopmentMap() {
  // 청량리역 좌표
  const cheongnyangni  = [37.580178, 127.047226]
;

  return (
    <div style={{ maxWidth: "900px", margin: "80px auto", padding: "0 16px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
        지도보기
      </h2>
      <p style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>
         지도를 확인할 수 있습니다.
      </p>

      <MapContainer
        center={cheongnyangni }
        zoom={13}
        scrollWheelZoom={true}
        style={mapStyle}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 청량리역 마커 */}
        <Marker position={cheongnyangni} icon={customMarkerIcon}>
          <Popup>청량리역</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
