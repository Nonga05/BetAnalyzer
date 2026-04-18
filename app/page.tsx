import { analyzeMatch, type MarketPick } from "../lib/analysis";

type FixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
  };
  teams: {
    home: { name: string; logo?: string };
    away: { name: string; logo?: string };
  };
};

type EnrichedFixture = FixtureItem & {
  predictions: any | null;
  odds: any | null;
  topPicks: MarketPick[];
};

async function apiFetch(path: string) {
  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: {
      "x-apisports-key": process.env.RAPID_API_KEY!,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }

  return res.json();
}

async function getTodayFixtures(): Promise<FixtureItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const data = await apiFetch(`/fixtures?date=${today}&timezone=America/Sao_Paulo`);
  return data.response ?? [];
}

async function enrichFixture(fixture: FixtureItem): Promise<EnrichedFixture> {
  const fixtureId = fixture.fixture.id;

  const [predictionsResult, oddsResult] = await Promise.allSettled([
    apiFetch(`/predictions?fixture=${fixtureId}`),
    apiFetch(`/odds?fixture=${fixtureId}`),
  ]);

  const predictions =
    predictionsResult.status === "fulfilled"
      ? (predictionsResult.value.response?.[0] ?? null)
      : null;

  const odds =
    oddsResult.status === "fulfilled"
      ? (oddsResult.value.response?.[0] ?? null)
      : null;

  const topPicks = analyzeMatch({ predictions, odds });

  return {
    ...fixture,
    predictions,
    odds,
    topPicks,
  };
}

export default async function Home() {
  const fixtures = await getTodayFixtures();
  const enriched = await Promise.all(fixtures.map(enrichFixture));

  return (
    <main
      style={{
        padding: 20,
        background: "#0b0b0b",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>BetAnalyzer PRO</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>Jogos do dia</p>

      {enriched.length === 0 ? (
        <p>Nenhum jogo encontrado hoje.</p>
      ) : (
        enriched.map((game, index) => (
          <section
            key={`${game.fixture.id}-${index}`}
            style={{
              border: "1px solid #222",
              marginBottom: 20,
              padding: 16,
              borderRadius: 14,
              background: "#111",
            }}
          >
            <h2 style={{ marginBottom: 8 }}>
              {game.teams.home.name} vs {game.teams.away.name}
            </h2>

            <p style={{ margin: "4px 0" }}>
              <b>Liga:</b> {game.league.name} ({game.league.country})
            </p>
            <p style={{ margin: "4px 0" }}>
              <b>Data:</b> {new Date(game.fixture.date).toLocaleString("pt-BR")}
            </p>
            <p style={{ margin: "4px 0 14px" }}>
              <b>Status:</b> {game.fixture.status.long}
            </p>

            {game.topPicks.length === 0 ? (
              <p style={{ opacity: 0.85 }}>Sem mercados suficientes para análise.</p>
            ) : (
              game.topPicks.map((pick, idx) => (
                <div
                  key={`${game.fixture.id}-pick-${idx}`}
                  style={{
                    borderTop: idx === 0 ? "1px solid #222" : undefined,
                    paddingTop: 12,
                    marginTop: 12,
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    <b>Mercado:</b> {pick.market}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <b>Seleção:</b> {pick.selection}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <b>Odd:</b> {pick.odd}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <b>Probabilidade:</b> {pick.probability}%
                  </p>
                  <p style={{ margin: "4px 0", opacity: 0.75 }}>
                    <b>Fonte:</b>{" "}
                    {pick.source === "prediction"
                      ? "predição da API"
                      : "probabilidade implícita das odds"}
                  </p>
                </div>
              ))
            )}
          </section>
        ))
      )}
    </main>
  );
}
