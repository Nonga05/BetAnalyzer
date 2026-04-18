import { generatePicks } from "../analysis";

const match = {
  homeTeam: "Manchester City",
  awayTeam: "Brighton",
  homeWinProb: 0.68,
  drawProb: 0.20,
  awayWinProb: 0.12,
  expectedGoals: 2.9,
  bttsProb: 0.57,
};

export default function Home() {
  const picks = generatePicks(match);

  return (
    <main style={{ padding: 20 }}>
      <h1>BetAnalyzer PRO</h1>

      <h2>Apostas recomendadas</h2>

      {picks.map((pick, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>{pick.market}</h3>
          <p><strong>Entrada:</strong> {pick.suggestion}</p>
          <p><strong>Confiança:</strong> {pick.confidence}%</p>
          <p>{pick.reason}</p>
        </div>
      ))}
    </main>
  );
}
