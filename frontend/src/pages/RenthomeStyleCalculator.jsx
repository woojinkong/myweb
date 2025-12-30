import { useState } from "react";

function RenthomeStyleCalculator() {
  const [beforeDeposit, setBeforeDeposit] = useState("");
  const [beforeRent, setBeforeRent] = useState("");
  const [afterDeposit, setAfterDeposit] = useState("");
  const [afterRent, setAfterRent] = useState("");
  const [conversionRate, setConversionRate] = useState(4.5);

  const toNumber = (v) => Number(v.replace(/,/g, ""));

  const beforeTotal = 
    toNumber(beforeDeposit) + (toNumber(beforeRent) * 12) / (conversionRate / 100);
  const afterTotal = 
    toNumber(afterDeposit) + (toNumber(afterRent) * 12) / (conversionRate / 100);

  const increaseRate = 
    beforeTotal > 0
      ? ((afterTotal - beforeTotal) / beforeTotal) * 100
      : 0;

  return (
    <div>
      <h2>임대료 계산기 (렌트홈 스타일)</h2>
      <div>
        <input
          placeholder="변경 전 보증금"
          value={beforeDeposit}
          onChange={(e) => setBeforeDeposit(e.target.value)}
        />
        <input
          placeholder="변경 전 월세"
          value={beforeRent}
          onChange={(e) => setBeforeRent(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="변경 후 보증금"
          value={afterDeposit}
          onChange={(e) => setAfterDeposit(e.target.value)}
        />
        <input
          placeholder="변경 후 월세"
          value={afterRent}
          onChange={(e) => setAfterRent(e.target.value)}
        />
      </div>

      <div>
        <input
          type="number"
          placeholder="전월세전환율"
          value={conversionRate}
          onChange={(e) => setConversionRate(e.target.value)}
        />
      </div>

      <div>
        <p>환산보증금 변경 전: {beforeTotal.toFixed(0)}</p>
        <p>환산보증금 변경 후: {afterTotal.toFixed(0)}</p>
        <p>계산된 인상률: {increaseRate.toFixed(2)}%</p>
      </div>
    </div>
  );
}

export default RenthomeStyleCalculator;
