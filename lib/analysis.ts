export function analyzeMatch(match: any) {
  const percent = match?.predictions?.predictions?.percent;

  if (!percent) return [];

  return [
    {
      market: "1X2",
      selection: "Casa",
      probability: percent.home || 0,
    },
    {
      market: "1X2",
      selection: "Empate",
      probability: percent.draw || 0,
    },
    {
      market: "1X2",
      selection: "Visitante",
      probability: percent.away || 0,
    },
  ];
}
