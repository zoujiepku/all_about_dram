import { useState, useMemo } from 'react'

const BANKS = 4
const OPEN_HIT_LAT = 10    // row-buffer hit: just tCL
const OPEN_MISS_LAT = 45   // row-buffer miss: tRP + tRCD + tCL
const OPEN_EMPTY_LAT = 35  // empty row: tRCD + tCL (no precharge needed)
const CLOSED_ALL_LAT = 45  // closed page: always tRP + tRCD + tCL

const initialRequests = [
  { id: 1, bank: 0, row: 5, col: 12, type: 'R', label: 'CPU read' },
  { id: 2, bank: 0, row: 5, col: 44, type: 'R', label: 'CPU read' },
  { id: 3, bank: 0, row: 9, col: 7,  type: 'W', label: 'DMA write' },
  { id: 4, bank: 1, row: 3, col: 28, type: 'R', label: 'GPU read' },
  { id: 5, bank: 1, row: 3, col: 60, type: 'R', label: 'GPU read' },
  { id: 6, bank: 2, row: 7, col: 3,  type: 'W', label: 'CPU write' },
  { id: 7, bank: 3, row: 1, col: 18, type: 'R', label: 'CPU read' },
  { id: 8, bank: 0, row: 5, col: 33, type: 'R', label: 'prefetch' },
]

function classifyRequests(requests, openRows, pagePolicy) {
  return requests.map((req) => {
    if (pagePolicy === 'closed') {
      return { ...req, status: 'empty', latency: CLOSED_ALL_LAT }
    }
    const rowOpen = openRows[req.bank]
    if (rowOpen === undefined) return { ...req, status: 'empty', latency: OPEN_EMPTY_LAT }
    if (rowOpen === req.row) return { ...req, status: 'hit', latency: OPEN_HIT_LAT }
    return { ...req, status: 'miss', latency: OPEN_MISS_LAT }
  })
}

function scheduleOrder(classified, policy) {
  if (policy === 'fr-fcfs') {
    const hits = classified.filter((r) => r.status === 'hit')
    const others = classified.filter((r) => r.status !== 'hit')
    return [...hits, ...others]
  }
  if (policy === 'rr') {
    const byBank = {}
    classified.forEach((r) => {
      if (!byBank[r.bank]) byBank[r.bank] = []
      byBank[r.bank].push(r)
    })
    const result = []
    let done = false
    let i = 0
    while (!done) {
      done = true
      Object.values(byBank).forEach((bq) => {
        if (bq[i]) { result.push(bq[i]); done = false }
      })
      i++
    }
    return result
  }
  return classified  // FCFS
}

const statusColors = {
  hit: { bg: 'bg-green-900/30', border: 'border-green-700/40', text: 'text-green-300', badge: 'bg-green-800/50' },
  miss: { bg: 'bg-red-900/20', border: 'border-red-700/30', text: 'text-red-300', badge: 'bg-red-800/40' },
  empty: { bg: 'bg-amber-900/20', border: 'border-amber-700/30', text: 'text-amber-300', badge: 'bg-amber-800/40' },
}

