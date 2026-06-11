import { useState, useMemo } from 'react'

const Z0 = 50    // PCB trace impedance
const VDD = 1.2  // SSTL/POD supply

function eyeQuality(rtt, ioStd) {
  // Model: reflection coefficient Γ = (Rtt - Z0) / (Rtt + Z0)
  const gamma = (rtt - Z0) / (rtt + Z0)
  const reflection = Math.abs(gamma)
  // Eye opening: 1 = perfect, 0 = closed
  // POD needs Rtt to pull up; SSTL uses differential termination
  const baseOpen = ioStd === 'pod' ? 0.9 : 0.85
  const eyeV = baseOpen * (1 - reflection * 0.8)
  const eyeT = 0.85 * (1 - reflection * 0.5)
  return { eyeV: Math.max(0.1, eyeV), eyeT: Math.max(0.1, eyeT), reflection }
}

function EyeDiagram({ eyeV, eyeT, ioStd }) {
  const svgW = 200
  const svgH = 120
  const cx = svgW / 2
  const cy = svgH / 2
  const halfH = eyeV * 45
  const halfT = eyeT * 70

  const color = eyeV > 0.6 ? '#22c55e' : eyeV > 0.3 ? '#f59e0b' : '#ef4444'

  // Draw multiple overlapping eye traces
  const traces = []
  for (let i = 0; i < 8; i++) {
    const jitter = (Math.random() - 0.5) * (1 - eyeT) * 12
    const noise = (Math.random() - 0.5) * (1 - eyeV) * 10
    const x0 = 10, x1 = cx - halfT + jitter, x2 = cx + halfT + jitter, x3 = svgW - 10
    const yMid = cy + noise
    traces.push({ x0, x1, x2, x3, yMid })
  }

  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: svgW }}>
      <rect width={svgW} height={svgH} fill="#0f172a" rx="4" />
      {/* Grid */}
      <line x1="0" y1={cy} x2={svgW} y2={cy} stroke="#1e293b" strokeWidth="1" />
      <line x1={cx} y1="0" x2={cx} y2={svgH} stroke="#1e293b" strokeWidth="1" />

      {/* Eye traces */}
      {traces.map((tr, i) => {
        const yTop = cy - halfH + (Math.random() - 0.5) * 6
        const yBot = cy + halfH + (Math.random() - 0.5) * 6
        return (
          <g key={i} opacity="0.6">
            <path d={`M ${tr.x0},${yTop} L ${tr.x1},${cy} L ${tr.x2},${cy} L ${tr.x3},${yTop}`}
              fill="none" stroke={color} strokeWidth="0.8" />
            <path d={`M ${tr.x0},${yBot} L ${tr.x1},${cy} L ${tr.x2},${cy} L ${tr.x3},${yBot}`}
              fill="none" stroke={color} strokeWidth="0.8" />
          </g>
        )
      })}

      {/* Eye opening box */}
      <rect x={cx - halfT} y={cy - halfH} width={halfT * 2} height={halfH * 2}
        fill={color + '15'} stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Labels */}
      <text x={cx} y={cy - halfH - 4} textAnchor="middle" fill={color} fontSize="8">
        {(eyeV * 100).toFixed(0)}% height
      </text>
      <text x={cx + halfT + 3} y={cy + 3} fill={color} fontSize="7">
        {(eyeT * 100).toFixed(0)}% width
      </text>

      {/* IO standard label */}
      <text x="4" y="12" fill="#475569" fontSize="8">{ioStd === 'pod' ? 'POD-1.2' : 'SSTL-1.2'}</text>
    </svg>
  )
}

