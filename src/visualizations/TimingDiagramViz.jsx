import { useState } from 'react'

const PHASES = [
  {
    id: 0,
    label: 'tRP — Row Precharge',
    symbol: 'tRP',
    color: '#3b82f6',
    desc: 'Time to precharge bit lines back to Vdd/2 after the previous row is closed. Typically 10–15 ns on DDR4.',
    signals: {
      CLK: [0,1,0,1],
      CS: [0,0,0,0],
      RAS: [0,0,0,0],
      CAS: [1,1,1,1],
      WE: [0,0,0,0],
      Command: ['PRE','—','—','—'],
      'Bit Lines': ['prg','prg','done','done'],
    },
  },
  {
    id: 1,
    label: 'tRCD — RAS to CAS Delay',
    symbol: 'tRCD',
    color: '#f59e0b',
    desc: 'Time from row activation (RAS) until the sense amps have fully amplified the signal and the column can be selected. Typically 10–15 ns.',
    signals: {
      CLK: [0,1,0,1],
      CS: [0,0,0,0],
      RAS: [0,0,1,1],
      CAS: [1,1,1,1],
      WE: [1,1,1,1],
      Command: ['ACT','—','—','—'],
      'Bit Lines': ['Vdd/2','ΔV','amp','valid'],
    },
  },
  {
    id: 2,
    label: 'tCL — CAS Latency',
    symbol: 'CL',
    color: '#a855f7',
    desc: 'Number of clock cycles between issuing a CAS READ command and the first data appearing on the DQ bus. Typically CL=16–40 on DDR4/5.',
    signals: {
      CLK: [0,1,0,1,0,1],
      CS: [0,0,0,0,0,0],
      RAS: [1,1,1,1,1,1],
      CAS: [0,1,1,1,1,1],
      WE: [1,1,1,1,1,1],
      Command: ['RD','—','—','—','—','—'],
      DQ: ['Z','Z','Z','Z','D0','D1'],
    },
  },
  {
    id: 3,
    label: 'tRAS — Row Active Strobe',
    symbol: 'tRAS',
    color: '#22c55e',
    desc: 'Minimum time a row must remain active before PRE can be issued. For a read, tRAS(min) ≥ tRCD + CL. The full row cycle time is tRC = tRAS + tRP (not tRAS itself).',
    signals: {
      CLK: [0,1,0,1,0,1,0,1],
      Command: ['ACT','—','RD','—','—','PRE','—','—'],
      Row: ['open','open','open','open','open','close','—','—'],
    },
  },
]

export default function TimingDiagramViz() {
  const [phase, setPhase] = useState(0)
  const p = PHASES[phase]

  const signalEntries = Object.entries(p.signals || {})
  const clkLen = (p.signals?.CLK || p.signals?.Command || []).length

  const renderSignal = (name, values) => {
    const W = 50
    const H = 24
    const totalW = values.length * W

    const isTextSig = typeof values[0] === 'string' && values[0].length > 1

    return (
      <div key={name} className="flex items-center gap-2 mb-1">
        <div className="w-16 text-right text-xs font-mono text-dram-muted flex-shrink-0">{name}</div>
        <svg width={totalW} height={H} className="overflow-visible">
          {values.map((v, i) => {
            if (isTextSig) {
              return (
                <g key={i}>
                  <rect x={i * W} y={2} width={W - 2} height={H - 4} rx="2"
                    fill={v === '—' || v === 'Z' ? '#1e293b' : p.color + '22'}
                    stroke={v === '—' || v === 'Z' ? '#334155' : p.color + '88'}
                    strokeWidth="1"
                  />
                  <text x={i * W + W / 2} y={H / 2 + 4} textAnchor="middle"
                    fill={v === '—' || v === 'Z' ? '#475569' : p.color}
                    fontSize="9" fontFamily="monospace"
                  >
                    {v}
                  </text>
                </g>
              )
            }
            // binary signal
            const high = v === 1
            const prevHigh = i > 0 ? values[i - 1] === 1 : high
            const y = high ? 2 : H - 6
            const prevY = prevHigh ? 2 : H - 6
            return (
              <g key={i}>
                {i > 0 && prevY !== y && (
                  <line x1={i * W} y1={prevY} x2={i * W} y2={y}
                    stroke={p.color} strokeWidth="1.5" />
                )}
                <line x1={i * W} y1={y} x2={(i + 1) * W - 2} y2={y}
                  stroke={p.color} strokeWidth="1.5" />
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DRAM Timing Parameters — step through each phase
      </h3>

      {/* Phase selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PHASES.map((ph) => (
          <button
            key={ph.id}
            onClick={() => setPhase(ph.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold border transition-all`}
            style={{
              backgroundColor: phase === ph.id ? ph.color + '22' : 'transparent',
              borderColor: phase === ph.id ? ph.color : '#334155',
              color: phase === ph.id ? ph.color : '#64748b',
            }}
          >
            {ph.symbol}
          </button>
        ))}
      </div>

      {/* Description */}
      <div
        className="rounded-lg p-4 mb-5 border text-sm"
        style={{ borderColor: p.color + '44', backgroundColor: p.color + '10', color: '#cbd5e1' }}
      >
        <strong style={{ color: p.color }}>{p.label}</strong>
        <p className="mt-1 text-dram-muted">{p.desc}</p>
      </div>

      {/* Waveform */}
      <div className="bg-dram-bg rounded-lg p-4 overflow-x-auto">
        <div className="min-w-fit">
          {signalEntries.map(([name, vals]) => renderSignal(name, vals))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPhase((p) => Math.max(0, p - 1))}
          disabled={phase === 0}
          className="px-4 py-1.5 rounded-lg text-sm text-dram-muted border border-dram-border
                     hover:text-dram-text hover:border-dram-muted disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-xs text-dram-muted self-center">{phase + 1} / {PHASES.length}</span>
        <button
          onClick={() => setPhase((p) => Math.min(PHASES.length - 1, p + 1))}
          disabled={phase === PHASES.length - 1}
          className="px-4 py-1.5 rounded-lg text-sm text-dram-muted border border-dram-border
                     hover:text-dram-text hover:border-dram-muted disabled:opacity-30 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
