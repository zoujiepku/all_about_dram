import { useState, useMemo } from 'react'

const BANKS = 4
const OPEN_HIT_LAT = 10    // row-buffer hit: just tCL
const OPEN_MISS_LAT = 45   // row-buffer miss: tRP + tRCD + tCL
const OPEN_EMPTY_LAT = 35  // empty row: tRCD + tCL (no precharge needed)
const CLOSED_ALL_LAT = 45  // closed page: always tRP + tRCD + tCL

const initialRequests = [
  { id: 1, bank: 0, row: 5, col: 12, type: 'R', label: 'CPU read',   labelZh: 'CPU 读' },
  { id: 2, bank: 0, row: 5, col: 44, type: 'R', label: 'CPU read',   labelZh: 'CPU 读' },
  { id: 3, bank: 0, row: 9, col: 7,  type: 'W', label: 'DMA write',  labelZh: 'DMA 写' },
  { id: 4, bank: 1, row: 3, col: 28, type: 'R', label: 'GPU read',   labelZh: 'GPU 读' },
  { id: 5, bank: 1, row: 3, col: 60, type: 'R', label: 'GPU read',   labelZh: 'GPU 读' },
  { id: 6, bank: 2, row: 7, col: 3,  type: 'W', label: 'CPU write',  labelZh: 'CPU 写' },
  { id: 7, bank: 3, row: 1, col: 18, type: 'R', label: 'CPU read',   labelZh: 'CPU 读' },
  { id: 8, bank: 0, row: 5, col: 33, type: 'R', label: 'prefetch',   labelZh: '预取' },
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

export default function SchedulerSim({ lang = 'en' }) {
  const [schedPolicy, setSchedPolicy] = useState('fr-fcfs')
  const [pagePolicy, setPagePolicy] = useState('open')
  // open rows: bank → row index
  const [openRows, setOpenRows] = useState({ 0: 5, 1: 3 })

  const isZh = lang === 'zh'

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

  const schedPolicyOptions = isZh
    ? [['fr-fcfs', 'FR-FCFS'], ['fcfs', 'FCFS'], ['rr', '轮询']]
    : [['fr-fcfs', 'FR-FCFS'], ['fcfs', 'FCFS'], ['rr', 'Round-Robin']]

  const pagePolicyOptions = isZh
    ? [['open', '开放页'], ['closed', '关闭页']]
    : [['open', 'Open page'], ['closed', 'Closed page']]

  const serviceOrderDesc = isZh
    ? schedPolicy === 'fr-fcfs' ? '命中优先' : schedPolicy === 'rr' ? '各 Bank 轮询' : '到达顺序'
    : schedPolicy === 'fr-fcfs' ? 'hits first' : schedPolicy === 'rr' ? 'round-robin per bank' : 'arrival order'

  const statusLabels = isZh
    ? { hit: '命中', miss: '未命中', empty: '空闲' }
    : { hit: 'Hit', miss: 'Miss', empty: 'Empty' }

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        {isZh ? '内存调度器 — 策略对比' : 'Memory Scheduler — Policy Comparison'}
      </h3>

      {/* Policy controls */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
            {isZh ? '调度策略' : 'Scheduling Policy'}
          </div>
          <div className="flex gap-2">
            {schedPolicyOptions.map(([v, lbl]) => (
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
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
            {isZh ? '页策略' : 'Page Policy'}
          </div>
          <div className="flex gap-2">
            {pagePolicyOptions.map(([v, lbl]) => (
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
            {isZh
              ? `服务顺序（${serviceOrderDesc}）`
              : `Service order (${serviceOrderDesc})`}
          </div>
          <div className="space-y-1.5">
            {ordered.map((req, i) => {
              const c = statusColors[req.status]
              return (
                <div key={req.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${c.bg} ${c.border}`}>
                  <span className="text-dram-muted font-mono w-4">{i + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${c.badge} ${c.text}`}>
                    {statusLabels[req.status].toUpperCase()}
                  </span>
                  <span className="text-dram-muted font-mono">B{req.bank} R{req.row} C{req.col}</span>
                  <span className={`${req.type === 'R' ? 'text-dram-blue' : 'text-dram-amber'} font-mono font-bold`}>
                    {req.type}
                  </span>
                  <span className="text-dram-muted flex-1">
                    {isZh ? req.labelZh : req.label}
                  </span>
                  <span className={`font-mono font-bold ${c.text}`}>{req.latency} ns</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 min-w-[180px]">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
              {isZh ? '汇总' : 'Summary'}
            </div>
            <div className="space-y-1.5">
              {[
                [statusLabels.hit,   hitCount,   '#22c55e', `${OPEN_HIT_LAT} ns`],
                [statusLabels.miss,  missCount,  '#ef4444', `${OPEN_MISS_LAT} ns`],
                [statusLabels.empty, emptyCount, '#f59e0b', `${pagePolicy === 'open' ? OPEN_EMPTY_LAT : CLOSED_ALL_LAT} ns`],
              ].map(([lbl, cnt, color, lat]) => (
                <div key={lbl} className="flex items-center justify-between text-xs bg-dram-bg rounded p-2">
                  <span style={{ color }}>{lbl}</span>
                  <span className="font-mono text-dram-text">{cnt} {isZh ? '个请求' : 'req'}</span>
                  <span className="font-mono text-dram-muted">{lat}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs bg-dram-bg rounded p-2 border border-dram-blue/30">
                <span className="text-dram-blue font-bold">{isZh ? '平均延迟' : 'Avg latency'}</span>
                <span className="font-mono font-bold text-dram-blue">{avgLat} ns</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted space-y-1">
            <div className="font-semibold text-dram-text mb-1">
              {isZh ? '延迟模型' : 'Latency model'}
            </div>
            <div>{isZh ? `命中：tCL = ${OPEN_HIT_LAT} ns` : `Hit: tCL = ${OPEN_HIT_LAT} ns`}</div>
            <div>{isZh ? `未命中：tRP+tRCD+tCL = ${OPEN_MISS_LAT} ns` : `Miss: tRP+tRCD+tCL = ${OPEN_MISS_LAT} ns`}</div>
            <div>{isZh ? `空闲：tRCD+tCL = ${OPEN_EMPTY_LAT} ns` : `Empty: tRCD+tCL = ${OPEN_EMPTY_LAT} ns`}</div>
            <div>{isZh ? `关闭页：固定 ${CLOSED_ALL_LAT} ns` : `Closed: always ${CLOSED_ALL_LAT} ns`}</div>
          </div>

          {schedPolicy === 'fr-fcfs' && hitCount > 0 && (
            <div className="rounded-lg p-3 bg-amber-900/10 border border-amber-700/30 text-xs text-amber-300">
              {isZh
                ? 'FR-FCFS 重排请求：命中请求优先，缺失请求可能长期等待（饥饿问题）。'
                : `FR-FCFS reorders: req #${initialRequests.findIndex(r => r.status === 'hit') + 1} may wait behind hits from req #${initialRequests.length}. Possible starvation of miss requests.`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
