import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import MemoryHierarchyViz from '../visualizations/MemoryHierarchyViz'

function HierarchyTable() {
  const levels = [
    { level: 'Registers', size: '1–4 KB', latency: '< 1 ns', tech: 'Flip-flops (SRAM)', bw: '> 1 TB/s', cost: '~$1000/GB', note: 'Directly addressed by CPU instructions — AX, RBX, etc.' },
    { level: 'L1 Cache', size: '32–64 KB/core', latency: '~1–4 ns (4–16 cycles)', tech: 'SRAM (6T cell)', bw: '~200 GB/s', cost: '~$200/MB', note: 'Instruction + data split; private per core; 4-way to 8-way associative' },
    { level: 'L2 Cache', size: '256 KB–2 MB/core', latency: '~4–12 ns (10–40 cycles)', tech: 'SRAM (6T cell)', bw: '~100 GB/s', cost: '~$100/MB', note: 'Unified; private per core on Intel; 4-way to 16-way associative' },
    { level: 'L3 Cache (LLC)', size: '8–64 MB (shared)', latency: '~20–50 ns (40–150 cycles)', tech: 'SRAM (6T cell, sometimes MRAM)', bw: '~50 GB/s', cost: '~$20/MB', note: 'Shared across all cores; often banked with per-core slices' },
    { level: 'Main Memory (DRAM)', size: '4–256 GB', latency: '~60–100 ns (200–300 cycles)', tech: 'DRAM (1T1C cell)', bw: '25–96 GB/s', cost: '~$0.003/MB', note: 'Byte-addressable; refreshed every 7.8 µs; the primary focus of this course' },
    { level: 'NVMe SSD', size: '256 GB–8 TB', latency: '~100 µs', tech: '3D NAND Flash', bw: '5–14 GB/s', cost: '~$0.0001/MB', note: 'Persistent; block-addressed (4 KB minimum); OS page cache needed' },
    { level: 'HDD', size: '1–20 TB', latency: '~5–10 ms', tech: 'Magnetic platters', bw: '~200 MB/s', cost: '~$0.00002/MB', note: 'Rotational latency dominant; sequential BW much higher than random' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Level</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Size</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Latency</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Technology</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Notes</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => {
            const isDRAM = l.level.includes('DRAM')
            return (
              <tr key={i} className={`border-t border-dram-border ${isDRAM ? 'bg-dram-blue/5' : i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                <td className={`p-3 font-bold ${isDRAM ? 'text-dram-blue' : 'text-dram-text'}`}>{l.level}</td>
                <td className="p-3 font-mono text-dram-amber">{l.size}</td>
                <td className="p-3 font-mono text-dram-green">{l.latency}</td>
                <td className="p-3 text-dram-muted">{l.tech}</td>
                <td className="p-3 text-dram-muted hidden md:table-cell">{l.note}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LocalityDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Why Caches Work — Locality of Reference
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: 'Temporal Locality',
            color: '#3b82f6',
            icon: '⏱',
            desc: 'If you access address X, you are likely to access X again soon.',
            example: 'A loop variable is loaded every iteration. Keeping it in L1 avoids thousands of DRAM accesses.',
          },
          {
            name: 'Spatial Locality',
            color: '#22c55e',
            icon: '📍',
            desc: 'If you access address X, you are likely to access X±64 bytes soon.',
            example: 'Scanning an array accesses sequential addresses. DRAM serves 64-byte cache lines at once — adjacent elements arrive free.',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-4" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-2" style={{ color: item.color }}>{item.icon} {item.name}</div>
            <p className="text-xs text-dram-text mb-2">{item.desc}</p>
            <div className="text-xs text-dram-muted bg-dram-bg rounded p-2">
              <span className="text-dram-text font-medium">Example: </span>{item.example}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        Programs that violate both principles — random access to a large dataset — expose the full
        DRAM latency on every access. This is why cache-oblivious algorithms and data structure
        layout matter so much for high-performance computing.
      </p>
    </div>
  )
}

function MemoryWallDiagram() {
  const years = [1993, 1997, 2001, 2005, 2009, 2013, 2017, 2021, 2024]
  const cpuPerf = [1, 3.5, 12, 35, 80, 200, 500, 1000, 2000]
  const dramBW = [1, 3, 7, 18, 36, 50, 80, 127, 170]
  const dramLatNs = [100, 95, 85, 80, 75, 72, 68, 65, 62]

  const w = 420, h = 140
  const xPad = 40, yPad = 15
  const xScale = (y) => xPad + ((y - 1993) / (2024 - 1993)) * (w - xPad - 20)
  const yLogScale = (v, min, max) => h - yPad - ((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))) * (h - 2 * yPad)

  const cpuPts = years.map((y, i) => `${xScale(y)},${yLogScale(cpuPerf[i], 1, 2500)}`).join(' ')
  const bwPts = years.map((y, i) => `${xScale(y)},${yLogScale(dramBW[i], 1, 2500)}`).join(' ')

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        The Memory Wall — CPU performance vs DRAM bandwidth (log scale, 1993=1×)
      </h3>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} preserveAspectRatio="xMidYMid meet">
        {/* CPU line */}
        <polyline points={cpuPts} fill="none" stroke="#3b82f6" strokeWidth="2"/>
        {/* DRAM BW line */}
        <polyline points={bwPts} fill="none" stroke="#22c55e" strokeWidth="2"/>

        {/* Year labels */}
        {years.filter((_, i) => i % 2 === 0).map((y) => (
          <text key={y} x={xScale(y)} y={h + 20} textAnchor="middle" fill="#64748b" fontSize={9}>{y}</text>
        ))}

        {/* Legend */}
        <line x1={xPad} y1={12} x2={xPad + 20} y2={12} stroke="#3b82f6" strokeWidth="2"/>
        <text x={xPad + 24} y={16} fill="#3b82f6" fontSize={9}>CPU throughput (~2000× in 30 yr)</text>
        <line x1={200} y1={12} x2={220} y2={12} stroke="#22c55e" strokeWidth="2"/>
        <text x={224} y={16} fill="#22c55e" fontSize={9}>DRAM bandwidth (~170× in 30 yr)</text>

        {/* Gap annotation */}
        <text x={xScale(2024) - 5} y={yLogScale(2000, 1, 2500) + 4} textAnchor="end" fill="#3b82f6" fontSize={8}>2000×</text>
        <text x={xScale(2024) - 5} y={yLogScale(170, 1, 2500) + 4} textAnchor="end" fill="#22c55e" fontSize={8}>170×</text>
        <line x1={xScale(2024) - 2} y1={yLogScale(170, 1, 2500)} x2={xScale(2024) - 2} y2={yLogScale(2000, 1, 2500)} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2"/>
        <text x={xScale(2024) + 2} y={(yLogScale(170, 1, 2500) + yLogScale(2000, 1, 2500)) / 2 + 3} fill="#ef4444" fontSize={8}>Gap!</text>
      </svg>
    </div>
  )
}

export default function L01() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 01</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Memory Hierarchy</h1>
        <p className="text-dram-muted mt-2">Why DRAM exists, where it fits, and why the hierarchy is shaped the way it is</p>
      </div>

      <MemoryHierarchyViz />

      <h2>The Speed-Capacity Trade-off</h2>
      <p>
        Every computer needs memory to hold programs and data. The challenge is a hard physical
        trade-off: fast memory is expensive and small; cheap memory is large but slow. Engineers
        solve this with a <strong>memory hierarchy</strong> — a layered stack where each level is
        larger, cheaper, and slower than the one above it.
      </p>
      <p>
        The CPU executes at GHz speeds — one clock cycle every ~0.3 ns. If it waited for main
        memory (~80 ns) on every access, it would sit idle for 250+ cycles per instruction.
        Caches keep recently used data close and hide that latency most of the time.
      </p>

      <h2>The Full Hierarchy — Numbers You Should Know</h2>
      <HierarchyTable />

      <h2>Why the Hierarchy Works: Locality of Reference</h2>
      <p>
        Caches would be useless if programs accessed memory randomly. They work because real programs
        exhibit two predictable patterns:
      </p>
      <LocalityDiagram />

      <p>
        A typical cache hit rate for L1 is 95–99% — meaning the CPU finds what it needs in 1–4 ns
        on 95–99% of accesses. The expensive DRAM access (80 ns) happens on only 1–5% of accesses,
        which is tolerable. If hit rates were 50%, computers would feel 10–20× slower.
      </p>

      <h2>The Memory Wall</h2>
      <p>
        CPU performance has improved roughly 2000× from 1993 to 2024 (clock speed × IPC × core count).
        DRAM <strong>bandwidth</strong> has improved about 170× (FPM at ~0.3 GB/s to DDR5-6400 at ~51 GB/s per channel).
        DRAM <strong>latency</strong> has barely moved — from ~100 ns in 1993 to ~62 ns today, less
        than 2× improvement. This divergence is the <strong>memory wall</strong>.
      </p>

      <MemoryWallDiagram />

      <p>
        The memory wall is primarily a <em>latency</em> wall, not a bandwidth wall. Bandwidth has
        kept up reasonably (multiple channels, wider buses, DDR). But the time it takes for the
        first byte of data to arrive after a cache miss is almost as slow as it was 30 years ago.
      </p>
      <p>
        Modern CPUs respond to the latency wall with massive complexity:
      </p>
      <ul>
        <li><strong>Multi-level caches</strong> (L1+L2+L3): absorb most accesses before they hit DRAM</li>
        <li><strong>Out-of-order execution</strong>: continue processing other instructions while waiting for memory</li>
        <li><strong>Hardware prefetchers</strong>: predict future accesses and fetch data from DRAM before the CPU requests it</li>
        <li><strong>Non-blocking caches</strong>: allow multiple cache misses to be in-flight simultaneously (memory level parallelism, MLP)</li>
        <li><strong>MSHR (Miss Status Holding Registers)</strong>: track pending cache misses to merge duplicates and service them in parallel</li>
      </ul>

      <h2>Why DRAM for Main Memory?</h2>
      <p>
        SRAM (6-transistor cell) is fast with no refresh needed — exactly what you'd want in main
        memory. But it uses 6× the transistors per bit vs DRAM's 1T1C. At 2024 densities:
      </p>
      <ul>
        <li>SRAM: ~512 MB per mm² on TSMC 5nm = ~$0.04/MB</li>
        <li>DRAM: ~16 GB per mm² = ~$0.003/MB</li>
      </ul>
      <p>
        DRAM is ~13× more area-efficient, making 64 GB of DRAM cost-viable where 64 GB of SRAM
        would be prohibitively expensive (and would require 13× more die area). The downside —
        destructive reads, periodic refresh, higher latency — is the price of that density.
      </p>

      <h2>Cache Hierarchy Design Decisions</h2>
      <p>
        Cache designers tune several knobs to balance hit rate, area, and latency:
      </p>
      <ul>
        <li><strong>Cache line size</strong>: 64 bytes is the industry standard. Larger lines exploit spatial locality better but waste bandwidth if accesses are sparse. Smaller lines reduce bandwidth waste but need more tag overhead.</li>
        <li><strong>Associativity</strong>: direct-mapped (1-way) is fastest but suffers conflict misses. 8-way set-associative (L1 typical) reduces conflicts at moderate cost. Fully associative (TLB) has no conflicts but is too slow for general caches.</li>
        <li><strong>Inclusion policy</strong>: inclusive LLC (L3 contains everything in L1/L2) simplifies coherence but wastes space. Exclusive (AMD's approach) uses every byte of cache area once.</li>
        <li><strong>Replacement policy</strong>: LRU (least recently used) is common; QLRU (quadrant LRU) approximates it cheaply; ARC (adaptive replacement cache) handles scan-heavy workloads.</li>
      </ul>

      <LessonNav lessonId={1} onComplete={() => markComplete(1)} />
    </div>
  )
}
