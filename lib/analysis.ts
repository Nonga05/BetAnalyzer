type Pick = {
  market: string;
  selection: string;
  odd: number;
  probability: number;
  ev: number;
  confidence: number;
};

function normalizeProbabilities(odds: number[]) {
  const probs = odds.map(o => 1 / o);
  const total = probs.reduce((a, b) => a + b, 0);
  return probs.map(p => p / total);
}

function calcEV(prob: number, odd: number) {
  return prob * odd - 1;
}

function buildPick(market: string, selection: string, odd: number, prob: number): Pick {
  const ev = calcEV(prob, odd);
  const confidence = Math.min(95, Math.round(prob * 100 + ev * 100));

  return {
    market,
    selection,
    odd,
    probability: Number((prob * 100).toFixed(2)),
    ev: Number(ev.toFixed(3)),
    confidence,
  };
}

export function analyzeMatch(match: any) {
  const picks: Pick[] = [];

  const bookmakers = match.bookmakers || [];
  if (!bookmakers.length) return [];

  const bets = bookmakers[0].bets;

  for (const bet of bets) {
    const name = bet.name;

    if (name === "Match Winner") {
      const odds = bet.values.map((v: any) => parseFloat(v.odd));
      const probs = normalizeProbabilities(odds);

      bet.values.forEach((v: any, i: number) => {
        picks.push(buildPick("1X2", v.value, parseFloat(v.odd), probs[i]));
      });
    }

    if (name.includes("Over/Under")) {
      const odds = bet.values.map((v: any) => parseFloat(v.odd));
      const probs = normalizeProbabilities(odds);

      bet.values.forEach((v: any, i: number) => {
        picks.push(buildPick("Over/Under", v.value, parseFloat(v.odd), probs[i]));
      });
    }

    if (name === "Both Teams Score") {
      const odds = bet.values.map((v: any) => parseFloat(v.odd));
      const probs = normalizeProbabilities(odds);

      bet.values.forEach((v: any, i: number) => {
        picks.push(buildPick("BTTS", v.value, parseFloat(v.odd), probs[i]));
      });
    }

    if (name === "Double Chance") {
      const odds = bet.values.map((v: any) => parseFloat(v.odd));
      const probs = normalizeProbabilities(odds);

      bet.values.forEach((v: any, i: number) => {
        picks.push(buildPick("Dupla Chance", v.value, parseFloat(v.odd), probs[i]));
      });
    }
  }

  // 🔥 FILTRO PROFISSIONAL
  const filtered = picks.filter(p => p.ev > 0 && p.confidence > 60);

  // 🔥 TOP PICKS
  return filtered.sort((a, b) => b.ev - a.ev).slice(0, 5);
}
