import { useState } from 'react'

export default function MOSFETViz() {
  const [on, setOn] = useState(false)
  const [vg, setVg] = useState(0)

  const handleVg = (val) => {
    const v = Number(val)
    setVg(v)
    setOn(v >= 1)
  }

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        MOSFET Transistor — interactive gate control
      </h3>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* SVG diagram */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox="0 0 260 220" style={{ maxWidth: 260 }}>
            {/* Substrate */}
            <rect x="30" y="80" width="200" height="100" rx="4" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" />
            <text x="130" y="175" textAnchor="middle" fill="#64748b" fontSize="11">P-type Substrate</text>

            {/* Source region */}
            <rect x="40" y="70" width="55" height="30" rx="3" fill="#16a34a" />
            <text x="67" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Source</text>
            <text x="67" y="102" textAnchor="middle" fill="#86efac" fontSize="10">N+</text>

            {/* Drain region */}
            <rect x="165" y="70" width="55" height="30" rx="3" fill="#dc2626" />
            <text x="192" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Drain</text>
            <text x="192" y="102" textAnchor="middle" fill="#fca5a5" fontSize="10">N+</text>

            {/* Gate oxide */}
            <rect x="98" y="72" width="64" height="10" rx="1" fill="#fde68a" opacity="0.9" />
            <text x="130" y="81" textAnchor="middle" fill="#78350f" fontSize="9">Gate Oxide</text>

            {/* Gate electrode */}
            <rect x="98" y="30" width="64" height="42" rx="3"
              fill={on ? '#f59e0b' : '#334155'}
              stroke={on ? '#f59e0b' : '#475569'}
              strokeWidth="1.5"
            />
            <text x="130" y="49" textAnchor="middle" fill={on ? '#0f172a' : '#94a3b8'} fontSize="11" fontWeight="bold">Gate</text>
            <text x="130" y="63" textAnchor="middle" fill={on ? '#78350f' : '#64748b'} fontSize="10">
              Vg = {vg}V
            </text>

            {/* Channel */}
            <rect x="95" y="82" width="70" height="18" rx="2"
              fill={on ? '#22c55e' : '#1e293b'}
              opacity={on ? 0.9 : 0.5}
              className="dram-transition"
            />
            {on && (
              <text x="130" y="94" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                Channel ON
              </text>
            )}

            {/* Current flow arrow when ON */}
            {on && (
              <g className="signal-flow">
                <line x1="95" y1="91" x2="165" y2="91" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="6 4" />
                <polygon points="165,87 175,91 165,95" fill="#22c55e" />
              </g>
            )}

            {/* Voltage labels */}
            <text x="15" y="88" fill="#86efac" fontSize="10">0V</text>
            <text x="218" y="88" fill="#fca5a5" fontSize="10">+3V</text>

            {/* State indicator */}
            <rect x="10" y="193" width="240" height="22" rx="4"
              fill={on ? '#166534' : '#7f1d1d'}
            />
            <text x="130" y="209" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
              {on ? 'TRANSISTOR ON ✓' : 'TRANSISTOR OFF ✗'}
            </text>
          </svg>
        </div>

        {/* Controls + explanation */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-dram-text block mb-2">
              Gate Voltage (Vg): <span className="text-dram-amber font-mono">{vg}V</span>
            </label>
            <input
              type="range" min="0" max="3" step="0.5"
              value={vg}
              onChange={(e) => handleVg(e.target.value)}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-dram-muted mt-1">
              <span>0V (OFF)</span>
              <span>1V (threshold)</span>
              <span>3V (ON)</span>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-sm border transition-all duration-300 ${
            on
              ? 'bg-green-900/20 border-green-700/40 text-green-300'
              : 'bg-slate-800/60 border-slate-600/40 text-dram-muted'
          }`}>
            {on ? (
              <>
                <strong className="text-green-400">ON state:</strong> A positive gate voltage attracts
                electrons into the channel region beneath the gate oxide. This creates a conductive
                path — current flows from source to drain.
              </>
            ) : (
              <>
                <strong className="text-dram-text">OFF state:</strong> Without sufficient gate voltage,
                no electron channel forms. The source and drain are isolated — no current flows.
                The transistor acts as an open switch.
              </>
            )}
          </div>

          <div className="rounded-lg p-4 bg-dram-bg text-xs text-dram-muted font-mono space-y-1">
            <div>Vg &lt; Vth → channel OFF → bit line isolated</div>
            <div>Vg ≥ Vth → channel ON → cell capacitor connected</div>
            <div className="text-dram-blue">In DRAM: wordline = gate control signal</div>
          </div>
        </div>
      </div>
    </div>
  )
}
