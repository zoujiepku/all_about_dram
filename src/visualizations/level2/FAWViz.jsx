import { useState, useCallback } from 'react'

const TICK_W = 24  // px per ns
const LANE_H = 32
const BANKS = 4

export default function FAWViz({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [tFAW, setTFAW] = useState(25)  // ns
  const [activates, setActivates] = useState([])  // array of {time, bank}
  const [time, setTime] = useState(0)

  const totalTime = 80  // ns shown

  const addActivate = useCallback((bank) => {
    // Find earliest valid time for this bank: must be after last activate on this bank + tRRD
    const tRRD = 5  // minimum time between two activates on same bank group
    const bankActs = activates.filter((a) => a.bank === bank)
    const lastOnBank = bankActs.length > 0 ? Math.max(...bankActs.map((a) => a.time)) : -100
    // Global constraint: at most 4 activates within any tFAW window
    let t = Math.max(time, lastOnBank + tRRD)
    // Check FAW: count activates in [t-tFAW+1, t]
    while (t < totalTime) {
      const inWindow = activates.filter((a) => a.time >= t - tFAW + 1 && a.time <= t)
      if (inWindow.length < 4) break
      t++
    }
    if (t >= totalTime) return
    setActivates((prev) => [...prev, { time: t, bank }])
    setTime(t + 3)
  }, [activates, time, tFAW])

  const reset = () => { setActivates([]); setTime(0) }

  const svgW = totalTime * TICK_W + 80
  const svgH = (BANKS + 1) * (LANE_H + 4) + 50

  // Find tFAW violations or tight windows
  const windows = activates.map((act, i) => {
    const inW = activates.filter((a) => a.time >= act.time && a.time < act.time + tFAW)
    return { start: act.time, count: inW.length }
  })
  const maxInAnyWindow = windows.length > 0 ? Math.max(...windows.map((w) => w.count)) : 0

  const bankColors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7']

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? 'tFAW — 四激活窗口约束' : 'tFAW — Four-Activate Window Constraint'}
      </h3>

      <div className="flex flex-col gap-5">
        {/* tFAW slider */}
        <div>
          <label className="text-sm font-medium text-dram-text block mb-1">
            tFAW = <span className="text-dram-amber font-mono">{tFAW} ns</span>
            <span className="text-dram-muted text-xs ml-2">{isZh ? '（典型 DDR4：25–35 ns）' : '(typical DDR4: 25–35 ns)'}</span>
          </label>
          <input type="range" min="10" max="50" step="5"
            value={tFAW} onChange={(e) => { setTFAW(Number(e.target.value)); reset() }}
            className="w-full accent-amber-400" />
        </div>

        {/* Activate buttons */}
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: BANKS }, (_, b) => (
            <button key={b} onClick={() => addActivate(b)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: bankColors[b] + '80',
                backgroundColor: bankColors[b] + '15',
                color: bankColors[b],
              }}>
              {isZh ? `激活 存储体 ${b}` : `ACT Bank ${b}`}
            </button>
          ))}
          <button onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-dram-border text-dram-muted hover:text-dram-text transition-colors">
            {isZh ? '重置' : 'Reset'}
          </button>
        </div>

        {/* Timing diagram */}
        <div className="overflow-x-auto">
          <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ minWidth: Math.min(svgW, 600) }}>
            {/* Time axis */}
            <text x="4" y={svgH - 10} fill="#475569" fontSize="9">0</text>
            {Array.from({ length: Math.floor(totalTime / 10) + 1 }, (_, i) => (
              <g key={i}>
                <line x1={80 + i * 10 * TICK_W} y1={0} x2={80 + i * 10 * TICK_W} y2={svgH - 20}
                  stroke="#1e293b" strokeWidth="1" />
                <text x={80 + i * 10 * TICK_W} y={svgH - 10}
                  textAnchor="middle" fill="#475569" fontSize="9">{i * 10} ns</text>
              </g>
            ))}

            {/* Lane labels */}
            {Array.from({ length: BANKS }, (_, b) => (
              <text key={b} x={76} y={b * (LANE_H + 4) + LANE_H / 2 + 5}
                textAnchor="end" dominantBaseline="middle"
                fill={bankColors[b]} fontSize="10" fontWeight="bold">B{b}</text>
            ))}
            <text x="76" y={BANKS * (LANE_H + 4) + LANE_H / 2 + 5}
              textAnchor="end" dominantBaseline="middle" fill="#64748b" fontSize="10">ALL</text>

            {/* Bank lane backgrounds */}
            {Array.from({ length: BANKS }, (_, b) => (
              <rect key={b} x="80" y={b * (LANE_H + 4)}
                width={totalTime * TICK_W} height={LANE_H}
                fill="#0f172a" rx="2" />
            ))}

            {/* All-bank lane */}
            <rect x="80" y={BANKS * (LANE_H + 4)}
              width={totalTime * TICK_W} height={LANE_H}
              fill="#0f172a" rx="2" />

            {/* Activate markers per bank */}
            {activates.map((act, i) => (
              <g key={i}>
                <rect x={80 + act.time * TICK_W} y={act.bank * (LANE_H + 4)}
                  width={TICK_W * 2} height={LANE_H}
                  rx="2" fill={bankColors[act.bank] + '40'}
                  stroke={bankColors[act.bank]} strokeWidth="1.5" />
                <text x={80 + act.time * TICK_W + TICK_W}
                  y={act.bank * (LANE_H + 4) + LANE_H / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={bankColors[act.bank]} fontSize="8" fontWeight="bold">A</text>
                {/* vertical line to all-bank lane */}
                <line x1={80 + act.time * TICK_W + TICK_W}
                  y1={act.bank * (LANE_H + 4) + LANE_H}
                  x2={80 + act.time * TICK_W + TICK_W}
                  y2={BANKS * (LANE_H + 4)}
                  stroke={bankColors[act.bank] + '60'} strokeWidth="1" strokeDasharray="3 2" />
                {/* tick on all-bank lane */}
                <rect x={80 + act.time * TICK_W} y={BANKS * (LANE_H + 4)}
                  width={TICK_W * 2} height={LANE_H}
                  rx="2" fill={bankColors[act.bank] + '30'}
                  stroke={bankColors[act.bank] + '80'} strokeWidth="1" />
              </g>
            ))}

            {/* tFAW window overlay on first activate */}
            {activates.length > 0 && (
              <g>
                <rect x={80 + activates[0].time * TICK_W}
                  y={BANKS * (LANE_H + 4)}
                  width={tFAW * TICK_W} height={LANE_H}
                  fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3"
                  rx="2" />
                <text x={80 + activates[0].time * TICK_W + tFAW * TICK_W / 2}
                  y={BANKS * (LANE_H + 4) - 4}
                  textAnchor="middle" fill="#ef4444" fontSize="9">
                  tFAW = {tFAW} ns ({activates.filter(a => a.time >= activates[0].time && a.time < activates[0].time + tFAW).length}/4 used)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Status */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-dram-bg rounded-lg p-3">
            <div className="text-xs text-dram-muted">{isZh ? '总激活次数' : 'Total activates'}</div>
            <div className="text-xl font-bold font-mono text-dram-text">{activates.length}</div>
          </div>
          <div className="bg-dram-bg rounded-lg p-3">
            <div className="text-xs text-dram-muted">{isZh ? '窗口内最大激活数' : 'Max in any window'}</div>
            <div className={`text-xl font-bold font-mono ${maxInAnyWindow >= 4 ? 'text-amber-400' : 'text-dram-green'}`}>
              {maxInAnyWindow} / 4
            </div>
          </div>
          <div className="bg-dram-bg rounded-lg p-3">
            <div className="text-xs text-dram-muted">{isZh ? '存在原因' : 'Why it exists'}</div>
            <div className="text-xs text-dram-muted mt-1">{isZh ? 'IR 压降：4 个存储体同时激活产生 ΔI 浪涌，违反电源平面完整性' : 'IR drop: 4 simultaneous row opens cause ΔI surge, violating power plane integrity'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
