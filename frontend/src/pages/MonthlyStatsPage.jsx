import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import MonthlyChart from "../../components/charts/MonthlyChart";

export default function MonthlyStatsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axiosInstance.get("/admin/stats/monthly");
      setData(res.data);
    };
    load();
  }, []);

  if (!data) return <p style={{ padding: "20px" }}>데이터 불러오는 중...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "20px" }}>📈 월별 통계</h2>
      <MonthlyChart visits={data.visits} signups={data.signups} />
    </div>
  );
}
