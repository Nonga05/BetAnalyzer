import { BetRecord, MatchAnalysis } from './types'

export function calculateProfit(stake: number, odds: number, result: BetRecord['result']) {
  if (result === 'win') return Number((stake * (odds - 1)).toFixed(2))
  if (result === 'loss') return Number((-stake).toFixed(2))
  return 0
}

export function normalizeMatchQuery(query: string) {
  return query.toLowerCase().replace(/versus|vs\.?|contra/gi, 'x').replace(/\s+/g, ' ').trim()
}

export function findMatch(query: string, matches: MatchAnalysis[]) {
  const normalized = normalizeMatchQuery(query)
  return matches.find((match) => {
    const a = normalizeMatchQuery(`${match.home} x ${match.away}`)
    const b = normalizeMatchQuery(`${match.away} x ${match.home}`)
    return a.includes(normalized) || b.includes(normalized) || normalized.includes(match.home.toLowerCase()) || normalized.includes(match.away.toLowerCase())
  })
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPct(value: number) {
  return `${value.toFixed(0)}%`
}

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
