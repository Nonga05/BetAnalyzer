import { analyzeMatch, type MarketPick } from "../../lib/analysis";

type LiveFixture = {
  fixture: {
    id: number;
    date: string;
    status: { elapsed?: number; long: string; short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type EnrichedLive = LiveFixture & {
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

async function getLiveFixtures(): Promise<LiveFixture[]> {
  const data = await apiFetch(`/fixtures?live=all&timezone=America/Sao_Paulo`);
  return data.response ?? [];
}

async function enrichLive(fixture: LiveFixture): Promise<EnrichedLive> {
  const fixtureId = fixture.fixture.id;

  const oddsResult = await apiFetch(`/odds/live?fixture=${fixtureId}`).catch(
    () => null
  );

  const odds = oddsResult?.response?.[0] ?? null;
  const topPicks = analyzeMatch({ predictions: null, odds });

  return {
    ...fixture,
    odds,
    topPicks,
  };
}

export default async function LivePage() {
  const fixtures = await getLiveFixtures();
  const enriched = await Promise.all(fixtures.map(enrichLive));

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
      <p style={{ opacity: 0.8, marginBottom: 24 }}>Jogos ao vivo</p>

      {enriched.length === 0 ? (
        <p>Nenhum jogo ao vivo agora.</p>
      ) : (
        enriched.map((game) => (
          <section
            key={game.fixture.id}
            style={{
              border: "1px solid #222",
              marginBottom: 20,
              padding: 16,
              borderRadius: 14,
              background: "#111",
            }}
          >
            <h2 style={{ marginBottom: 8 }}>
              {game.teams.home.name} {game.goals.home ?? 0} x {game.goals.away ?? 0}{" "}
              {game.teams.away.name}
            </h2>

            <p style={{ margin: "4px 0" }}>
              <b>Liga:</b> {game.league.name} ({game.league.country})
            </p>
            <p style={{ margin: "4px 0 14px" }}>
              <b>Status:</b> {game.fixture.status.long}
              {game.fixture.status.elapsed ? ` • ${game.fixture.status.elapsed}'` : ""}
            </p>

            {game.topPicks.length === 0 ? (
              <p style={{ opacity: 0.85 }}>Sem odds ao vivo suficientes.</p>
            ) : (
              game.topPicks.map((pick, idx) => (
                <div
                  key={`${game.fixture.id}-live-pick-${idx}`}
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
                </div>
              ))
            )}
          </section>
        ))
      )}
    </main>
  );
}
