export function formatCurrency(value: number) {
  return `$${value}`;
}

export function formatKickoff(date: any) {
  return String(date);
}

export function formatPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function calculateProfit() {
  return 0;
}
