import { demoDashboard, demoMatches } from './demo-data'
import { DashboardPayload, MatchAnalysis } from './types'

const BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY

async function apiFetch(path: string) {
  if (!API_KEY) return null

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'x-apisports-key': API_KEY,
    },
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    throw new Error(`API-Football request failed: ${res.status}`)
  }

  return res.json()
}

function mapFixtureToAnalysis(fixture: any): MatchAnalysis {
  const predictions = fixture.predictions ?? null
  const home = fixture.teams?.home?.name ?? fixture.fixture?.teams?.home?.name ?? 'Mandante'
  const away = fixture.teams?.away?.name ?? fixture.fixture?.teams?.away?.name ?? 'Visitante'
  const status = fixture.fixture?.status?.short === 'FT' ? 'FT' : fixture.fixture?.status?.short === 'LIVE' || fixture.fixture?.status?.elapsed ? 'LIVE' : 'NS'
  const homeWin = Number(predictions?.percent?.home?.replace('%', '') ?? 50)
  const draw = Number(predictions?.percent?.draw?.replace('%', '') ?? 25)
  const awayWin = Number(predictions?.percent?.away?.replace('%', '') ?? 25)
  const over25 = predictions?.under_over === '+' ? 60 : 48
  const btts = predictions?.advice?.toLowerCase().includes('both') ? 58 : 46
  const confidenceScore = Math.max(homeWin, draw, awayWin)
  const bestSelection = predictions?.winner?.name || (homeWin >= awayWin ? `${home} vence` : `${away} vence`)

  return {
    id: String(fixture.fixture?.id ?? crypto.randomUUID()),
    league: fixture.league?.name ?? 'Liga',
    kickoff: fixture.fixture?.date ?? new Date().toISOString(),
    status,
    minute: fixture.fixture?.status?.elapsed ?? undefined,
    home,
    away,
    score: fixture.goals ? `${fixture.goals.home ?? 0}-${fixture.goals.away ?? 0}` : undefined,
    homeWin,
    draw,
    awayWin,
    btts,
    over25,
    bestBet: bestSelection,
    market: '1X2',
    confidence: confidenceScore >= 65 ? 'Alta' : confidenceScore >= 52 ? 'Média' : 'Baixa',
    confidenceScore,
    reasoning: predictions?.advice || 'Análise baseada em forma recente e projeção de mercado.',
    odds: 1.7,
  }
}

export async function getDashboardData(): Promise<DashboardPayload> {
  if (!API_KEY) return demoDashboard

  try {
    const date = new Date().toISOString().slice(0, 10)
    const fixturesRes = await apiFetch(`/fixtures?date=${date}`)
    const rawFixtures = fixturesRes?.response?.slice(0, 8) ?? []
    const todayMatches = rawFixtures.map((item: any) => mapFixtureToAnalysis(item))
    const topSuggestion = [...todayMatches].sort((a, b) => b.confidenceScore - a.confidenceScore)[0] ?? null

    return {
      ...demoDashboard,
      todayMatches: todayMatches.length ? todayMatches : demoMatches,
      singles: (todayMatches.length ? todayMatches : demoMatches).slice(0, 3),
      topSuggestion: topSuggestion ?? demoDashboard.topSuggestion,
    }
  } catch {
    return demoDashboard
  }
}

export async function searchMatchAnalysis(query: string): Promise<MatchAnalysis | null> {
  if (!API_KEY) {
    const { findMatch } = await import('./utils')
    return findMatch(query, demoMatches) ?? demoMatches[0]
  }

  try {
    const date = new Date().toISOString().slice(0, 10)
    const fixturesRes = await apiFetch(`/fixtures?date=${date}`)
    const items = fixturesRes?.response ?? []
    const analyses = items.map((item: any) => mapFixtureToAnalysis(item))
    const { findMatch } = await import('./utils')
    return findMatch(query, analyses)
  } catch {
    return null
  }
}

export async function getLiveMatches(): Promise<MatchAnalysis[]> {
  if (!API_KEY) return demoMatches.filter((m) => m.status === 'LIVE')

  try {
    const res = await apiFetch('/fixtures?live=all')
    const items = res?.response ?? []
    return items.map((item: any) => mapFixtureToAnalysis(item))
  } catch {
    return demoMatches.filter((m) => m.status === 'LIVE')
  }
}
