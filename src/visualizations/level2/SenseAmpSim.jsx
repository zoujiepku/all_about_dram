import { useState, useEffect, useRef } from 'react'

const VDD = 1.2

export default function SenseAmpSim({ lang = 'en' }) {
  const [csRatio, setCsRatio] = useState(0.10)
  const [storedBit, setStoredBit] = useState(1)
  const [phase, setPhase] = useState('precharge')
  const [blV, setBlV] = useState(VDD / 2)
  const [blbV, setBlbV] = useState(VDD / 2)
  const intervalRef = useRef(null)

  const isZh = lang === 'zh'

  const deltaV = csRatio * VDD / 2
  const noiseMargin = 15  // mV — typical SA offset

  const reset = () => {
    clearInterval(intervalRef.current)
    setPhase('precharge')
    setBlV(VDD / 2)
    setBlbV(VDD / 2)
  }

  const connectCell = () => {
    if (phase !== 'precharge') return
    const dv = deltaV * (storedBit === 1 ? 1 : -1)
    setBlV(VDD / 2 + dv)
    setBlbV(VDD / 2)
    setPhase('sharing')
  }

  const fireSA = () => {
    if (phase !== 'sharing') return
    setPhase('firing')
    const dv = deltaV * (storedBit === 1 ? 1 : -1)
    const startBL = VDD / 2 + dv
    const startBLB = VDD / 2
    const targetBL = storedBit === 1 ? VDD : 0
    const targetBLB = storedBit === 1 ? 0 : VDD
    let step = 0
    intervalRef.current = setInterval(() => {
      step++
      const t = Math.min(step / 25, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setBlV(startBL + ease * (targetBL - startBL))
      setBlbV(startBLB + ease * (targetBLB - startBLB))
      if (t >= 1) {
        clearInterval(intervalRef.current)
        setPhase('done')
      }
    }, 25)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const reliable = deltaV * 1000 > noiseMargin
  const pctBL = (blV / VDD) * 100
  const pctBLB = (blbV / VDD) * 100

  const phaseSteps = isZh
    ? [
        { key: 'precharge', label: '预充电' },
        { key: 'sharing',   label: '电荷共享' },
        { key: 'firing',    label: '放大器触发' },
        { key: 'done',      label: '判决完成' },
      ]
    : [
        { key: 'precharge', label: 'Precharge' },
        { key: 'sharing',   label: 'Charge Share' },
        { key: 'firing',    label: 'SA Fires' },
        { key: 'done',      label: 'Resolved' },
      ]
  const phaseIdx = phaseSteps.findIndex((p) => p.key === phase)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        {isZh ? '灵敏放大器模拟器' : 'Sense Amplifier Simulator'}
      </h3>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Schematic */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox="0 0 220 260" style={{ maxWidth: 220 }}>
            {/* VDD rail */}
            <line x1="50" y1="18" x2="170" y2="18" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="110" y="13" textAnchor="middle" fill="#3b82f6" fontSize="9">Vdd = {VDD}V</text>

            {/* SAP switches */}
            <rect x="55" y="22" width="45" height="18" rx="2"
              fill={phase === 'firing' || phase === 'done' ? '#3b82f620' : '#33415520'}
              stroke={phase === 'firing' || phase === 'done' ? '#3b82f6' : '#475569'}
              strokeWidth="1" />
            <text x="78" y="34" textAnchor="middle" fill="#94a3b8" fontSize="8">SAP</text>
            <rect x="120" y="22" width="45" height="18" rx="2"
              fill={phase === 'firing' || phase === 'done' ? '#3b82f620' : '#33415520'}
              stroke={phase === 'firing' || phase === 'done' ? '#3b82f6' : '#475569'}
              strokeWidth="1" />
            <text x="143" y="34" textAnchor="middle" fill="#94a3b8" fontSize="8">SAP</text>

            {/* PMOS pair */}
            <rect x="55" y="44" width="45" height="28" rx="3"
              fill="#1e40af20" stroke="#3b82f6" strokeWidth="1" />
            <text x="78" y="60" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">M3</text>
            <text x="78" y="70" textAnchor="middle" fill="#64748b" fontSize="8">PMOS</text>

            <rect x="120" y="44" width="45" height="28" rx="3"
              fill="#1e40af20" stroke="#3b82f6" strokeWidth="1" />
            <text x="143" y="60" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">M4</text>
            <text x="143" y="70" textAnchor="middle" fill="#64748b" fontSize="8">PMOS</text>

            {/* BL and BLB nodes */}
            <circle cx="78" cy="90" r="4"
              fill={phase === 'done' ? (storedBit === 1 ? '#22c55e' : '#ef4444') : '#f59e0b'}
            />
            <circle cx="143" cy="90" r="4"
              fill={phase === 'done' ? (storedBit === 0 ? '#22c55e' : '#ef4444') : '#f59e0b'}
            />

            {/* Cross-coupling lines */}
            <line x1="82" y1="90" x2="116" y2="112" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="139" y1="90" x2="104" y2="112" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
            <text x="110" y="103" textAnchor="middle" fill="#f59e0b" fontSize="8">×</text>

            {/* NMOS pair */}
            <rect x="55" y="116" width="45" height="28" rx="3"
              fill="#14532d20" stroke="#22c55e" strokeWidth="1" />
            <text x="78" y="132" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">M1</text>
            <text x="78" y="142" textAnchor="middle" fill="#64748b" fontSize="8">NMOS</text>

            <rect x="120" y="116" width="45" height="28" rx="3"
              fill="#14532d20" stroke="#22c55e" strokeWidth="1" />
            <text x="143" y="132" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">M2</text>
            <text x="143" y="142" textAnchor="middle" fill="#64748b" fontSize="8">NMOS</text>

            {/* SAN switches */}
            <rect x="55" y="148" width="45" height="18" rx="2"
              fill={phase === 'firing' || phase === 'done' ? '#22c55e20' : '#33415520'}
              stroke={phase === 'firing' || phase === 'done' ? '#22c55e' : '#475569'}
              strokeWidth="1" />
            <text x="78" y="160" textAnchor="middle" fill="#94a3b8" fontSize="8">SAN</text>
            <rect x="120" y="148" width="45" height="18" rx="2"
              fill={phase === 'firing' || phase === 'done' ? '#22c55e20' : '#33415520'}
              stroke={phase === 'firing' || phase === 'done' ? '#22c55e' : '#475569'}
              strokeWidth="1" />
            <text x="143" y="160" textAnchor="middle" fill="#94a3b8" fontSize="8">SAN</text>

            {/* GND rail */}
            <line x1="50" y1="172" x2="170" y2="172" stroke="#22c55e" strokeWidth="1.5" />
            <text x="110" y="183" textAnchor="middle" fill="#22c55e" fontSize="9">GND</text>

            {/* BL wire left */}
            <line x1="10" y1="90" x2="54" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="8" y="93" textAnchor="end" fill="#f59e0b" fontSize="9">BL</text>

            {/* BLB wire right */}
            <line x1="166" y1="90" x2="210" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="212" y="93" fill="#f59e0b" fontSize="9">BLB</text>

            {/* Cell capacitor on BL */}
            <line x1="10" y1="90" x2="10" y2="200" stroke="#64748b" strokeWidth="1" />
            <line x1="3" y1="198" x2="18" y2="198" stroke={storedBit === 1 ? '#22c55e' : '#ef4444'} strokeWidth="2" />
            <line x1="3" y1="204" x2="18" y2="204" stroke="#64748b" strokeWidth="2" />
            <line x1="10" y1="205" x2="10" y2="215" stroke="#64748b" strokeWidth="1" />
            <text x="10" y="225" textAnchor="middle" fill="#64748b" fontSize="8">Cs</text>
            <text x="10" y="235" textAnchor="middle" fill={storedBit === 1 ? '#22c55e' : '#ef4444'} fontSize="8">
              {storedBit === 1 ? 'Vdd' : '0V'}
            </text>

            {/* access transistor gate */}
            <rect x="3" y="175" width="14" height="12" rx="1" fill="#f59e0b20" stroke="#f59e0b" strokeWidth="1" />
            <text x="10" y="184" textAnchor="middle" fill="#f59e0b" fontSize="7">WL</text>

            {/* Phase label */}
            <text x="110" y="247" textAnchor="middle" fill="#64748b" fontSize="9" fontStyle="italic">
              {isZh
                ? `交叉耦合锁存 — SA${phase === 'done' ? ' 判决完成' : phase === 'firing' ? ' 锁存中…' : ' 空闲'}`
                : `Cross-coupled latch — SA${phase === 'done' ? ' resolved' : phase === 'firing' ? ' latching…' : ' idle'}`}
            </text>
          </svg>
        </div>

        {/* Controls + voltage bars */}
        <div className="flex-1 space-y-5">
          {/* Phase stepper */}
          <div className="flex gap-1">
            {phaseSteps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                <div className={`text-xs px-2 py-0.5 rounded font-mono ${
                  i === phaseIdx
                    ? 'bg-dram-blue text-white'
                    : i < phaseIdx
                    ? 'bg-dram-green/20 text-dram-green'
                    : 'bg-dram-bg text-dram-muted'
                }`}>
                  {s.label}
                </div>
                {i < phaseSteps.length - 1 && <span className="text-dram-muted text-xs">→</span>}
              </div>
            ))}
          </div>

          {/* Voltage bars */}
          <div className="flex gap-4 h-36">
            {[{ label: 'BL', pct: pctBL, v: blV }, { label: 'BLB', pct: pctBLB, v: blbV }].map(({ label, pct, v }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-dram-muted font-mono">{v.toFixed(3)}V</span>
                <div className="flex-1 w-full bg-dram-bg rounded-lg border border-dram-border relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-100"
                    style={{
                      height: `${pct}%`,
                      backgroundColor: pct > 80 ? '#22c55e' : pct < 20 ? '#ef4444' : '#f59e0b',
                    }}
                  />
                  <div className="absolute inset-x-0 top-1/2 border-t border-dram-muted/20 border-dashed" />
                </div>
                <span className="text-xs font-bold text-dram-text">{label}</span>
              </div>
            ))}

            {/* ΔV display */}
            <div className="flex flex-col items-center justify-center gap-2 px-2">
              <div className="text-xs text-dram-muted">ΔV</div>
              <div className={`text-lg font-bold font-mono ${reliable ? 'text-dram-green' : 'text-dram-amber'}`}>
                {(deltaV * 1000).toFixed(0)}<span className="text-xs">mV</span>
              </div>
              <div className={`text-xs text-center ${reliable ? 'text-dram-green' : 'text-amber-400'}`}>
                {reliable
                  ? (isZh ? '✓ 可靠' : '✓ reliable')
                  : (isZh ? '⚠ 临界' : '⚠ marginal')}
              </div>
            </div>
          </div>

          {/* Cs/Cbl slider */}
          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              Cs / (Cs + Cbl) = <span className="text-dram-amber font-mono">{csRatio.toFixed(2)}</span>
            </label>
            <input
              type="range" min="0.03" max="0.25" step="0.01"
              value={csRatio}
              onChange={(e) => { setCsRatio(Number(e.target.value)); reset() }}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-dram-muted mt-0.5">
              <span>{isZh ? '0.03（极小 Cs）' : '0.03 (tiny Cs)'}</span>
              <span>{isZh ? '0.10（典型值）' : '0.10 (typical)'}</span>
              <span>{isZh ? '0.25（大 Cs）' : '0.25 (large Cs)'}</span>
            </div>
            <p className="text-xs text-dram-muted mt-1 font-mono">
              ΔV = Cs/(Cs+Cbl) × Vdd/2 = {(csRatio).toFixed(2)} × {VDD/2} = {(deltaV*1000).toFixed(0)} mV
            </p>
          </div>

          {/* Stored bit toggle */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-dram-muted">{isZh ? '存储位：' : 'Stored bit:'}</span>
            {[1, 0].map((b) => (
              <button key={b} onClick={() => { setStoredBit(b); reset() }}
                className={`px-3 py-1 rounded font-mono text-sm border transition-colors ${
                  storedBit === b
                    ? 'bg-dram-blue/20 border-dram-blue text-dram-blue'
                    : 'border-dram-border text-dram-muted hover:border-dram-muted'
                }`}>
                {b}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={connectCell}
              disabled={phase !== 'precharge'}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:bg-amber-900/20 enabled:border-amber-700/40 enabled:text-amber-300 enabled:hover:bg-amber-800/30"
            >
              {isZh ? '连接存储单元' : 'Connect Cell'}
            </button>
            <button
              onClick={fireSA}
              disabled={phase !== 'sharing'}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:bg-blue-900/20 enabled:border-blue-700/40 enabled:text-blue-300 enabled:hover:bg-blue-800/30"
            >
              {isZh ? '触发放大器' : 'Fire SA'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-dram-border text-dram-muted hover:text-dram-text hover:border-dram-muted transition-colors"
            >
              {isZh ? '预充电' : 'Precharge'}
            </button>
          </div>

          {phase === 'done' && (
            <div className="rounded-lg p-3 bg-green-900/20 border border-green-700/40 text-sm text-green-300">
              {isZh ? (
                <>
                  <strong>判决完成：</strong>BL → {storedBit === 1 ? 'Vdd (1.2V)' : 'GND (0V)'}，BLB → {storedBit === 0 ? 'Vdd' : 'GND'}。
                  {' '}存储电容已恢复至完整 {storedBit === 1 ? 'Vdd' : 'GND'} 电平。
                </>
              ) : (
                <>
                  <strong>Resolved:</strong> BL → {storedBit === 1 ? 'Vdd (1.2V)' : 'GND (0V)'}, BLB → {storedBit === 0 ? 'Vdd' : 'GND'}.
                  {' '}Cell capacitor restored to full {storedBit === 1 ? 'Vdd' : 'GND'}.
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
