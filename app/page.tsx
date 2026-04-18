import { analyzeMatch } from "@/lib/analysis";

async function getMatches() {
  const res = await fetch(
    "https://api-football-v1.p.rapidapi.com/v3/fixtures?date=2026-04-18",
    {
      headers: {
        "X-RapidAPI-Key": "COLOCA_SUA_API_KEY_AQUI",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
      },
      cache: "no-store"
    }
  );

  const data = await res.json();
  return data.response || [];
}

export default async function Home() {
  const games = await getMatches();

  return (
    <main style={{ padding: 20 }}>
      <h1>BetAnalyzer PRO</h1>

      {games.length === 0 && (
        <p>Nenhum jogo encontrado.</p>
      )}

      {games.map((game: any, i: number) => {
        const analysis = analyzeMatch(game);

        return (
          <div
            key={i}
            style={{
              border: "1px solid #333",
              marginBottom: 20,
              padding: 15,
              borderRadius: 10
            }}
          >
            <h2>
              {game.teams.home.name} vs {game.teams.away.name}
            </h2>

            <p><b>Data:</b> {new Date(game.fixture.date).toLocaleString()}</p>

            <p><b>Probabilidade:</b> {analysis.probability}%</p>
            <p><b>Recomendação:</b> {analysis.pick}</p>

            <p><b>Status:</b> {game.fixture.status.long}</p>
          </div>
        );
      })}
    </main>
  );
}
