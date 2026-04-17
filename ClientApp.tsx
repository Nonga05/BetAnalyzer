'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardPayload, MatchAnalysis, BetRecord } from '@/lib/types'
import { calculateProfit, formatCurrency, formatKickoff, formatPct } from '@/lib/utils'

const STORAGE_KEY = 'betanalyzer-bankroll'

type Props = {
  initialData: DashboardPayload
}

type LocalState = {
  initialBankroll: number
  currentBankroll: number
  bets: BetRecord[]
}

function getConfidenceClass(confidence: string) {
  if (confidence === 'Alta') return 'green'
  if (confidence === 'Média') return 'amber'
  return 'red'
}

function recomputeState(state: LocalState): LocalState {
  const totalProfit = state.bets.reduce((acc, bet) => acc + bet.profit, 0)
  return {
    ...state,
    currentBankroll: Number((state.initialBankroll + totalProfit).toFixed(2)),
  }
}

export default function ClientApp({ initialData }: Props) {
  const [query, setQuery] = useState('')
  const [searchResult, setSearchResult] = useState<MatchAnalysis | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [liveMatches, setLiveMatches] = useState<MatchAnalysis[]>(initialData.todayMatches.filter((m) => m.status === 'LIVE'))
  const [local, setLocal] = useState<LocalState>({
    initialBankroll: initialData.summary.initialBankroll,
    currentBankroll: initialData.summary.currentBankroll,
    bets: initialData.recentBets,
  })
  const [form, setForm] = useState({ match: '', market: '', selection: '', odds: 1.7, stake: 20, result: 'pending' as BetRecord['result'] })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LocalState
        setLocal(recomputeState(parsed))
      } catch {
        // ignore corrupted local data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
  }, [local])

  useEffect(() => {
    const loadLive = async () => {
      const res = await fetch('/api/live', { cache: 'no-store' })
      const data = await res.json()
      setLiveMatches(data.matches ?? [])
    }

    loadLive()
    const interval = setInterval(loadLive, 45000)
    return () => clearInterval(interval)
  }, [])

  const summary = useMemo(() => {
    const wins = local.bets.filter((b) => b.result === 'win').length
    const losses = local.bets.filter((b) => b.result === 'loss').length
    const voids = local.bets.filter((b) => b.result === 'void').length
    const totalStaked = local.bets.reduce((acc, bet) => acc + bet.stake, 0)
    const totalProfit = local.bets.reduce((acc, bet) => acc + bet.profit, 0)
    const roi = totalStaked ? (totalProfit / totalStaked) * 100 : 0
    return { wins, losses, voids, totalStaked, totalProfit, roi }
  }, [local])

  async function handleSearch() {
    if (!query.trim()) return
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResult(data.match ?? null)
      if (data.match) {
        setForm((prev) => ({
          ...prev,
          match: `${data.match.home} x ${data.match.away}`,
          market: data.match.market,
          selection: data.match.bestBet,
          odds: data.match.odds,
        }))
      }
    } finally {
      setSearchLoading(false)
    }
  }

  function saveBet() {
    if (!form.match || !form.selection || !form.market || !form.stake || !form.odds) return
    const record: BetRecord = {
      id: crypto.randomUUID(),
      match: form.match,
      market: form.market,
      selection: form.selection,
      odds: Number(form.odds),
      stake: Number(form.stake),
      result: form.result,
      profit: calculateProfit(Number(form.stake), Number(form.odds), form.result),
      createdAt: new Date().toISOString(),
    }
    setLocal((prev) => recomputeState({ ...prev, bets: [record, ...prev.bets] }))
  }

  return (
    <main>
      <div className="nav">
        <div className="card hero">
          <div className="row">
            <div className="logo">BA</div>
            <div>
              <div className="kicker">BetAnalyzer</div>
              <div className="h1">PRO 2026</div>
            </div>
          </div>
          <div className="row wrap">
            <span className="badge green">Banca atual {formatCurrency(local.currentBankroll)}</span>
            <span className="badge">ROI {summary.roi.toFixed(1)}%</span>
            <span className="badge">Vitórias {summary.wins}</span>
          </div>
        </div>
      </div>

      <section className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="kicker">Banca</div><div className="stat">{formatCurrency(local.currentBankroll)}</div><div className="muted small">Inicial {formatCurrency(local.initialBankroll)}</div></div>
        <div className="card"><div className="kicker">Lucro</div><div className="stat">{formatCurrency(summary.totalProfit)}</div><div className="muted small">Stake total {formatCurrency(summary.totalStaked)}</div></div>
        <div className="card"><div className="kicker">ROI</div><div className="stat">{summary.roi.toFixed(1)}%</div><div className="muted small">Performance geral</div></div>
        <div className="card"><div className="kicker">Top sugestão</div><div className="stat" style={{ fontSize: 20 }}>{initialData.topSuggestion?.bestBet ?? 'Sem sugestão'}</div><div className="muted small">Confiança {initialData.topSuggestion?.confidence ?? '—'}</div></div>
      </section>

      <section className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <div>
              <div className="kicker">Pesquisa</div>
              <div className="h2">Lupa inteligente</div>
            </div>
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Digite o jogo. Ex: Arsenal x Chelsea" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="button" onClick={handleSearch}>{searchLoading ? 'Analisando...' : 'Analisar'}</button>
          </div>
          {searchResult ? (
            <div className="match">
              <div className="row between wrap">
                <div>
                  <div className="h2" style={{ marginBottom: 4 }}>{searchResult.home} x {searchResult.away}</div>
                  <div className="muted">{searchResult.league} • {formatKickoff(searchResult.kickoff)}</div>
                </div>
                <span className={`badge ${getConfidenceClass(searchResult.confidence)}`}>{searchResult.confidence} • {searchResult.confidenceScore}%</span>
              </div>
              <div className="prob-grid">
                <div className="prob"><span className="muted small">Casa</span><strong>{formatPct(searchResult.homeWin)}</strong></div>
                <div className="prob"><span className="muted small">Empate</span><strong>{formatPct(searchResult.draw)}</strong></div>
                <div className="prob"><span className="muted small">Fora</span><strong>{formatPct(searchResult.awayWin)}</strong></div>
                <div className="prob"><span className="muted small">BTTS</span><strong>{formatPct(searchResult.btts)}</strong></div>
                <div className="prob"><span className="muted small">Over 2.5</span><strong>{formatPct(searchResult.over25)}</strong></div>
              </div>
              <div className="card soft">
                <div className="kicker">Melhor aposta</div>
                <div className="h2">{searchResult.bestBet} @ {searchResult.odds.toFixed(2)}</div>
                <div className="muted">{searchResult.reasoning}</div>
              </div>
            </div>
          ) : <div className="muted">Pesquise um jogo do dia para ver probabilidades e análise.</div>}
        </div>

        <div className="card">
          <div className="kicker">Registrar aposta</div>
          <div className="h2">Gestão de banca</div>
          <div className="list">
            <input className="input" placeholder="Jogo" value={form.match} onChange={(e) => setForm({ ...form, match: e.target.value })} />
            <input className="input" placeholder="Mercado" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} />
            <input className="input" placeholder="Seleção" value={form.selection} onChange={(e) => setForm({ ...form, selection: e.target.value })} />
            <div className="grid grid-2">
              <input className="input" type="number" step="0.01" placeholder="Odd" value={form.odds} onChange={(e) => setForm({ ...form, odds: Number(e.target.value) })} />
              <input className="input" type="number" step="0.01" placeholder="Stake" value={form.stake} onChange={(e) => setForm({ ...form, stake: Number(e.target.value) })} />
            </div>
            <select className="input" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value as BetRecord['result'] })}>
              <option value="pending">Pendente</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="void">Void</option>
            </select>
            <button className="button" onClick={saveBet}>Salvar aposta</button>
          </div>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="kicker">Apostas prontas</div>
          <div className="h2">Simples do dia</div>
          <div className="list">
            {initialData.singles.map((match) => (
              <div className="match" key={match.id}>
                <div className="row between wrap">
                  <strong>{match.home} x {match.away}</strong>
                  <span className={`badge ${getConfidenceClass(match.confidence)}`}>{match.confidence}</span>
                </div>
                <div className="muted small">{match.league} • {match.market}</div>
                <div>{match.bestBet} @ {match.odds.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="kicker">Bilhetes</div>
          <div className="h2">Múltiplas prontas</div>
          <div className="list">
            {initialData.multiples.map((multi) => (
              <div className="match" key={multi.id}>
                <div className="row between wrap">
                  <strong>{multi.label}</strong>
                  <span className="badge">Risco {multi.risk}</span>
                </div>
                {multi.selections.map((s, idx) => (
                  <div key={idx} className="muted small">• {s.match}: {s.selection} @ {s.odds.toFixed(2)}</div>
                ))}
                <div><strong>Odd combinada:</strong> {multi.combinedOdds.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="kicker">Hoje</div>
          <div className="h2">Jogos do dia</div>
          <div className="list">
            {initialData.todayMatches.map((match) => (
              <div className="match" key={match.id}>
                <div className="row between wrap">
                  <strong>{match.home} x {match.away}</strong>
                  <span className={`badge ${match.status === 'LIVE' ? 'red' : ''}`}>{match.status === 'LIVE' ? `AO VIVO ${match.minute ?? ''}'` : formatKickoff(match.kickoff)}</span>
                </div>
                <div className="muted small">{match.league}</div>
                <div>{match.bestBet} @ {match.odds.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="kicker">Ao vivo</div>
          <div className="h2">Partidas live</div>
          <div className="list">
            {liveMatches.length ? liveMatches.map((match) => (
              <div className="match" key={match.id}>
                <div className="row between wrap">
                  <strong>{match.home} {match.score ?? ''} {match.away}</strong>
                  <span className="badge red">LIVE {match.minute ?? ''}'</span>
                </div>
                <div className="muted small">{match.league}</div>
                <div>{match.bestBet}</div>
              </div>
            )) : <div className="muted">Nenhum jogo ao vivo no momento.</div>}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="kicker">Histórico</div>
        <div className="h2">Apostas registradas</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Mercado</th>
                <th>Seleção</th>
                <th>Odd</th>
                <th>Stake</th>
                <th>Resultado</th>
                <th>Lucro</th>
              </tr>
            </thead>
            <tbody>
              {local.bets.map((bet) => (
                <tr key={bet.id}>
                  <td>{bet.match}</td>
                  <td>{bet.market}</td>
                  <td>{bet.selection}</td>
                  <td>{bet.odds.toFixed(2)}</td>
                  <td>{formatCurrency(bet.stake)}</td>
                  <td>{bet.result}</td>
                  <td>{formatCurrency(bet.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
