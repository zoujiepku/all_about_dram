import { useState, useMemo } from 'react'

const k_eV = 8.617e-5  // Boltzmann in eV/K
const Ea = 0.65        // activation energy in eV (typical DRAM charge retention)
const tau0 = 0.001     // pre-exponential in ms (calibrated so tau(85°C)~64ms)

function retentionMs(tempC) {
  const T = tempC + 273.15
  return tau0 * Math.exp(Ea / (k_eV * T))
}

// Calibrate: at 85°C, tau should be ~64ms (JEDEC spec)
const tau85 = retentionMs(85)
const scale = 64 / tau85  // calibration factor

function tauMs(tempC) {
  return retentionMs(tempC) * scale
}

function formatMs(ms) {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)} min`
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
  return `${ms.toFixed(0)} ms`
}

const TEMPS = Array.from({ length: 13 }, (_, i) => 25 + i * 5)  // 25 to 85°C

export default function RetentionViz({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [tempC, setTempC] = useState(55)
  const [showRule, setShowRule] = useState(true)

  const tau = tauMs(tempC)
  const tau25 = tauMs(25)
  const tau85 = tauMs(85)

  const plotPoints = useMemo(() => TEMPS.map((t) => ({
    t, tau: tauMs(t), frac: Math.log10(tauMs(t)) / Math.log10(tau25)
  })), [])

  const maxLogTau = Math.log10(tau25)
  const minLogTau = Math.log10(tau85)

  const svgW = 320
  const svgH = 180
  const pad = { l: 50, r: 20, t: 15, b: 35 }
  const plotW = svgW - pad.l - pad.r
  const plotH = svgH - pad.t - pad.b

  const tToX = (t) => pad.l + ((t - 25) / (85 - 25)) * plotW
  const tauToY = (ms) => {
    const log = Math.log10(ms)
    const frac = (log - minLogTau) / (maxLogTau - minLogTau)
    return pad.t + plotH - frac * plotH
  }

  const pathD = plotPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${tToX(p.t).toFixed(1)},${tauToY(p.tau).toFixed(1)}`).join(' ')

  const cx = tToX(tempC)
  const cy = tauToY(tau)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? '保持时间 vs. 温度 — Arrhenius 模型' : 'Retention vs. Temperature — Arrhenius Model'}
      </h3>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Chart */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: svgW }}>
            {/* Axes */}
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + plotH} stroke="#475569" strokeWidth="1" />
            <line x1={pad.l} y1={pad.t + plotH} x2={pad.l + plotW} y2={pad.t + plotH} stroke="#475569" strokeWidth="1" />

            {/* Y grid + labels */}
            {[25, 55, 85].map((t) => {
              const y = tauToY(tauMs(t))
              return (
                <g key={t}>
                  <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="#1e293b" strokeWidth="1" />
                  <text x={pad.l - 4} y={y + 1} textAnchor="end" dominantBaseline="middle"
                    fill="#64748b" fontSize="8">{formatMs(tauMs(t))}</text>
                </g>
              )
            })}

            {/* X axis labels */}
            {[25, 45, 65, 85].map((t) => (
              <text key={t} x={tToX(t)} y={svgH - 15} textAnchor="middle" fill="#64748b" fontSize="9">
                {t}°C
              </text>
            ))}
            <text x={pad.l + plotW / 2} y={svgH - 3} textAnchor="middle" fill="#64748b" fontSize="9">
              {isZh ? '温度' : 'Temperature'}
            </text>
            <text x={10} y={pad.t + plotH / 2} textAnchor="middle" fill="#64748b" fontSize="9"
              transform={`rotate(-90, 10, ${pad.t + plotH / 2})`}>
              {isZh ? '保持时间' : 'Retention'}
            </text>

            {/* Arrhenius curve */}
            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />

            {/* JEDEC 85°C spec line */}
            <line x1={pad.l} y1={tauToY(64)} x2={pad.l + plotW} y2={tauToY(64)}
              stroke="#ef444460" strokeWidth="1" strokeDasharray="4 3" />
            <text x={pad.l + plotW - 2} y={tauToY(64) - 3} textAnchor="end" fill="#ef4444" fontSize="8">
              64 ms (JEDEC @85°C)
            </text>

            {/* 2× per 10°C rule lines */}
            {showRule && [35, 45, 55, 65, 75].map((t) => {
              const y1 = tauToY(tauMs(t + 10))
              const y2 = tauToY(tauMs(t))
              const x = tToX(t + 5)
              return (
                <g key={t}>
                  <line x1={x} y1={y1} x2={x} y2={y2} stroke="#f59e0b50" strokeWidth="1" />
                  <text x={x + 2} y={(y1 + y2) / 2} fill="#f59e0b80" fontSize="7">2×</text>
                </g>
              )
            })}

            {/* Current temp indicator */}
            <circle cx={cx} cy={cy} r="5" fill="#22c55e" stroke="#0f172a" strokeWidth="1.5" />
            <line x1={cx} y1={pad.t} x2={cx} y2={pad.t + plotH} stroke="#22c55e50" strokeWidth="1" strokeDasharray="3 2" />
            <text x={cx + 7} y={cy} fill="#22c55e" fontSize="9" dominantBaseline="middle">
              {tempC}°C: {formatMs(tau)}
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              {isZh ? '温度：' : 'Temperature: '}<span className="text-dram-amber font-mono">{tempC}°C</span>
            </label>
            <input type="range" min="25" max="85" step="5"
              value={tempC} onChange={(e) => setTempC(Number(e.target.value))}
              className="w-full accent-amber-400" />
            <div className="flex justify-between text-xs text-dram-muted mt-0.5">
              <span>25°C</span>
              <span>55°C</span>
              <span>85°C ({isZh ? 'TCASE 最高温' : 'TCASE max'})</span>
            </div>
          </div>

          <div className="rounded-lg p-4 bg-dram-bg text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-dram-muted">{isZh ? `${tempC}°C 保持时间` : `Retention @ ${tempC}°C`}</span>
              <span className="font-bold font-mono text-dram-green">{formatMs(tau)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dram-muted">{isZh ? '25°C 保持时间' : 'Retention @ 25°C'}</span>
              <span className="font-bold font-mono text-dram-blue">{formatMs(tau25)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dram-muted">{isZh ? '85°C 保持时间' : 'Retention @ 85°C'}</span>
              <span className="font-bold font-mono text-amber-400">64 ms ({isZh ? '规格' : 'spec'})</span>
            </div>
            <div className="border-t border-dram-border pt-2 text-xs text-dram-muted font-mono">
              τ(T) = τ₀ · exp(Ea / kT)<br />
              Ea ≈ {Ea} eV, k = {k_eV.toExponential(3)} eV/K
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-dram-text">
            <input type="checkbox" checked={showRule} onChange={(e) => setShowRule(e.target.checked)}
              className="accent-amber-400" />
            {isZh ? '显示每 10°C 减半规则' : 'Show 2× per 10°C rule'}
          </label>

          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted space-y-1">
            <div className="font-semibold text-dram-text">{isZh ? '可变保持时间（VRT）' : 'Variable Retention Time (VRT)'}</div>
            <div>
              {isZh
                ? '部分存储单元表现出 VRT——其保持时间在长值与短值之间随机切换（切换间隔为数小时）。这被认为是由存储节点附近的单个氧化层陷阱间歇性捕获/释放电荷所致。VRT 单元在测试中最难筛查——室温下可通过所有测试，却可能在数月后失效，尤其是在高温下。'
                : 'Some cells exhibit VRT — their retention time randomly switches between a long and short value (hours apart). This is thought to be caused by a single oxide trap near the storage node that intermittently captures/releases charge. VRT cells are the hardest to screen at test — they pass at room temperature but may fail months later, especially at elevated temperature.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