export default function SchedulerSim() {
  const [schedPolicy, setSchedPolicy] = useState('fr-fcfs')
  const [pagePolicy, setPagePolicy] = useState('open')
  // open rows: bank → row index
  const [openRows, setOpenRows] = useState({ 0: 5, 1: 3 })

  const classified = useMemo(
    () => classifyRequests(initialRequests, openRows, pagePolicy),
    [openRows, pagePolicy]
  )

  const ordered = useMemo(
    () => scheduleOrder(classified, schedPolicy),
    [classified, schedPolicy]
  )

  const avgLat = (ordered.reduce((s, r) => s + r.latency, 0) / ordered.length).toFixed(1)
  const hitCount = classified.filter((r) => r.status === 'hit').length
  const missCount = classified.filter((r) => r.status === 'miss').length
  const emptyCount = classified.filter((r) => r.status === 'empty').length

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        Memory Scheduler — Policy Comparison
      </h3>

      {/* Policy controls */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Scheduling Policy</div>
          <div className="flex gap-2">
            {[['fr-fcfs', 'FR-FCFS'], ['fcfs', 'FCFS'], ['rr', 'Round-Robin']].map(([v, lbl]) => (
              <button key={v} onClick={() => setSchedPolicy(v)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  schedPolicy === v
                    ? 'bg-dram-blue/20 border-dram-blue text-dram-blue'
                    : 'border-dram-border text-dram-muted hover:border-dram-muted'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Page Policy</div>
          <div className="flex gap-2">
            {[['open', 'Open page'], ['closed', 'Closed page']].map(([v, lbl]) => (
              <button key={v} onClick={() => setPagePolicy(v)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  pagePolicy === v
                    ? 'bg-dram-amber/20 border-dram-amber text-dram-amber'
                    : 'border-dram-border text-dram-muted hover:border-dram-muted'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Request queue */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
            Service order ({schedPolicy === 'fr-fcfs' ? 'hits first' : schedPolicy === 'rr' ? 'round-robin per bank' : 'arrival order'})
          </div>
          <div className="space-y-1.5">
            {ordered.map((req, i) => {
              const c = statusColors[req.status]
              return (
                <div key={req.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${c.bg} ${c.border}`}>
                  <span className="text-dram-muted font-mono w-4">{i + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${c.badge} ${c.text}`}>
                    {req.status.toUpperCase()}
                  </span>
                  <span className="text-dram-muted font-mono">B{req.bank} R{req.row} C{req.col}</span>
                  <span className={`${req.type === 'R' ? 'text-dram-blue' : 'text-dram-amber'} font-mono font-bold`}>
                    {req.type}
                  </span>
                  <span className="text-dram-muted flex-1">{req.label}</span>
                  <span className={`font-mono font-bold ${c.text}`}>{req.latency} ns</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 min-w-[180px]">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Summary</div>
            <div className="space-y-1.5">
              {[
                ['Hit', hitCount, '#22c55e', `${OPEN_HIT_LAT} ns`],
                ['Miss', missCount, '#ef4444', `${OPEN_MISS_LAT} ns`],
                ['Empty', emptyCount, '#f59e0b', `${pagePolicy === 'open' ? OPEN_EMPTY_LAT : CLOSED_ALL_LAT} ns`],
              ].map(([lbl, cnt, color, lat]) => (
                <div key={lbl} className="flex items-center justify-between text-xs bg-dram-bg rounded p-2">
                  <span style={{ color }}>{lbl}</span>
                  <span className="font-mono text-dram-text">{cnt} req</span>
                  <span className="font-mono text-dram-muted">{lat}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs bg-dram-bg rounded p-2 border border-dram-blue/30">
                <span className="text-dram-blue font-bold">Avg latency</span>
                <span className="font-mono font-bold text-dram-blue">{avgLat} ns</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted space-y-1">
            <div className="font-semibold text-dram-text mb-1">Latency model</div>
            <div>Hit: tCL = {OPEN_HIT_LAT} ns</div>
            <div>Miss: tRP+tRCD+tCL = {OPEN_MISS_LAT} ns</div>
            <div>Empty: tRCD+tCL = {OPEN_EMPTY_LAT} ns</div>
            <div>Closed: always {CLOSED_ALL_LAT} ns</div>
          </div>

          {schedPolicy === 'fr-fcfs' && hitCount > 0 && (
            <div className="rounded-lg p-3 bg-amber-900/10 border border-amber-700/30 text-xs text-amber-300">
              FR-FCFS reorders: req #{initialRequests.findIndex(r => r.status === 'hit') + 1} may wait
              behind hits from req #{initialRequests.length}. Possible starvation of miss requests.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
