import { useState, useRef } from 'react'

const ROWS = 12
const COLS = 16
const HAMMER_THRESHOLD = 80000  // activations to cause a flip
const DISTURBANCE_PER_HIT = 1200  // charge injection per hammer

function makeGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({ val: Math.random() > 0.5 ? 1 : 0, orig: null }))
  ).map((row, r) => row.map((cell, c) => ({ ...cell, orig: cell.val })))
}

export default function RowHammerSim({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [grid, setGrid] = useState(makeGrid)
  const [aggressorRow, setAggressorRow] = useState(null)
  const [hammerCounts, setHammerCounts] = useState({})  // row → count
  const [disturbance, setDisturbance] = useState({})    // row → accumulated charge
  const [mode, setMode] = useState('single')  // single | double
  const intervalRef = useRef(null)
  const [isHammering, setIsHammering] = useState(false)
  const [flipLog, setFlipLog] = useState([])

  const totalHammers = Object.values(hammerCounts).reduce((s, v) => s + v, 0)
  const totalFlips = grid.flat().filter((c, i) => {
    const r = Math.floor(i / COLS), col = i % COLS
    return grid[r][col].val !== grid[r][col].orig
  }).length

  const startHammer = () => {
    if (aggressorRow === null || isHammering) return
    setIsHammering(true)
    let step = 0
    intervalRef.current = setInterval(() => {
      step++
      setHammerCounts((prev) => {
        const next = { ...prev }
        next[aggressorRow] = (next[aggressorRow] || 0) + 5000
        if (mode === 'double') {
          const ag2 = (aggressorRow + 2) % ROWS
          next[ag2] = (next[ag2] || 0) + 5000
        }
        return next
      })
      setDisturbance((prev) => {
        const next = { ...prev }
        const victims = mode === 'double'
          ? [aggressorRow - 1, aggressorRow + 1, aggressorRow + 1, aggressorRow + 3].filter((r) => r >= 0 && r < ROWS)
          : [aggressorRow - 1, aggressorRow + 1].filter((r) => r >= 0 && r < ROWS)
        victims.forEach((vr) => {
          next[vr] = (next[vr] || 0) + DISTURBANCE_PER_HIT
        })
        return next
      })
      // Check for bit flips based on accumulated disturbance
      setGrid((prev) => {
        const ng = prev.map((row) => row.map((cell) => ({ ...cell })))
        const newFlips = []
        for (let r = 0; r < ROWS; r++) {
          if (r === aggressorRow || (mode === 'double' && r === (aggressorRow + 2) % ROWS)) continue
          for (let c = 0; c < COLS; c++) {
            const rowDist = (disturbance[r] || 0) + DISTURBANCE_PER_HIT * 5  // include current step
            if (rowDist > HAMMER_THRESHOLD && Math.random() < 0.03) {
              ng[r][c].val = ng[r][c].val ^ 1
              newFlips.push(`R${r}:C${c}`)
            }
          }
        }
        if (newFlips.length > 0) {
          setFlipLog((prev) => [...prev, ...newFlips].slice(-20))
        }
        return ng
      })
      if (step >= 20) {
        clearInterval(intervalRef.current)
        setIsHammering(false)
      }
    }, 60)
  }

  const stopHammer = () => {
    clearInterval(intervalRef.current)
    setIsHammering(false)
  }

  const resetAll = () => {
    clearInterval(intervalRef.current)
    setIsHammering(false)
    setGrid(makeGrid())
    setHammerCounts({})
    setDisturbance({})
    setFlipLog([])
    setAggressorRow(null)
  }

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? 'RowHammer 模拟器 — 选择攻击行并开始锤击' : 'RowHammer Simulator — Select aggressor row and hammer'}
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div className="text-xs text-dram-muted mb-2">{isZh ? '点击某行将其选为攻击行' : 'Click a row to select as aggressor'}</div>
          <div className="space-y-1">
            {grid.map((row, r) => {
              const isAggressor = r === aggressorRow || (mode === 'double' && r === (aggressorRow + 2) % ROWS && aggressorRow !== null)
              const dist = disturbance[r] || 0
              const distRatio = Math.min(1, dist / HAMMER_THRESHOLD)
              const hammered = hammerCounts[r] || 0
              const isVictim = !isAggressor && distRatio > 0

              return (
                <div key={r} className="flex items-center gap-1.5"
                  onClick={() => { if (!isHammering) setAggressorRow(r === aggressorRow ? null : r) }}
                  style={{ cursor: isHammering ? 'default' : 'pointer' }}>
                  {/* Row label */}
                  <div className={`w-6 text-xs font-mono text-right ${isAggressor ? 'text-red-400 font-bold' : isVictim ? 'text-amber-400' : 'text-dram-muted'}`}>
                    {r}
                  </div>
                  {/* Row type badge */}
                  <div className={`w-6 text-xs font-mono ${isAggressor ? 'text-red-400' : isVictim ? 'text-amber-400' : 'text-transparent'}`}>
                    {isAggressor ? '⚔' : isVictim ? '⚡' : '·'}
                  </div>
                  {/* Cell bits */}
                  <div className={`flex gap-0.5 px-1 py-0.5 rounded border transition-colors ${
                    isAggressor
                      ? 'border-red-700/60 bg-red-900/20'
                      : isVictim
                      ? `border-amber-700/${Math.floor(distRatio * 60) + 20} bg-amber-900/${Math.floor(distRatio * 20)}`
                      : 'border-transparent'
                  }`}>
                    {row.map((cell, c) => (
                      <div key={c}
                        className={`w-3.5 h-4 rounded-sm text-center text-xs leading-4 font-mono transition-colors ${
                          cell.val !== cell.orig
                            ? 'bg-red-500/80 text-white font-bold'
                            : cell.val === 1
                            ? 'bg-dram-blue/40 text-dram-blue'
                            : 'bg-dram-border text-dram-muted'
                        }`}>
                        {cell.val}
                      </div>
                    ))}
                  </div>
                  {/* Disturbance bar */}
                  <div className="w-16 h-3 bg-dram-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${distRatio * 100}%`,
                        backgroundColor: distRatio > 0.8 ? '#ef4444' : distRatio > 0.4 ? '#f59e0b' : '#22c55e',
                      }} />
                  </div>
                  {hammered > 0 && (
                    <span className="text-xs font-mono text-red-400/70">
                      {(hammered / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-xs text-dram-muted">
            {isZh ? <>⚔ = 攻击行 &nbsp;⚡ = 受害行 &nbsp;<span className="text-red-400">红色位 = 已翻转</span></> : <>⚔ = aggressor &nbsp;⚡ = victim &nbsp;<span className="text-red-400">red bits = flipped</span></>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">{isZh ? '攻击模式' : 'Attack mode'}</div>
            <div className="flex gap-2">
              {(isZh ? [['single', '单面锤击'], ['double', '双面锤击']] : [['single', 'Single-sided'], ['double', 'Double-sided']]).map(([v, lbl]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    mode === v ? 'bg-red-900/20 border-red-700/40 text-red-300' : 'border-dram-border text-dram-muted'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
            <p className="text-xs text-dram-muted mt-1">
              {isZh ? '双面锤击同时攻击两行（攻击行 & 攻击行+2），从两侧同时扰动受害行（攻击行+1）。' : 'Double-sided attacks two rows (aggressor & aggressor+2) simultaneously, distressing row aggressor+1 from both sides.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(isZh ? [
              ['总锤击次数', `${(totalHammers / 1000).toFixed(0)}k`, '#ef4444'],
              ['位翻转', totalFlips, '#f59e0b'],
            ] : [
              ['Total hammers', `${(totalHammers / 1000).toFixed(0)}k`, '#ef4444'],
              ['Bit flips', totalFlips, '#f59e0b'],
            ]).map(([k, v, c]) => (
              <div key={k} className="bg-dram-bg rounded-lg p-3">
                <div className="text-xs text-dram-muted">{k}</div>
                <div className="text-2xl font-bold font-mono" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={isHammering ? stopHammer : startHammer}
              disabled={aggressorRow === null}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isHammering
                  ? 'bg-red-900/30 border-red-700/50 text-red-300 hover:bg-red-900/50'
                  : 'bg-amber-900/20 border-amber-700/40 text-amber-300 hover:bg-amber-800/30'
                }`}>
              {isZh ? (isHammering ? '■ 停止' : '▶ 锤击') : (isHammering ? '■ Stop' : '▶ Hammer')}
            </button>
            <button onClick={resetAll}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-dram-border text-dram-muted hover:text-dram-text transition-colors">
              {isZh ? '重置' : 'Reset'}
            </button>
          </div>

          {flipLog.length > 0 && (
            <div className="rounded-lg p-3 bg-red-900/10 border border-red-700/30">
              <div className="text-xs font-semibold text-red-400 mb-1">{isZh ? '位翻转日志' : 'Bit flip log'}</div>
              <div className="text-xs font-mono text-red-300/70 space-y-0.5">
                {flipLog.slice(-8).map((f, i) => (
                  <div key={i}>{f}: {isZh ? '已翻转' : 'flipped'}</div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted space-y-1">
            <div className="font-semibold text-dram-text">{isZh ? 'RowHammer 背景' : 'Rowhammer background'}</div>
            <div>{isZh
              ? `Kim 等人（ISCA 2014）发现，在 64 ms tREFW 内约 ${(HAMMER_THRESHOLD/1000).toFixed(0)}k–150k 次激活即可翻转受害行中的位。机制：通过 NMOS 访问晶体管反复泵入电荷，产生热载流子，穿透相邻行访问晶体管的栅氧化层，干扰存储电荷。`
              : `Kim et al. (2014, ISCA) showed ~${(HAMMER_THRESHOLD/1000).toFixed(0)}k–150k activations within 64 ms tREFW can flip bits in victim rows. Mechanism: repeated charge pumping through the NMOS access transistor creates hot carriers that penetrate the gate oxide of adjacent rows, disturbing stored charge.`
            }</div>
          </div>
        </div>
      </div>
    </div>
  )
}
