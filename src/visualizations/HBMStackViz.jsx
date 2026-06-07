import { useState } from 'react'

const layers = [
  { id: 0, label: 'Logic Base Die', sublabel: 'Memory controller + PHY', color: '#3b82f6', y: 0 },
  { id: 1, label: 'DRAM Die 1', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 1 },
  { id: 2, label: 'DRAM Die 2', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 2 },
  { id: 3, label: 'DRAM Die 3', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 3 },
  { id: 4, label: 'DRAM Die 4', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 4 },
  { id: 5, label: 'DRAM Die 5', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 5 },
  { id: 6, label: 'DRAM Die 6', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 6 },
  { id: 7, label: 'DRAM Die 7', sublabel: '~24 Gb, 1024 TSVs', color: '#22c55e', y: 7 },
  { id: 8, label: 'DRAM Die 8 (top)', sublabel: '~24 Gb', color: '#84cc16', y: 8 },
]

const hbmVersions = [
  { name: 'HBM1', year: '2015', stacks: 'up to 4', bw: '128 GB/s', capacity: '1 GB', busWidth: '1024-bit', desc: 'First gen. Used in AMD Fury GPU. 4 DRAM dies per stack, 128 GB/s.' },
  { name: 'HBM2', year: '2016', stacks: 'up to 8', bw: '256 GB/s', capacity: '4–8 GB', busWidth: '1024-bit', desc: 'Up to 8 DRAM dies. Early products 4 GB; NVIDIA V100-era stacks reached 8 GB per stack.' },
  { name: 'HBM2E', year: '2019', stacks: 'up to 8', bw: '~307–460 GB/s', capacity: 'up to 16 GB', busWidth: '1024-bit', desc: 'Enhanced HBM2. SK Hynix peaked at 460 GB/s; Micron variants varied. Capacity up to 16 GB.' },
  { name: 'HBM3', year: '2022', stacks: 'up to 12', bw: '819 GB/s', capacity: '24 GB', busWidth: '1024-bit', desc: 'JEDEC JESD238. Max 12 DRAM dies per stack. NVIDIA H100 uses 8-die stacks at 24 GB.' },
]

export default function HBMStackViz() {
  const [activeLayer, setActiveLayer] = useState(null)
  const [activeVersion, setActiveVersion] = useState(2)

  const dieH = 28
  const dieW = 220
  const gap = 4
  const totalH = layers.length * (dieH + gap)
  const offsetX = 30

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        HBM Stack — exploded view
      </h3>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Stack SVG */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox={`0 0 ${dieW + offsetX + 60} ${totalH + 20}`} style={{ maxWidth: dieW + offsetX + 60 }}>
            {/* TSV lines */}
            {[60, 100, 140, 180].map((x) => (
              <line
                key={x}
                x1={offsetX + x} y1={0}
                x2={offsetX + x} y2={totalH}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.4"
              />
            ))}
            <text x={offsetX + 60} y={totalH + 12} textAnchor="middle" fill="#f59e0b" fontSize="8" opacity="0.7">TSVs</text>

            {layers.map((layer, i) => {
              const ly = i * (dieH + gap)
              const isActive = activeLayer === i
              return (
                <g
                  key={i}
                  onClick={() => setActiveLayer(isActive ? null : i)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={offsetX}
                    y={ly + (isActive ? -2 : 0)}
                    width={dieW}
                    height={dieH}
                    rx="3"
                    fill={isActive ? layer.color + '30' : layer.color + '12'}
                    stroke={layer.color}
                    strokeWidth={isActive ? 2 : 1}
                    className="dram-transition"
                  />
                  <text
                    x={offsetX + 10}
                    y={ly + dieH / 2 + 1}
                    fill={isActive ? layer.color : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isActive ? 'bold' : 'normal'}
                    dominantBaseline="middle"
                  >
                    {layer.label}
                  </text>
                  <text
                    x={offsetX + dieW - 5}
                    y={ly + dieH / 2 + 1}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {layer.sublabel}
                  </text>
                </g>
              )
            })}
          </svg>

          {activeLayer !== null && (
            <div
              className="rounded-lg p-3 text-sm border mt-2 transition-all"
              style={{
                borderColor: layers[activeLayer].color + '44',
                backgroundColor: layers[activeLayer].color + '10',
                color: '#cbd5e1',
              }}
            >
              <strong style={{ color: layers[activeLayer].color }}>
                {layers[activeLayer].label}
              </strong>
              <p className="text-xs text-dram-muted mt-1">
                {layers[activeLayer].id === 0
                  ? 'The base die contains the memory controller, PHY (physical layer interface), and power delivery circuits. It communicates upward through TSVs and outward to the CPU via a short interposer trace.'
                  : 'Standard DRAM die. Through-Silicon Vias (TSVs) — copper pillars ~5–10 µm in diameter, ~30–50 µm deep in thinned HBM dies — carry data vertically. Die-to-die microbumps are ~55 µm pitch for HBM1–3; hybrid bonding (sub-10 µm) is targeted for HBM4.'}
              </p>
            </div>
          )}
        </div>

        {/* Version comparison */}
        <div className="flex-1 space-y-2">
          <div className="text-xs font-semibold text-dram-muted uppercase mb-3">HBM Generations</div>
          {hbmVersions.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveVersion(i)}
              className={`w-full rounded-lg p-3 text-left border transition-all ${
                activeVersion === i
                  ? 'border-dram-blue bg-dram-blue/10'
                  : 'border-dram-border bg-dram-bg hover:border-dram-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-sm ${activeVersion === i ? 'text-dram-blue' : 'text-dram-text'}`}>
                  {v.name}
                </span>
                <span className="text-xs text-dram-muted font-mono">{v.year}</span>
              </div>
              {activeVersion === i && (
                <>
                  <p className="text-xs text-dram-muted mb-2">{v.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Bandwidth/stack', v.bw],
                      ['Capacity', v.capacity],
                      ['Bus width', v.busWidth],
                      ['Max dies', v.stacks],
                    ].map(([k, val]) => (
                      <div key={k} className="bg-dram-surface rounded p-2">
                        <div className="text-xs text-dram-muted">{k}</div>
                        <div className="text-xs font-bold font-mono text-dram-blue">{val}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
