import { useState } from 'react'

const tRTRS = 7.5   // ns rank-to-rank switching
const tCL = 16      // ns CAS latency
const tRCD = 16     // ns
const tRP = 16      // ns
const BUS_WIDTH = 72  // bits (64 data + 8 ECC)
const BURST = 8

const ops = [
  { rank: 0, label: 'R0 Activate', color: '#3b82f6', type: 'act', start: 0, dur: 3 },
  { rank: 0, label: 'R0 Read', color: '#3b82f6', type: 'cas', start: 3, dur: 2 },
  { rank: 1, label: 'R1 Activate', color: '#22c55e', type: 'act', start: 6, dur: 3 },
  { rank: 1, label: 'R1 Read', color: '#22c55e', type: 'cas', start: 10, dur: 2 },
  { rank: 0, label: 'R0 Data', color: '#3b82f6', type: 'data', start: 5, dur: 4 },
  { rank: 1, label: 'R1 Data', color: '#22c55e', type: 'data', start: 13, dur: 4 },
]

const TICK = 28  // px per clock cycle
const LANES = [
  { key: 'bus', label: 'DQ Bus', y: 0 },
  { key: 'rank0', label: 'Rank 0', y: 1 },
  { key: 'rank1', label: 'Rank 1', y: 2 },
]

