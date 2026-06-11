import { useState, useEffect, useRef } from 'react'

export default function DRAMCellViz({ mode = 'explore', lang = 'en' }) {
  const isZh = lang === 'zh'
  const [charge, setCharge] = useState(0.85)
  const [wordline, setWordline] = useState(false)
  const [bitline, setBitline] = useState(null)
  const [status, setStatus] = useState(isZh ? '空闲 — wordline 低电平，存储单元隔离' : 'Idle — wordline LOW, cell isolated')
  const [leaking, setLeaking] = useState(false)
  const leakRef = useRef(null)

  const bit = charge > 0.5 ? 1 : 0

  const activateWordline = () => {
    setWordline(true)
    setBitline(charge)
    setStatus(isZh
      ? `Wordline 高电平 — 存储单元接通。位线充电至 ${(charge * 1.5).toFixed(2)}V。灵敏放大器检测：逻辑 ${bit}`
      : `Wordline HIGH — cell connected. Bit line charges to ${(charge * 1.5).toFixed(2)}V. Sense amp detects: logic ${bit}`)
    setTimeout(() => {
      setWordline(false)
      setStatus(isZh
        ? `Wordline 低电平 — 存储单元已恢复。存储值：${bit}`
        : `Wordline LOW — cell restored. Stored value: ${bit}`)
    }, 2000)
  }

  const writeValue = (val) => {
    setWordline(true)
    setStatus(isZh
      ? `写入 ${val}… wordline 高电平，将位线驱动至 ${val === 1 ? 'Vdd (~1.2V)' : 'GND (0V)'}`
      : `Writing ${val}… wordline HIGH, driving bit line to ${val === 1 ? 'Vdd (~1.2V)' : 'GND (0V)'}`)
    setTimeout(() => {
      setCharge(val === 1 ? 0.9 : 0.05)
      setWordline(false)
      setBitline(null)
      setStatus(isZh
        ? `写入完成。存储单元现在存储逻辑 ${val}`
        : `Write complete. Cell now stores logic ${val}`)
    }, 1500)
  }

  const startLeak = () => {
    setLeaking(true)
    setStatus(isZh ? '漏电中… 电容电荷缓慢流失（未刷新！）' : 'Leaking… capacitor charge slowly draining (no refresh!)')
  }

  const stopLeak = () => {
    setLeaking(false)
    setStatus(isZh ? '漏电已停止' : 'Leak stopped')
  }

  const refresh = () => {
    setLeaking(false)
    const saved = bit
    setCharge(saved === 1 ? 0.9 : 0.05)
    setStatus(isZh
      ? `刷新完成！灵敏放大器读取到 ${saved}，已恢复满电荷。`
      : `Refreshed! Sense amp read ${saved}, restored full charge.`)
  }

  useEffect(() => {
    if (!leaking) return
    leakRef.current = setInterval(() => {
      setCharge((c) => {
        const next = Math.max(0, c - 0.02)
        if (next === 0) {
          setLeaking(false)
          setStatus(isZh
            ? '⚠️ 电荷丢失！数据损坏 — 未刷新导致比特翻转为 0！'
            : '⚠️ Charge lost! Data corrupted — bit flipped to 0 without refresh!')
        }
        return next
      })
    }, 150)
    return () => clearInterval(leakRef.current)
  }, [leaking])

  const chargeColor = charge > 0.5 ? '#22c55e' : '#ef4444'
  const fillHeight = Math.round(charge * 80)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        {isZh ? 'DRAM 存储单元（1T1C）— 交互式' : 'DRAM Cell (1T1C) — interactive'}
      </h3>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cell diagram */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox="0 0 240 280" style={{ maxWidth: 240 }}>
            {/* Bit line (vertical) */}
            <line x1="120" y1="10" x2="120" y2="90"
              stroke={wordline ? '#3b82f6' : '#334155'} strokeWidth="3"
              className="dram-transition"
            />
            <text x="145" y="50" fill="#3b82f6" fontSize="11" fontWeight="bold">Bit Line</text>
            {wordline && (
              <circle cx="120" cy="50" r="5" fill="#3b82f6" className="animate-pulse-glow" />
            )}

            {/* Wordline (horizontal) */}
            <line x1="20" y1="110" x2="240" y2="110"
              stroke={wordline ? '#f59e0b' : '#334155'} strokeWidth="3"
              className="dram-transition"
            />
            <text x="22" y="105" fill="#f59e0b" fontSize="11" fontWeight="bold">
              Word Line {wordline ? '(HIGH)' : '(LOW)'}
            </text>

            {/* Transistor body */}
            <rect x="95" y="90" width="50" height="40" rx="5"
              fill={wordline ? '#f59e0b22' : '#1e293b'}
              stroke={wordline ? '#f59e0b' : '#475569'}
              strokeWidth="2"
              className="dram-transition"
            />
            <text x="120" y="108" textAnchor="middle" fill={wordline ? '#f59e0b' : '#64748b'} fontSize="10">NMOS</text>
            <text x="120" y="122" textAnchor="middle" fill={wordline ? '#f59e0b' : '#64748b'} fontSize="9">
              {wordline ? 'ON' : 'OFF'}
            </text>

            {/* Wire from transistor to capacitor */}
            <line x1="120" y1="130" x2="120" y2="155"
              stroke={wordline ? '#f59e0b' : '#334155'} strokeWidth="2.5"
              className="dram-transition"
            />

            {/* Capacitor plates */}
            <rect x="65" y="155" width="110" height="12" rx="2"
              fill="#334155" stroke="#475569" strokeWidth="1.5"
            />
            <rect x="65" y="247" width="110" height="12" rx="2"
              fill="#334155" stroke="#475569" strokeWidth="1.5"
            />

            {/* Capacitor fill (charge level) */}
            <rect x="66" y={167 + (80 - fillHeight)} width="108" height={fillHeight}
              fill={chargeColor} opacity="0.7"
              className="dram-transition"
            />
            <rect x="66" y="167" width="108" height="80" rx="0"
              fill="none" stroke="#475569" strokeWidth="1"
            />

            {/* Charge label */}
            <text x="120" y="215" textAnchor="middle"
              fill={chargeColor} fontSize="14" fontWeight="bold"
              className="dram-transition"
            >
              {Math.round(charge * 100)}%
            </text>
            <text x="120" y="228" textAnchor="middle" fill="#64748b" fontSize="10">{isZh ? '电荷' : 'charge'}</text>

            {/* Cell plate — biased at Vdd/2, NOT ground */}
            <line x1="120" y1="259" x2="120" y2="266" stroke="#475569" strokeWidth="2" />
            <line x1="90" y1="266" x2="150" y2="266" stroke="#f59e0b" strokeWidth="2" />
            <text x="120" y="278" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">Vdd/2 = 0.6 V</text>
            <text x="120" y="289" textAnchor="middle" fill="#64748b" fontSize="8">(cell plate reference)</text>

            {/* Bit value badge */}
            <rect x="10" y="155" width="50" height="30" rx="5"
              fill={bit === 1 ? '#16653b' : '#7f1d1d'}
              stroke={bit === 1 ? '#22c55e' : '#ef4444'}
              strokeWidth="1.5"
            />
            <text x="35" y="165" textAnchor="middle" fill="#94a3b8" fontSize="9">{isZh ? '存储值' : 'Stored'}</text>
            <text x="35" y="178" textAnchor="middle"
              fill={bit === 1 ? '#22c55e' : '#ef4444'} fontSize="16" fontWeight="bold"
            >
              {bit}
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          {/* Status */}
          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted font-mono min-h-12">
            {status}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={activateWordline}
              disabled={wordline || leaking}
              className="px-3 py-2 rounded-lg bg-amber-900/30 text-amber-400 text-sm font-medium
                         border border-amber-700/40 hover:bg-amber-900/50 disabled:opacity-40
                         transition-colors"
            >
              {isZh ? '读取存储单元' : 'Read Cell'}
            </button>
            <button
              onClick={() => writeValue(1)}
              disabled={wordline || leaking}
              className="px-3 py-2 rounded-lg bg-green-900/30 text-green-400 text-sm font-medium
                         border border-green-700/40 hover:bg-green-900/50 disabled:opacity-40
                         transition-colors"
            >
              Write 1
            </button>
            <button
              onClick={() => writeValue(0)}
              disabled={wordline || leaking}
              className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm font-medium
                         border border-red-700/40 hover:bg-red-900/50 disabled:opacity-40
                         transition-colors"
            >
              Write 0
            </button>
            {!leaking ? (
              <button
                onClick={startLeak}
                disabled={wordline}
                className="px-3 py-2 rounded-lg bg-slate-700/50 text-dram-muted text-sm font-medium
                           border border-dram-border hover:bg-slate-700 disabled:opacity-40
                           transition-colors"
              >
                {isZh ? '模拟漏电' : 'Simulate Leak'}
              </button>
            ) : (
              <button
                onClick={stopLeak}
                className="px-3 py-2 rounded-lg bg-slate-700/50 text-dram-muted text-sm font-medium
                           border border-dram-border hover:bg-slate-700 transition-colors"
              >
                {isZh ? '停止漏电' : 'Stop Leak'}
              </button>
            )}
          </div>

          {(leaking || charge < 0.4) && (
            <button
              onClick={refresh}
              className="w-full px-3 py-2 rounded-lg bg-blue-900/40 text-blue-400 text-sm font-medium
                         border border-blue-700/50 hover:bg-blue-900/60 transition-colors
                         animate-pulse"
            >
              {isZh ? '⚡ 刷新行' : '⚡ Refresh Row'}
            </button>
          )}

          <div className="text-xs text-dram-muted space-y-1 pt-2 border-t border-dram-border">
            <p><strong className="text-dram-text">{isZh ? '电荷 > 50%' : 'Charge > 50%'}</strong> → {isZh ? '逻辑 1' : 'logic 1'}</p>
            <p><strong className="text-dram-text">{isZh ? '电荷 ≤ 50%' : 'Charge ≤ 50%'}</strong> → {isZh ? '逻辑 0' : 'logic 0'}</p>
            <p><strong className="text-dram-text">{isZh ? '读操作具有破坏性' : 'Read is destructive'}</strong>{isZh ? ' — 灵敏放大器必须恢复电荷' : ' — sense amp must restore charge'}</p>
            <p><strong className="text-dram-text">{isZh ? '刷新周期' : 'Refresh period'}</strong> ≈ 64 ms {isZh ? '（8192 行循环）' : '(8192 rows cycled)'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