export default function ODTViz({ lang = 'en' }) {
  const [rtt, setRtt] = useState(60)
  const [ioStd, setIoStd] = useState('pod')
  const [odtTiming, setOdtTiming] = useState('dynamic')

  const isZh = lang === 'zh'

  const { eyeV, eyeT, reflection } = useMemo(() => eyeQuality(rtt, ioStd), [rtt, ioStd])

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? 'ODT（On-Die Termination 片上终端）— 眼图响应' : 'On-Die Termination — Eye Diagram Response'}
      </h3>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Eye diagram */}
        <div className="flex-shrink-0">
          <div className="text-xs text-dram-muted mb-2 text-center">
            {isZh ? '眼图（仿真）' : 'Eye diagram (simulated)'}
          </div>
          <EyeDiagram key={`${rtt}-${ioStd}`} eyeV={eyeV} eyeT={eyeT} ioStd={ioStd} />
          <div className="mt-2 text-center">
            <span className={`text-sm font-bold ${eyeV > 0.6 ? 'text-dram-green' : eyeV > 0.3 ? 'text-amber-400' : 'text-red-400'}`}>
              {eyeV > 0.6
                ? (isZh ? '✓ 张开' : '✓ Open')
                : eyeV > 0.3
                  ? (isZh ? '⚠ 临界' : '⚠ Marginal')
                  : (isZh ? '✗ 闭合' : '✗ Closed')}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5">
          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              {isZh ? (
                <>Rtt（终端匹配阻抗）：<span className="text-dram-amber font-mono">{rtt} Ω</span></>
              ) : (
                <>Rtt (ODT value): <span className="text-dram-amber font-mono">{rtt} Ω</span></>
              )}
            </label>
            <input type="range" min="20" max="240" step="20"
              value={rtt} onChange={(e) => setRtt(Number(e.target.value))}
              className="w-full accent-amber-400" />
            <div className="flex justify-between text-xs text-dram-muted mt-0.5">
              <span>{isZh ? '20Ω（过阻尼）' : '20Ω (overdamp)'}</span>
              <span className="text-dram-green">{isZh ? '60Ω（最优）' : '60Ω (optimal)'}</span>
              <span>{isZh ? '240Ω（欠阻尼）' : '240Ω (underdamp)'}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
              {isZh ? 'I/O 标准' : 'I/O Standard'}
            </div>
            <div className="flex gap-2">
              {[['pod', 'POD-1.2 (DDR4/5)'], ['sstl', 'SSTL-1.2 (DDR3)']].map(([v, lbl]) => (
                <button key={v} onClick={() => setIoStd(v)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    ioStd === v ? 'bg-dram-blue/20 border-dram-blue text-dram-blue' : 'border-dram-border text-dram-muted'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-4 bg-dram-bg text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-dram-muted">{isZh ? '走线阻抗 Z₀' : 'Trace impedance Z₀'}</span>
              <span className="font-mono text-dram-text">{Z0} Ω</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dram-muted">{isZh ? '反射系数 Γ' : 'Reflection coefficient Γ'}</span>
              <span className={`font-mono ${reflection < 0.2 ? 'text-dram-green' : reflection < 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                {reflection.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dram-muted">Γ = (Rtt − Z₀) / (Rtt + Z₀)</span>
              <span className="font-mono text-dram-muted">= ({rtt}−{Z0})/({rtt}+{Z0})</span>
            </div>
            <div className="flex justify-between border-t border-dram-border pt-2">
              <span className="text-dram-muted">{isZh ? '最小反射时最优 Rtt' : 'Best Rtt for min reflection'}</span>
              <span className="font-mono text-dram-green">{Z0} Ω (Γ = 0)</span>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-dram-border text-xs">
            <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
              <div>{isZh ? '标准' : 'Standard'}</div>
              <div>{isZh ? '驱动器' : 'Driver'}</div>
              <div>{isZh ? '备注' : 'Notes'}</div>
            </div>
            {isZh ? [
              ['SSTL-1.2', '推挽', 'DDR3 — 差分终端匹配'],
              ['POD-1.2', '开漏', 'DDR4/5 — 仅上拉；功耗更低'],
            ].map(([std, drv, note]) => (
              <div key={std} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
                <div className={ioStd === std.toLowerCase().split('-')[0] ? 'text-dram-blue font-bold' : 'text-dram-muted'}>{std}</div>
                <div className="text-dram-muted">{drv}</div>
                <div className="text-dram-muted">{note}</div>
              </div>
            )) : [
              ['SSTL-1.2', 'Push-pull', 'DDR3 — differential termination'],
              ['POD-1.2', 'Open drain', 'DDR4/5 — pull-up only; lower power'],
            ].map(([std, drv, note]) => (
              <div key={std} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
                <div className={ioStd === std.toLowerCase().split('-')[0] ? 'text-dram-blue font-bold' : 'text-dram-muted'}>{std}</div>
                <div className="text-dram-muted">{drv}</div>
                <div className="text-dram-muted">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
