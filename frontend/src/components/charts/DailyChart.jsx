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

export default function DailyChart({ visits, signups }) {
  const labels = visits.map((v) => v[0]); // 날짜
  const visitCounts = visits.map((v) => v[1]);
  const signupCounts = signups.map((s) => s[1]);

  const data = {
    labels,
    datasets: [
      {
        label: "일별 방문자",
        data: visitCounts,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        tension: 0.3
      },
      {
        label: "일별 가입자",
        data: signupCounts,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        tension: 0.3
      }
    ]
  };

  return <Line data={data} />;
}
