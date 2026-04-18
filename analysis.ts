export type MatchData = {
  homeTeam: string;
  awayTeam: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedGoals: number;
  bttsProb: number;
};

export type PickSuggestion = {
  market: string;
  suggestion: string;
  confidence: number;
  reason: string;
};

export function generatePicks(match: MatchData): PickSuggestion[] {
  const picks: PickSuggestion[] = [];

  if (match.homeWinProb >= 0.60) {
    picks.push({
      market: "Resultado",
      suggestion: `${match.homeTeam} vence`,
      confidence: Math.round(match.homeWinProb * 100),
      reason: "Time favorito com alta probabilidade."
    });
  }

  if (match.expectedGoals >= 2.2) {
    picks.push({
      market: "Gols",
      suggestion: "Mais de 1.5 gols",
      confidence: 75,
      reason: "Alta expectativa de gols."
    });
  }

  if (match.bttsProb >= 0.55) {
    picks.push({
      market: "Ambas marcam",
      suggestion: "Sim",
      confidence: Math.round(match.bttsProb * 100),
      reason: "Boa chance de gols dos dois lados."
    });
  }

  if (match.homeWinProb >= 0.50) {
    picks.push({
      market: "Dupla chance",
      suggestion: `${match.homeTeam} ou empate`,
      confidence: 80,
      reason: "Entrada mais segura."
    });
  }

  return picks.sort((a, b) => b.confidence - a.confidence);
}
