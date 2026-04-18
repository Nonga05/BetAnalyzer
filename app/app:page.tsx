import { generatePicks } from "../analysis";

async function getMatches() {
  const res = await fetch("/api/football");
  return res.json();
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main style={{ padding: 20 }}>
      <h1>BetAnalyzer PRO</h1>

      <h2>Jogos do dia</h2>

      {matches.map((match: any, index: number) => {
        const picks = generatePicks({
          homeTeam: match.home,
          awayTeam: match.away,
          homeWinProb: match.homeProb,
          drawProb: match.drawProb,
          awayWinProb: match.awayProb,
          expectedGoals: match.goals,
          bttsProb: match.btts,
        });

        return (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 15,
              marginBottom: 20,
            }}
          >
            <h3>
              {match.home} vs {match.away}
            </h3>

            {picks.map((pick: any, i: number) => (
              <div key={i}>
                <p><strong>{pick.market}:</strong> {pick.suggestion}</p>
                <p>Confiança: {pick.confidence}%</p>
              </div>
            ))}
          </div>
        );
      })}
    </main>
  );
}
