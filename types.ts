export type Confidence = 'Alta' | 'Média' | 'Baixa'

export type MatchAnalysis = {
  id: string
  league: string
  kickoff: string
  status: 'NS' | 'LIVE' | 'FT'
  minute?: number
  home: string
  away: string
  score?: string
  homeWin: number
  draw: number
  awayWin: number
  btts: number
  over25: number
  bestBet: string
  market: string
  confidence: Confidence
  confidenceScore: number
  reasoning: string
  odds: number
}

export type BankrollSummary = {
  initialBankroll: number
  currentBankroll: number
  totalStaked: number
  totalProfit: number
  roi: number
  wins: number
  losses: number
  voids: number
}

export type BetRecord = {
  id: string
  match: string
  market: string
  selection: string
  odds: number
  stake: number
  result: 'pending' | 'win' | 'loss' | 'void'
  profit: number
  createdAt: string
}

export type DashboardPayload = {
  summary: BankrollSummary
  topSuggestion: MatchAnalysis | null
  todayMatches: MatchAnalysis[]
  singles: MatchAnalysis[]
  multiples: {
    id: string
    label: string
    selections: Array<{ match: string; selection: string; odds: number }>
    combinedOdds: number
    risk: 'Baixo' | 'Médio' | 'Alto'
  }[]
  recentBets: BetRecord[]
}
