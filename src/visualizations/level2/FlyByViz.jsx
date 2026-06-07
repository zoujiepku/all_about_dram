import { useState, useEffect, useRef } from 'react'

const SLOTS = 4       // DIMM slots
const SLOT_GAP = 60   // px between slots on bus
const PROP_DELAY = 0.6  // ns per slot gap (signal propagation)
const STUB_Z = 40    // stub impedance in ohms

export default function FlyByViz() {
  const [stubLen, setStubLen] = useState(0.5)  // inches
  const [topology, setTopology] = useState('flyby')  // flyby | t-topology
  const [animating, setAnimating] = useState(false)
  const [signalPos, setSignalPos] = useState(-1)  // position 0-100%
  const [reflections, setReflections] = useState([])
  const intervalRef = useRef(null)

  const stubDelay = stubLen * 0.17  // ~170 ps/inch in FR4

  const startAnim = () => {
    if (animating) return
    setAnimating(true)
    setSignalPos(0)
    setReflections([])
    let t = 0
    intervalRef.current = setInterval(() => {
      t += 2
      setSignalPos(t)
      if (t >= 100) {
        clearInterval(intervalRef.current)
        setAnimating(false)
        setSignalPos(-1)
        // Add reflection markers for stubs > 0.5 inch
        if (stubLen > 0.5) {
          setReflections(Array.from({ length: SLOTS }, (_, i) => i))
        }
      }
    }, 30)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const svgW = 480
  const svgH = 180
  const busY = 60
  const controllerX = 30
  const slotXs = Array.from({ length: SLOTS }, (_, i) =>
    topology === 'flyby'
      ? controllerX + 80 + i * SLOT_GAP
      : controllerX + 80 + (svgW - controllerX - 80) / 2 + (i - 1.5) * 25
  )

  // Signal position on bus (0-100 maps to controllerX → last slotX)
  const busLen = slotXs[SLOTS - 1] - (controllerX + 40)
  const sigX = signalPos >= 0 ? (controllerX + 40) + (signalPos / 100) * busLen : -100

  const slotDelays = slotXs.map((_, i) => (i * PROP_DELAY).toFixed(1))

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DDR Signal Topology — Fly-by vs. T-topology
      </h3>

      <div className="flex flex-col gap-5">
        {/* Controls */}
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Topology</div>
            <div className="flex gap-2">
              {[['flyby', 'Fly-by (DDR4/5)'], ['t-topology', 'T-topology (DDR2/3)']].map(([v, lbl]) => (
                <button key={v} onClick={() => { setTopology(v); setReflections([]) }}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    topology === v ? 'bg-dram-blue/20 border-dram-blue text-dram-blue' : 'border-dram-border text-dram-muted'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-dram-muted uppercase block mb-2">
              Stub length: <span className="text-dram-amber font-mono normal-case">{stubLen}" ({(stubLen * 170).toFixed(0)} ps)</span>
            </label>
            <input type="range" min="0.1" max="2.0" step="0.1"
              value={stubLen} onChange={(e) => { setStubLen(Number(e.target.value)); setReflections([]) }}
              className="w-full accent-amber-400" />
            <div className="flex justify-between text-xs text-dram-muted mt-0.5">
              <span>0.1" (OK)</span>
              <span className="text-amber-400">0.5" (marginal)</span>
              <span className="text-red-400">2.0" (bad)</span>
            </div>
          </div>
        </div>

        {/* SVG diagram */}
        <div className="overflow-x-auto">
          <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ minWidth: 360 }}>
            {/* Controller box */}
            <rect x={controllerX} y={busY - 18} width="40" height="36" rx="3"
              fill="#1e40af20" stroke="#3b82f6" strokeWidth="1.5" />
            <text x={controllerX + 20} y={busY - 6} textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">MC</text>
            <text x={controllerX + 20} y={busY + 6} textAnchor="middle" fill="#64748b" fontSize="7">DDR</text>
            <text x={controllerX + 20} y={busY + 16} textAnchor="middle" fill="#64748b" fontSize="7">Ctrl</text>

            {topology === 'flyby' ? (
              <>
                {/* Fly-by main bus */}
                <line x1={controllerX + 40} y1={busY} x2={slotXs[SLOTS - 1] + 15} y2={busY}
                  stroke="#3b82f6" strokeWidth="2" />

                {/* Signal wave on bus */}
                {signalPos >= 0 && (
                  <rect x={sigX - 8} y={busY - 6} width="16" height="12" rx="2"
                    fill="#22c55e80" stroke="#22c55e" strokeWidth="1" />
                )}

                {/* DIMM slots with stubs */}
                {slotXs.map((x, i) => (
                  <g key={i}>
                    {/* Stub */}
                    <line x1={x} y1={busY} x2={x} y2={busY + 35}
                      stroke={stubLen > 0.5 ? '#f59e0b' : '#94a3b8'} strokeWidth="1.5" />
                    {/* DIMM slot */}
                    <rect x={x - 12} y={busY + 35} width="24" height="50" rx="2"
                      fill="#16213e" stroke={reflections.includes(i) ? '#ef4444' : '#334155'} strokeWidth="1.5" />
                    <text x={x} y={busY + 68} textAnchor="middle" fill="#94a3b8" fontSize="9">DIMM</text>
                    <text x={x} y={busY + 80} textAnchor="middle" fill="#64748b" fontSize="8">{i + 1}</text>
                    {/* Delay label */}
                    <text x={x} y={busY - 12} textAnchor="middle" fill="#475569" fontSize="8">
                      +{slotDelays[i]} ns
                    </text>
                    {/* Reflection indicator */}
                    {reflections.includes(i) && (
                      <text x={x + 15} y={busY + 20} fill="#ef4444" fontSize="10">↩</text>
                    )}
                  </g>
                ))}

                {/* Termination resistor at end */}
                <rect x={slotXs[SLOTS - 1] + 16} y={busY - 8} width="14" height="16" rx="2"
                  fill="#f59e0b20" stroke="#f59e0b" strokeWidth="1" />
                <text x={slotXs[SLOTS - 1] + 23} y={busY + 3} textAnchor="middle" fill="#f59e0b" fontSize="7">Rtt</text>
              </>
            ) : (
              <>
                {/* T-topology: main line splits to two T-branches */}
                <line x1={controllerX + 40} y1={busY} x2={svgW / 2} y2={busY}
                  stroke="#3b82f6" strokeWidth="2" />
                {/* Branch left */}
                <line x1={svgW / 2} y1={busY} x2={100} y2={busY}
                  stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
                <line x1={100} y1={busY} x2={60} y2={busY}
                  stroke="#f59e0b" strokeWidth="1" />
                {/* Branch right */}
                <line x1={svgW / 2} y1={busY} x2={400} y2={busY}
                  stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
                {/* T-junction marker */}
                <circle cx={svgW / 2} cy={busY} r="5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
                <text x={svgW / 2} y={busY - 12} textAnchor="middle" fill="#f59e0b" fontSize="9">T-split</text>
                <text x={svgW / 2} y={busY - 4} textAnchor="middle" fill="#ef4444" fontSize="8">↳ reflections</text>
                {/* Simplified DIMM boxes */}
                {[80, 160, 350, 400].map((x, i) => (
                  <g key={i}>
                    <rect x={x - 12} y={busY + 20} width="24" height="40" rx="2"
                      fill="#16213e" stroke="#ef444480" strokeWidth="1.5" />
                    <text x={x} y={busY + 45} textAnchor="middle" fill="#94a3b8" fontSize="8">D{i + 1}</text>
                    <line x1={x} y1={busY} x2={x} y2={busY + 20} stroke="#94a3b8" strokeWidth="1" />
                  </g>
                ))}
                <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fill="#ef4444" fontSize="9">
                  T-junction creates signal reflections limiting bandwidth to ~533 MT/s
                </text>
              </>
            )}

            {topology === 'flyby' && (
              <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fill="#22c55e" fontSize="9">
                {stubLen <= 0.5
                  ? `Short stubs (${stubLen}") — minimal reflection, supports DDR4/5 at 3200+ MT/s`
                  : `Long stubs (${stubLen}") — reflections (shown red) degrade signal integrity`}
              </text>
            )}
          </svg>
        </div>

        {/* Animate button */}
        <div className="flex gap-3 items-center">
          {topology === 'flyby' && (
            <button onClick={startAnim} disabled={animating}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-dram-blue/10 border border-dram-blue/40
                text-dram-blue hover:bg-dram-blue/20 disabled:opacity-40 transition-colors">
              {animating ? 'Propagating…' : '▶ Animate signal'}
            </button>
          )}
          <div className="text-xs text-dram-muted">
            Signal reaches slot 4 with <span className="font-mono text-dram-blue">{(3 * PROP_DELAY).toFixed(1)} ns</span> delay vs. slot 1 — write leveling corrects this per-rank
          </div>
        </div>

        {/* Trade-off table */}
        <div className="rounded-lg overflow-hidden border border-dram-border text-xs">
          <div className="grid grid-cols-3 bg-dram-bg">
            {['', 'Fly-by (DDR4/5)', 'T-topology (DDR2/3)'].map((h) => (
              <div key={h} className="px-3 py-2 font-semibold text-dram-muted">{h}</div>
            ))}
          </div>
          {[
            ['Max speed', '3200–8400 MT/s', '~533 MT/s'],
            ['Signal integrity', 'Good (short stubs)', 'Reflections at T-junction'],
            ['Write leveling needed', 'Yes (per-rank delay)', 'No'],
            ['Routing complexity', 'Simpler daisy-chain', 'Complex matched-length'],
          ].map(([row, flyby, t]) => (
            <div key={row} className="grid grid-cols-3 border-t border-dram-border">
              <div className="px-3 py-2 text-dram-muted">{row}</div>
              <div className="px-3 py-2 text-dram-green">{flyby}</div>
              <div className="px-3 py-2 text-amber-400">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
