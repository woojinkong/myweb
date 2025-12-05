// src/components/charts/VisitsChart.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function VisitsChart({ range, data }) {
  // data: [{ label: "2025-12-01", count: 10 }, ...] 형태라고 가정


 


    // 👇 날짜 라벨 만드는 로직
  const labels = data.map((d) => {
    if (range === "daily") return d.date;

    if (range === "weekly") return `${d.year}년 ${d.week}주`;

    if (range === "monthly")
      return `${d.year}-${String(d.month).padStart(2, "0")}`;

    return "";
  });

  const counts = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label:
          range === "daily"
            ? "일별 방문자 수"
            : range === "weekly"
            ? "주별 방문자 수"
            : "월별 방문자 수",
        data: counts,
        fill: false,
        borderColor: "#4CAF50",
        backgroundColor: "#4CAF50",
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 60,
          minRotation: 30,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
