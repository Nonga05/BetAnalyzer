import { generatePicks } from "../analysis";

type Match = {
  home: string;
  away: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  goals: number;
  btts: number;
};

const matches: Match[] = [
  {
    home: "Manchester City",
    away: "Brighton",
    homeProb: 0.68,
    drawProb: 0.2,
    awayProb: 0.12,
    goals: 2.9,
    btts: 0.57,
  },
  {
    home: "Real Madrid",
    away: "Valencia",
    homeProb: 0.65,
    drawProb: 0.22,
    awayProb: 0.13,
    goals: 2.7,
    btts: 0.55,
  },
];

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>BetAnalyzer PRO</h1>
      <h2>Jogos do dia</h2>

      {matches.map((match, index) => {
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

            {picks.map((pick, i) => (
              <div key={i}>
                <p>
                  <strong>{pick.market}:</strong> {pick.suggestion}
                </p>
                <p>Confiança: {pick.confidence}%</p>
                <p>{pick.reason}</p>
              </div>
            ))}
          </div>
        );
      })}
    </main>
  );
}
