import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import EvolutionTimelineViz from '../visualizations/EvolutionTimelineViz'

function GenerationTable() {
  const gens = [
    { gen: 'FPM DRAM', year: '1987', voltage: '5V', speed: '20–50 MT/s', prefetch: '1n', bw: '~0.2 GB/s', key: 'First page mode — stay on row, increment CAS' },
    { gen: 'EDO DRAM', year: '1994', voltage: '5V', speed: '40–66 MT/s', prefetch: '1n', bw: '~0.4 GB/s', key: 'Output latch — CAS pipeline, 40% bandwidth gain' },
    { gen: 'SDRAM', year: '1996', voltage: '3.3V', speed: '66–133 MT/s', prefetch: '1n', bw: '~1 GB/s', key: 'Synchronous clock — burst mode, command queue' },
    { gen: 'DDR', year: '2000', voltage: '2.5V', speed: '200–400 MT/s', prefetch: '2n', bw: '~3.2 GB/s', key: 'Both clock edges — 2n prefetch buffer' },
    { gen: 'DDR2', year: '2003', voltage: '1.8V', speed: '400–1066 MT/s', prefetch: '4n', bw: '~8.5 GB/s', key: '4n prefetch, ODT, lower voltage, faster I/O' },
    { gen: 'DDR3', year: '2007', voltage: '1.5V', speed: '800–2133 MT/s', prefetch: '8n', bw: '~17 GB/s', key: '8n prefetch, fly-by topology, XMP overclocking' },
    { gen: 'DDR4', year: '2014', voltage: '1.2V', speed: '1600–3200 MT/s', prefetch: '8n', bw: '~25 GB/s', key: 'Bank groups, POD signaling, per-pin calibration' },
    { gen: 'DDR5', year: '2021', voltage: '1.1V', speed: '4800–8400 MT/s', prefetch: '16n', bw: '~67 GB/s', key: '2 subchannels, on-die ECC, PMIC on module, per-bank refresh' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Generation</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Year</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Voltage</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Speed</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Prefetch</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Peak BW</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Key Innovation</th>
          </tr>
        </thead>
        <tbody>
          {gens.map((g, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-bold text-dram-blue">{g.gen}</td>
              <td className="p-3 text-dram-muted">{g.year}</td>
              <td className="p-3 font-mono text-dram-green">{g.voltage}</td>
              <td className="p-3 font-mono text-dram-amber">{g.speed}</td>
              <td className="p-3 font-mono text-dram-muted">{g.prefetch}</td>
              <td className="p-3 font-mono text-dram-text">{g.bw}</td>
              <td className="p-3 text-dram-muted hidden md:table-cell">{g.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PrefetchDiagram() {
  const gens = [
    { label: 'SDRAM\n1n', n: 1, color: '#64748b' },
    { label: 'DDR\n2n', n: 2, color: '#3b82f6' },
    { label: 'DDR2\n4n', n: 4, color: '#22c55e' },
    { label: 'DDR3/4\n8n', n: 8, color: '#f59e0b' },
    { label: 'DDR5\n16n', n: 16, color: '#a855f7' },
  ]
  const maxN = 16
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Prefetch Buffer Width — the key to bandwidth scaling
      </h3>
      <div className="flex flex-col gap-3">
        {gens.map((g) => (
          <div key={g.label} className="flex items-center gap-3">
            <div className="text-xs font-mono text-dram-muted w-20 text-right whitespace-pre-line leading-tight">{g.label}</div>
            <div className="flex-1 h-6 rounded bg-dram-bg overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${(g.n / maxN) * 100}%`, backgroundColor: g.color + '55', borderRight: `2px solid ${g.color}` }}
              />
            </div>
            <div className="text-xs font-mono w-16" style={{ color: g.color }}>×{g.n} cells</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        Each generation reads more cells per internal array cycle and sends them out faster on the external bus.
        The cell array clock stays slow (lower power and heat); only the I/O bus gets faster. DDR5 reads
        16 cells per array cycle while the I/O bus runs 16× faster — the cell array itself only needs
        to operate at 300–400 MHz even at 6400 MT/s.
      </p>
    </div>
  )
}

function DDR4BankGroupDiagram() {
  const groups = [
    { id: 'BG0', banks: ['B0', 'B1', 'B2', 'B3'], color: '#3b82f6' },
    { id: 'BG1', banks: ['B4', 'B5', 'B6', 'B7'], color: '#22c55e' },
    { id: 'BG2', banks: ['B8', 'B9', 'B10', 'B11'], color: '#f59e0b' },
    { id: 'BG3', banks: ['B12', 'B13', 'B14', 'B15'], color: '#a855f7' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DDR4 Bank Groups — 4 groups × 4 banks = 16 banks
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {groups.map((g) => (
          <div key={g.id} className="rounded-lg p-3 text-center" style={{ border: `1px solid ${g.color}44`, backgroundColor: g.color + '0d' }}>
            <div className="text-xs font-bold mb-2" style={{ color: g.color }}>{g.id}</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {g.banks.map((b) => (
                <div key={b} className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: g.color + '22', color: g.color }}>{b}</div>
              ))}
            </div>
            <div className="text-xs text-dram-muted mt-2">shared IO path</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-dram-muted">
        <div className="bg-dram-bg rounded p-2">
          <span className="text-dram-green font-bold">tCCD_S = 4 cycles</span> — CAS to CAS across bank groups
        </div>
        <div className="bg-dram-bg rounded p-2">
          <span className="text-dram-amber font-bold">tCCD_L = 5 cycles</span> — CAS to CAS within a bank group
        </div>
      </div>
      <p className="text-xs text-dram-muted mt-2">
        Bank groups share an internal data path. Reading BG0 then BG1 in rapid succession uses two
        independent paths (tCCD_S). Reading BG0 twice in a row reuses the same path and needs more
        settling time (tCCD_L). An ideal controller alternates across all four bank groups.
      </p>
    </div>
  )
}

export default function L08() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 08</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DRAM Evolution</h1>
        <p className="text-dram-muted mt-2">From FPM DRAM (1987) to DDR5 (2021) — how each generation squeezed more bandwidth from the same cell</p>
      </div>

      <EvolutionTimelineViz />

      <h2>What Actually Changes Each Generation</h2>
      <p>
        The fundamental <strong>1T1C cell has barely changed</strong> in 40 years. Cell capacitance
        is still ~20 fF. Retention time is still ~64 ms. Sense amplifiers still resolve a 55 mV
        differential. What has changed dramatically is the <em>interface</em> between the cell array
        and the outside world. Each generation introduced a new technique to extract more bandwidth
        from the same underlying physics.
      </p>

      <h2>Generation-by-Generation Reference</h2>
      <GenerationTable />

      <h2>The Prefetch Buffer: The Bandwidth Engine</h2>
      <p>
        The central mechanism behind DDR bandwidth scaling is the <strong>prefetch buffer</strong>.
        Instead of reading one bit from the array per clock cycle, each DDR generation reads
        multiple bits simultaneously (Nn prefetch) and serializes them onto the external bus.
      </p>

      <PrefetchDiagram />

      <p>
        The internal array clock runs at the reference frequency (e.g., 200 MHz). DDR sends data
        on both edges, so a 200 MHz clock produces 400 MT/s on a 1n prefetch bus. With 8n prefetch
        (DDR3/4), the same 200 MHz array clock supplies 8 bits per cycle to an IO bus that runs
        at 1600 MT/s — with the external frequency 4× the array frequency. The array stays cool;
        the IO bus runs fast.
      </p>

      <h2>Key Innovations per Generation</h2>

      <h3>FPM → EDO (1987–1994): The CAS Pipeline</h3>
      <p>
        Fast Page Mode allowed back-to-back reads from the same row by cycling CAS without
        re-issuing RAS. EDO (Extended Data Out) added an output latch that held the previous
        data on DQ while the next CAS was being issued. This created a one-deep pipeline:
        present next column address → previous data still valid → capture it → new data arrives.
        Result: ~40% throughput improvement with no array changes.
      </p>

      <h3>EDO → SDRAM (1994–1996): Adding a Clock</h3>
      <p>
        Asynchronous DRAM required the controller to know exact timing margins for every chip
        on the board. Synchronous DRAM added a <strong>CLK pin</strong> — all commands and data
        are sampled at clock edges. The DRAM could now queue a burst of up to 8 column accesses
        from a single READ command, with data appearing reliably on successive clock edges. This
        also enabled DIMMs to work with memory controllers across many PCB layouts.
      </p>

      <h3>SDRAM → DDR (1996–2000): Both Clock Edges</h3>
      <p>
        The key insight: SDRAM wasted the falling clock edge. DDR drives data on <em>both</em>
        rising and falling edges, doubling throughput at the same clock frequency. A 2n prefetch
        buffer reads two bits from the array per internal cycle; a differential DQS strobe (one
        per byte lane) tells the controller exactly when to sample each bit. The internal clock
        is unchanged; the external bus runs at 2× the array clock.
      </p>

      <h3>DDR → DDR2/3: Faster I/O, Wider Prefetch</h3>
      <p>
        DDR2 doubled the prefetch to 4n and pushed the I/O frequency to 2× the SDRAM reference.
        On-die termination (ODT) was added to improve signal integrity — previously, the memory
        controller managed termination externally. DDR3 widened to 8n prefetch and added
        fly-by routing on DIMMs (daisy-chain rather than T-topology) to reduce reflections at
        higher frequencies.
      </p>

      <h3>DDR3 → DDR4 (2007–2014): Bank Groups</h3>
      <p>
        DDR4's key architectural addition was <strong>bank groups</strong>: the 16 banks are
        organized as 4 groups of 4. Each bank group has an independent internal data path,
        allowing back-to-back column accesses to different groups with only tCCD_S = 4 cycles
        (vs tCCD_L = 5 cycles within a group). DDR4 also introduced POD-1.2 signaling
        (replacing SSTL), reducing I/O power by ~25%.
      </p>

      <DDR4BankGroupDiagram />

      <h3>DDR4 → DDR5 (2014–2021): Subchannels and On-Die ECC</h3>
      <p>
        DDR5 makes the most structural changes since SDRAM:
      </p>
      <ul>
        <li><strong>Two independent 32-bit subchannels per DIMM</strong>: one 64-bit DDR4 channel
            splits into two 32-bit DDR5 channels, each independently addressable. This halves
            the minimum transfer granularity (32B vs 64B) and improves bank parallelism.</li>
        <li><strong>On-die ECC</strong>: each DRAM chip internally adds ECC protection before
            delivering data to the controller. This catches die-internal soft errors that would
            be invisible to the DIMM-level ECC. It is not a replacement for DIMM ECC.</li>
        <li><strong>PMIC on DIMM</strong>: the power management IC moves from the motherboard
            to the DIMM, enabling tighter per-rank voltage regulation and supporting DDR5's
            1.1 V Vdd with finer granularity than a system-level regulator can provide.</li>
        <li><strong>16n prefetch</strong>: the internal array clock is now 1/16 of the data
            rate. At 6400 MT/s, the array runs at 400 MHz — manageable heat.</li>
        <li><strong>Per-bank refresh</strong>: individual banks can refresh independently,
            reducing the all-bank blackout period that appears in DDR4 during tRFC.</li>
      </ul>

      <h2>Voltage Scaling: Power Reduction Every Generation</h2>
      <p>
        Dynamic power scales as C × V² × f. Every DDR generation drops Vdd:
        5V → 3.3V → 2.5V → 1.8V → 1.5V → 1.2V → 1.1V. Even though bandwidth (f × bus width)
        increases, the voltage reduction partially offsets it. LPDDR5 goes further to 0.5 V
        during self-refresh, allowing near-zero power in deep sleep on mobile devices.
      </p>

      <h2>What Didn't Change: The Latency Wall</h2>
      <p>
        Despite 1000× bandwidth improvement, absolute read latency (tRP + tRCD + CL) has moved
        only from ~75 ns (SDRAM, 1996) to ~42 ns (DDR5-6400, 2024) — less than 2× improvement
        in 28 years. The cell physics (charge sharing, sense amp resolution) haven't changed
        enough to shrink these intervals proportionally. This is why the <strong>memory wall</strong>
        is fundamentally a <em>latency</em> wall, not a bandwidth wall.
      </p>

      <LessonNav lessonId={8} onComplete={() => markComplete(8)} />
    </div>
  )
}
