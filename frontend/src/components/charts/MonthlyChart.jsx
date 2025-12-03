import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MonthlyChart({ visits, signups }) {
  const labels = visits.map((v) => v[0]); // "2025-06" 형태
  const visitCounts = visits.map((v) => v[1]);
  const signupCounts = signups.map((s) => s[1]);

  const data = {
    labels,
    datasets: [
      {
        label: "월별 방문자",
        data: visitCounts,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        tension: 0.3
      },
      {
        label: "월별 가입자",
        data: signupCounts,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.3)",
        tension: 0.3
      }
    ]
  };

  return <Line data={data} />;
}