export default function RankDiagram({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [numRanks, setNumRanks] = useState(2)
  const [showTRTRS, setShowTRTRS] = useState(true)
  const totalCycles = 20
  const laneH = 36
  const labW = 60
  const svgW = labW + totalCycles * TICK + 20
  const svgH = LANES.length * (laneH + 6) + 40

  // Bus utilization
  const dataBusWindows = [
    { start: 5, dur: 4, rank: 0, color: '#3b82f6' },
    { start: 13, dur: 4, rank: 1, color: '#22c55e' },
  ]
  // tRTRS gap between R0 data ending and R1 data starting
  const gapStart = 9
  const gapEnd = 13

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? '多 Rank 时序 — tRTRS 总线切换' : 'Multi-Rank Timing — tRTRS Bus Turnaround'}
      </h3>

      <div className="flex flex-col gap-6">
        {/* Timing diagram */}
        <div className="overflow-x-auto">
          <svg width="100%" height={svgH + 10} viewBox={`0 0 ${svgW} ${svgH + 10}`}
            style={{ minWidth: svgW * 0.6 }}>
            {/* Grid */}
            {Array.from({ length: totalCycles + 1 }, (_, i) => (
              <line key={i} x1={labW + i * TICK} y1={0} x2={labW + i * TICK} y2={svgH - 30}
                stroke="#1e293b" strokeWidth={i % 4 === 0 ? 1 : 0.5} />
            ))}
            {/* Cycle numbers */}
            {Array.from({ length: totalCycles + 1 }, (_, i) => (
              i % 2 === 0 && (
                <text key={i} x={labW + i * TICK} y={svgH - 18}
                  textAnchor="middle" fill="#475569" fontSize="9">t{i}</text>
              )
            ))}
            <text x={labW + totalCycles * TICK / 2} y={svgH - 6}
              textAnchor="middle" fill="#475569" fontSize="9">{isZh ? '时钟周期' : 'Clock cycles'}</text>

            {/* Lane labels */}
            {LANES.map((lane, li) => (
              <text key={lane.key} x={labW - 4} y={li * (laneH + 6) + laneH / 2 + 5}
                textAnchor="end" dominantBaseline="middle" fill="#94a3b8" fontSize="10">
                {lane.label}
              </text>
            ))}

            {/* DQ Bus lane */}
            {dataBusWindows.map((w) => (
              <rect key={w.rank}
                x={labW + w.start * TICK} y={2}
                width={w.dur * TICK} height={laneH}
                rx="3" fill={w.color + '30'} stroke={w.color} strokeWidth="1.5" />
            ))}
            {dataBusWindows.map((w) => (
              <text key={w.rank}
                x={labW + (w.start + w.dur / 2) * TICK}
                y={laneH / 2 + 5}
                textAnchor="middle" dominantBaseline="middle"
                fill={w.color} fontSize="9" fontWeight="bold">
                R{w.rank} Data
              </text>
            ))}

            {/* tRTRS gap indicator */}
            {showTRTRS && (
              <g>
                <rect x={labW + gapStart * TICK} y={2}
                  width={(gapEnd - gapStart) * TICK} height={laneH}
                  fill="#ef444430" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
                <text x={labW + (gapStart + (gapEnd - gapStart) / 2) * TICK} y={laneH / 2 + 5}
                  textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontSize="8">
                  tRTRS
                </text>
              </g>
            )}

            {/* Rank 0 lane */}
            {[
              { label: 'ACT', start: 0, dur: 3, color: '#3b82f6' },
              { label: 'CAS', start: 3, dur: 2, color: '#60a5fa' },
              { label: 'PRE', start: 8, dur: 2, color: '#3b82f660' },
            ].map((cmd) => (
              <g key={cmd.label}>
                <rect x={labW + cmd.start * TICK} y={laneH + 8}
                  width={cmd.dur * TICK} height={laneH}
                  rx="2" fill={cmd.color + '20'} stroke={cmd.color} strokeWidth="1" />
                <text x={labW + (cmd.start + cmd.dur / 2) * TICK}
                  y={laneH + 8 + laneH / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={cmd.color} fontSize="9">
                  {cmd.label}
                </text>
              </g>
            ))}

            {/* Rank 1 lane */}
            {[
              { label: 'ACT', start: 6, dur: 3, color: '#22c55e' },
              { label: 'CAS', start: 10, dur: 2, color: '#4ade80' },
              { label: 'PRE', start: 15, dur: 2, color: '#22c55e60' },
            ].map((cmd) => (
              <g key={cmd.label}>
                <rect x={labW + cmd.start * TICK} y={(laneH + 6) * 2 + 2}
                  width={cmd.dur * TICK} height={laneH}
                  rx="2" fill={cmd.color + '20'} stroke={cmd.color} strokeWidth="1" />
                <text x={labW + (cmd.start + cmd.dur / 2) * TICK}
                  y={(laneH + 6) * 2 + 2 + laneH / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={cmd.color} fontSize="9">
                  {cmd.label}
                </text>
              </g>
            ))}

            {/* tRTRS annotation arrow */}
            {showTRTRS && (
              <g>
                <line x1={labW + gapStart * TICK} y1={svgH - 35}
                  x2={labW + gapEnd * TICK} y2={svgH - 35}
                  stroke="#ef4444" strokeWidth="1"
                  markerEnd="url(#arr)" />
                <text x={labW + (gapStart + (gapEnd - gapStart) / 2) * TICK} y={svgH - 40}
                  textAnchor="middle" fill="#ef4444" fontSize="9">
                  tRTRS = {tRTRS} ns
                </text>
              </g>
            )}
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(isZh ? [
            ['总线位宽', `${BUS_WIDTH} 位`, '#3b82f6'],
            ['tRTRS', `${tRTRS} ns`, '#ef4444'],
            ['tCL / tRCD / tRP', `各 ${tCL} ns`, '#f59e0b'],
            ['Rank 数量', '2（独立）', '#22c55e'],
          ] : [
            ['Bus width', `${BUS_WIDTH}-bit`, '#3b82f6'],
            ['tRTRS', `${tRTRS} ns`, '#ef4444'],
            ['tCL / tRCD / tRP', `${tCL} ns each`, '#f59e0b'],
            ['Ranks shown', '2 (independent)', '#22c55e'],
          ]).map(([k, v, c]) => (
            <div key={k} className="bg-dram-bg rounded-lg p-3">
              <div className="text-xs text-dram-muted">{k}</div>
              <div className="text-sm font-bold font-mono" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-dram-text">
          <input type="checkbox" checked={showTRTRS} onChange={(e) => setShowTRTRS(e.target.checked)}
            className="accent-red-500" />
          {isZh ? '显示 tRTRS 间隙' : 'Show tRTRS gap'}
        </label>

        <div className="rounded-lg p-4 bg-dram-bg text-xs text-dram-muted space-y-1">
          <div className="font-semibold text-dram-text">{isZh ? 'tRTRS 存在的原因' : 'Why tRTRS exists'}</div>
          <div>{isZh
            ? 'DQ 总线由所有 Rank 共享。切换驱动总线的 Rank 时，ODT 终端必须同步切换，前一个驱动器必须先置为高阻态，新驱动器才能驱动总线。tRTRS ≈ 1–2 个时钟周期，用于防止总线竞争和信号完整性违规。'
            : 'The DQ bus is shared across all ranks. When switching which rank drives the bus, ODT termination must switch and the previous driver must tri-state before the new one asserts. tRTRS ≈ 1–2 clock cycles protects against bus contention and signal integrity violations.'
          }</div>
        </div>
      </div>
    </div>
  )
}
