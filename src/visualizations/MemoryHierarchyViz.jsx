import { useState } from 'react'

const levels = [
  {
    label: 'Registers',
    latency: '< 1 ns',
    capacity: '< 1 KB',
    bandwidth: '~10 TB/s',
    color: '#a855f7',
    width: 80,
    description: 'Inside the CPU core. Tiny, ultra-fast. Holds operands currently being processed.',
  },
  {
    label: 'L1 Cache',
    latency: '~1 ns',
    capacity: '32–64 KB',
    bandwidth: '~4 TB/s',
    color: '#3b82f6',
    width: 130,
    description: 'On-die SRAM cache per core. Near-zero latency. Holds the working set for a tight loop.',
  },
  {
    label: 'L2 Cache',
    latency: '~5 ns',
    capacity: '256 KB–2 MB',
    bandwidth: '~1 TB/s',
    color: '#06b6d4',
    width: 180,
    description: 'Larger unified cache per core or shared. Fills L1 misses without going off-die.',
  },
  {
    label: 'L3 Cache',
    latency: '~20–40 ns',
    capacity: '8–64 MB',
    bandwidth: '~200 GB/s',
    color: '#22c55e',
    width: 230,
    description: 'Last-level on-die cache shared across all cores. A miss here goes to main memory.',
  },
  {
    label: 'DRAM (Main Memory)',
    latency: '~60–100 ns',
    capacity: '4–256 GB',
    bandwidth: '~50–100 GB/s',
    color: '#f59e0b',
    width: 280,
    description: 'Dynamic RAM — our focus. Cheap, dense. ~100× slower than L1 but 1000× larger.',
    highlight: true,
  },
  {
    label: 'NVMe SSD',
    latency: '~100 µs',
    capacity: '0.5–8 TB',
    bandwidth: '~7 GB/s',
    color: '#ef4444',
    width: 330,
    description: 'Non-volatile flash storage. 1000× slower than DRAM per access but persistent.',
  },
  {
    label: 'HDD / Tape',
    latency: '~5–10 ms',
    capacity: '1–100 TB',
    bandwidth: '~200 MB/s',
    color: '#64748b',
    width: 380,
    description: 'Magnetic storage. Slowest, cheapest per bit. Dominates bulk archival storage.',
  },
]

export default function MemoryHierarchyViz() {
  const [active, setActive] = useState(4)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-6">
        Memory Hierarchy — click a level to explore
      </h3>

      <div className="flex gap-8 flex-col md:flex-row">
        {/* Pyramid — scale bars relative to container width on mobile */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 w-full md:w-auto overflow-x-auto pb-1">
          {levels.map((lvl, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`
                h-9 rounded flex items-center justify-center text-xs font-semibold
                border-2 transition-all duration-200 cursor-pointer truncate px-2
                ${lvl.highlight ? 'ring-2 ring-offset-2 ring-offset-dram-surface' : ''}
              `}
              style={{
                width: `min(${lvl.width}px, ${Math.round((lvl.width / 380) * 100)}%)`,
                minWidth: Math.round(lvl.width * 0.45),
                backgroundColor: active === i ? lvl.color : `${lvl.color}18`,
                borderColor: lvl.color,
                color: active === i ? '#0f172a' : lvl.color,
                ...(lvl.highlight && active !== i ? { boxShadow: `0 0 0 2px ${lvl.color}44` } : {}),
              }}
            >
              {lvl.label}
            </button>
          ))}
          <div className="mt-2 flex justify-between w-full px-2 text-xs text-dram-muted">
            <span>← Faster / Smaller</span>
            <span>Slower / Larger →</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-lg p-5 border"
            style={{
              borderColor: levels[active].color + '44',
              backgroundColor: levels[active].color + '10',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: levels[active].color }}
              />
              <span className="font-bold text-dram-text text-lg">{levels[active].label}</span>
            </div>
            <p className="text-dram-muted text-sm mb-4">{levels[active].description}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Latency', value: levels[active].latency },
                { label: 'Capacity', value: levels[active].capacity },
                { label: 'Bandwidth', value: levels[active].bandwidth },
              ].map((stat) => (
                <div key={stat.label} className="bg-dram-bg rounded-lg p-3">
                  <div className="text-xs text-dram-muted mb-1">{stat.label}</div>
                  <div
                    className="text-sm font-bold font-mono"
                    style={{ color: levels[active].color }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
