export type MarketPick = {
  market: string;
  selection: string;
  odd: number;
  probability: number;
  source: "prediction" | "market_odds";
};

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parsePercent(value: unknown): number | null {
  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return toNumber(value);
}

function normalizeOdds(values: Array<{ odd: string | number }>): number[] {
  const odds = values
    .map((v) => toNumber(v.odd))
    .filter((v): v is number => v !== null && v > 1);

  if (!odds.length) return [];

  const implied = odds.map((odd) => 1 / odd);
  const total = implied.reduce((sum, p) => sum + p, 0);

  return implied.map((p) => Number(((p / total) * 100).toFixed(1)));
}

function buildPicksFromBet(
  market: string,
  values: Array<{ value: string; odd: string | number }>
): MarketPick[] {
  const probs = normalizeOdds(values);

  return values
    .map((v, index) => {
      const odd = toNumber(v.odd);
      const probability = probs[index];

      if (!odd || !probability) return null;

      return {
        market,
        selection: String(v.value),
        odd,
        probability,
        source: "market_odds" as const,
      };
    })
    .filter((item): item is MarketPick => item !== null)
    .sort((a, b) => b.probability - a.probability);
}

export function analyzeMatch(match: {
  predictions?: any;
  odds?: any;
}): MarketPick[] {
  const picks: MarketPick[] = [];

  const percent = match.predictions?.predictions?.percent;
  const winnerValues = match.odds?.bookmakers?.[0]?.bets?.find(
    (bet: any) => bet?.name === "Match Winner"
  )?.values;

  if (percent && Array.isArray(winnerValues) && winnerValues.length >= 3) {
    const mapByLabel = new Map(
      winnerValues.map((v: any) => [String(v.value).toLowerCase(), v])
    );

    const homeOdd = toNumber(
      mapByLabel.get("home")?.odd ?? mapByLabel.get("1")?.odd
    );
    const drawOdd = toNumber(
      mapByLabel.get("draw")?.odd ?? mapByLabel.get("x")?.odd
    );
    const awayOdd = toNumber(
      mapByLabel.get("away")?.odd ?? mapByLabel.get("2")?.odd
    );

    const homeProb = parsePercent(percent.home);
    const drawProb = parsePercent(percent.draw);
    const awayProb = parsePercent(percent.away);

    if (homeOdd && homeProb) {
      picks.push({
        market: "1X2",
        selection: "Casa",
        odd: homeOdd,
        probability: homeProb,
        source: "prediction",
      });
    }

    if (drawOdd && drawProb) {
      picks.push({
        market: "1X2",
        selection: "Empate",
        odd: drawOdd,
        probability: drawProb,
        source: "prediction",
      });
    }

    if (awayOdd && awayProb) {
      picks.push({
        market: "1X2",
        selection: "Visitante",
        odd: awayOdd,
        probability: awayProb,
        source: "prediction",
      });
    }
  }

  const bookmakers = match.odds?.bookmakers;
  if (!Array.isArray(bookmakers) || bookmakers.length === 0) {
    return picks.sort((a, b) => b.probability - a.probability);
  }

  const bets = bookmakers[0]?.bets ?? [];
  for (const bet of bets) {
    const name = String(bet?.name ?? "").toLowerCase();
    const values = Array.isArray(bet?.values) ? bet.values : [];

    if (!values.length) continue;

    if (name === "double chance") {
      picks.push(...buildPicksFromBet("Dupla chance", values));
      continue;
    }

    if (name === "both teams score") {
      picks.push(...buildPicksFromBet("Ambas marcam", values));
      continue;
    }

    if (name.includes("over/under")) {
      picks.push(...buildPicksFromBet("Over/Under", values));
      continue;
    }

    if (name.includes("corners")) {
      picks.push(...buildPicksFromBet("Escanteios", values));
      continue;
    }
  }

  return picks
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 8);
}
