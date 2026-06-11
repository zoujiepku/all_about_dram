import { useOutletContext } from 'react-router-dom'
import { Link } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import { lessons } from '../data/lessons'

function TechCard({ name, mechanism, readSpeed, writeSpeed, endurance, retention, nonVol, status, color, desc, products }) {
  return (
    <div className="rounded-xl p-5 border" style={{ borderColor: color + '44', backgroundColor: color + '08' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-base" style={{ color }}>{name}</h4>
        <span
          className="text-xs px-2 py-0.5 rounded font-mono"
          style={{ backgroundColor: color + '22', color }}
        >
          {status}
        </span>
      </div>
      <p className="text-xs text-dram-muted mb-3">{desc}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          ['Mechanism', mechanism],
          ['Read', readSpeed],
          ['Write', writeSpeed],
          ['Endurance', endurance],
          ['Retention', retention],
          ['Non-volatile', nonVol],
        ].map(([k, v]) => (
          <div key={k} className="bg-dram-bg rounded p-2">
            <div className="text-xs text-dram-muted">{k}</div>
            <div className="text-xs font-bold font-mono" style={{ color }}>{v}</div>
          </div>
        ))}
      </div>
      {products && (
        <div className="text-xs text-dram-muted bg-dram-bg rounded p-2">
          <span className="text-dram-text font-medium">Products: </span>{products}
        </div>
      )}
    </div>
  )
}

function RadarViz({ techs }) {
  const attrs = ['Speed', 'Density', 'Endurance', 'Retention', 'Maturity']
  const cx = 150, cy = 130, r = 90
  const n = attrs.length

  const getPoint = (i, val) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    const dist = (val / 10) * r
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)]
  }

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Technology Comparison Radar
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        <svg width="100%" height="auto" viewBox="0 0 300 260" style={{ maxWidth: 300 }}>
          {[2, 4, 6, 8, 10].map((v) => (
            <polygon key={v}
              points={attrs.map((_, i) => {
                const [px, py] = getPoint(i, v)
                return `${px},${py}`
              }).join(' ')}
              fill="none" stroke="#334155" strokeWidth="1"
            />
          ))}
          {attrs.map((_, i) => {
            const [px, py] = getPoint(i, 10)
            return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#334155" strokeWidth="1" />
          })}
          {attrs.map((label, i) => {
            const [px, py] = getPoint(i, 11.5)
            return (
              <text key={i} x={px} y={py} textAnchor="middle" dominantBaseline="middle"
                fill="#64748b" fontSize="10">{label}</text>
            )
          })}
          {techs.map((tech) => {
            const pts = tech.scores.map((s, i) => {
              const [px, py] = getPoint(i, s)
              return `${px},${py}`
            }).join(' ')
            return (
              <polygon key={tech.name} points={pts}
                fill={tech.color + '25'} stroke={tech.color} strokeWidth="1.5"
              />
            )
          })}
        </svg>
        <div className="flex flex-col gap-2 self-center">
          {techs.map((t) => (
            <div key={t.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }} />
              <span className="text-xs" style={{ color: t.color }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const radarTechs = [
  { name: 'DRAM', color: '#3b82f6', scores: [9, 7, 9, 2, 10] },
  { name: 'NAND Flash', color: '#f59e0b', scores: [5, 9, 4, 10, 10] },
  { name: 'ReRAM', color: '#22c55e', scores: [7, 8, 7, 9, 5] },
  { name: 'MRAM', color: '#a855f7', scores: [9, 4, 8, 10, 6] },
  { name: 'FeRAM', color: '#ef4444', scores: [8, 5, 9, 10, 6] },
]

function NANDEvolutionCard() {
  const rows = [
    { type: 'SLC (1 bit/cell)', levels: 2, endurance: '~100K P/E', retention: '>10 yr', speed: 'Fastest', use: 'Enterprise cache, NVMe tier-0' },
    { type: 'MLC (2 bits/cell)', levels: 4, endurance: '~10K P/E', retention: '>10 yr', speed: 'Fast', use: 'Enterprise SSDs, client SSD' },
    { type: 'TLC (3 bits/cell)', levels: 8, endurance: '~3K P/E', retention: '~1–3 yr', speed: 'Medium', use: 'Consumer SSD (mainstream)' },
    { type: 'QLC (4 bits/cell)', levels: 16, endurance: '~1K P/E', retention: '<1 yr', speed: 'Slower', use: 'High-cap HDD replacement, cold storage' },
    { type: 'PLC (5 bits/cell)', levels: 32, endurance: '~100 P/E', retention: 'Months', speed: 'Slowest', use: 'Tape-replacement research' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">NAND Flash — bits per cell evolution</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-dram-muted border-b border-dram-border">
              <th className="text-left p-2">Type</th>
              <th className="p-2">Levels</th>
              <th className="p-2">Endurance</th>
              <th className="p-2">Retention</th>
              <th className="p-2 hidden md:table-cell">Use Case</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']
              return (
                <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                  <td className="p-2 font-bold" style={{ color: colors[i] }}>{r.type}</td>
                  <td className="p-2 font-mono text-center text-dram-muted">{r.levels}</td>
                  <td className="p-2 font-mono text-center text-dram-text">{r.endurance}</td>
                  <td className="p-2 font-mono text-center text-dram-text">{r.retention}</td>
                  <td className="p-2 text-dram-muted hidden md:table-cell">{r.use}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-dram-muted mt-2">
        More bits per cell = cheaper per GB but lower endurance and retention. 3D NAND (96–232 layer
        stacks) partially compensates by using thicker tunnel oxide at each node and stacking more
        layers rather than shrinking the cell footprint further.
      </p>
    </div>
  )
}

function CXLDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        CXL Memory Disaggregation
      </h3>
      <svg width="100%" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
        {/* CPUs */}
        {[0, 1].map(i => (
          <g key={i}>
            <rect x={20 + i * 140} y={20} width={110} height={50} rx={6} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5}/>
            <text x={75 + i * 140} y={43} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="bold">CPU {i}</text>
            <text x={75 + i * 140} y={58} textAnchor="middle" fill="#64748b" fontSize={9}>Local DDR5</text>
          </g>
        ))}

        {/* PCIe / CXL switch */}
        <rect x="175" y="90" width="150" height="40" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth={1.5}/>
        <text x="250" y="108" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold">CXL Switch</text>
        <text x="250" y="122" textAnchor="middle" fill="#64748b" fontSize={9}>PCIe 5.0 / CXL 3.0</text>

        {/* CXL DRAM expanders */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x={80 + i * 140} y={140} width={100} height={20} rx={3} fill="#1a2744" stroke="#22c55e" strokeWidth={1}/>
            <text x={130 + i * 140} y={153} textAnchor="middle" fill="#22c55e" fontSize={9}>CXL DRAM {i + 1}</text>
          </g>
        ))}

        {/* Connection lines */}
        {[0, 1].map(i => (
          <line key={i} x1={75 + i * 140} y1={70} x2={250} y2={90} stroke="#64748b" strokeWidth={1} strokeDasharray="4 2"/>
        ))}
        {[0, 1, 2].map(i => (
          <line key={i} x1={130 + i * 140} y1={140} x2={250} y2={130} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2"/>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        {[
          { label: 'Local DDR5 latency', val: '~80 ns', color: '#3b82f6' },
          { label: 'CXL DRAM latency', val: '~180–300 ns', color: '#22c55e' },
          { label: 'Address space', val: 'Unified (same VA)', color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="bg-dram-bg rounded p-2 text-center">
            <div className="text-dram-muted">{item.label}</div>
            <div className="font-bold font-mono mt-1" style={{ color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-2">
        Multiple servers can share a pool of CXL DRAM blades, allocating capacity on demand.
        A server running a memory-intensive workload can borrow capacity from a server with
        light usage — improving average memory utilization in a data center from ~40% to 70%+.
      </p>
    </div>
  )
}

export default function L11() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 11</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Emerging Technologies</h1>
        <p className="text-dram-muted mt-2">ReRAM, FeRAM, MRAM, CXL, and the future of memory</p>
      </div>

      <RadarViz techs={radarTechs} />

      <h2>Why DRAM Scaling Is Slowing Down</h2>
      <p>
        DRAM scaling has always been harder than logic scaling. A logic gate shrinks well with
        the transistor — smaller transistor = smaller gate. A DRAM cell has two independent
        constraints:
      </p>
      <ul>
        <li><strong>The capacitor</strong> must store enough charge to be detectable (≥ 10–20 fC).
            As the cell footprint shrinks, the capacitor area shrinks, which reduces capacitance
            and stored charge. Engineers compensate with taller cylindrical capacitors and
            higher-k dielectrics (ZrO₂, HfO₂ stacks with k = 40–50 vs SiO₂ at k = 3.9), but
            aspect ratios beyond 100:1 (height:diameter) are extremely challenging to manufacture.</li>
        <li><strong>The transistor</strong> leakage must be low enough for 64 ms retention.
            As gate lengths shrink below 20 nm, subthreshold leakage increases exponentially,
            shortening retention. Buried wordline (BWLD) designs and negative wordline (-0.5 V)
            extend retention but add process complexity.</li>
      </ul>
      <p>
        DRAM nodes have stalled around 10–16 nm effective cell size (compared to logic at 3–5 nm).
        The industry is researching alternatives that either replace or augment DRAM cells.
      </p>

      <h2>Emerging Non-Volatile Memories</h2>

      <div className="space-y-4 mb-6">
        <TechCard
          name="ReRAM (Resistive RAM)"
          mechanism="Resistance switching via conductive filament"
          readSpeed="~10 ns"
          writeSpeed="~10 ns"
          endurance="10⁸–10¹²"
          retention=">10 yr"
          nonVol="Yes"
          status="Early production"
          color="#22c55e"
          products="Weebit Nano (HfOx-based), Panasonic RRAM (TaOx), IMEC research"
          desc="A metal oxide (e.g., HfOx, TaOx) between two electrodes switches resistance by forming or rupturing a conductive filament. SET operation grows the filament (low resistance = logic 1); RESET breaks it (high resistance = logic 0). Two-terminal structure enables extreme density — potentially sub-10 nm cells. Main challenges: cycle-to-cycle variability in filament formation, and distinguishing the two resistance states reliably at small margins."
        />
        <TechCard
          name="FeRAM (Ferroelectric RAM)"
          mechanism="Ferroelectric polarization of HfO₂-based dielectric"
          readSpeed="~1–10 ns"
          writeSpeed="~1–10 ns"
          endurance="10⁸–10¹¹ (HfO₂-FeFET)"
          retention=">10 yr"
          nonVol="Yes"
          status="Niche production"
          color="#ef4444"
          products="Texas Instruments (legacy PZT), FMC (FRAM), Ferroelectric FET research (TSMC, imec)"
          desc="Uses the bistable polarization state of a ferroelectric material as the storage element. HfO₂ doped with Zr (HZO) is CMOS-compatible and can be integrated directly into the gate stack of an FET (FeFET = ferroelectric field-effect transistor), eliminating the separate capacitor entirely. Write is fast and low-energy — just apply a voltage to switch polarization. The read is non-destructive (unlike DRAM). Traditional PZT-based FeRAM achieves 10¹⁴ cycles but is not CMOS-compatible."
        />
        <TechCard
          name="MRAM (Magnetic RAM)"
          mechanism="Magnetic tunnel junction (MTJ) resistance"
          readSpeed="~1–3 ns"
          writeSpeed="~1–10 ns"
          endurance=">10¹⁵"
          retention=">10 yr @ 85°C"
          nonVol="Yes"
          status="In production (embedded)"
          color="#a855f7"
          products="Everspin (discrete STT-MRAM), TSMC N22 embedded MRAM, Samsung 28nm eMRAM, GlobalFoundries 22FDX"
          desc="A magnetic tunnel junction is two ferromagnetic layers separated by a thin MgO insulator. When the layers' magnetizations are parallel, resistance is low (logic 0); anti-parallel gives high resistance (logic 1). Spin-transfer torque (STT) switches magnetization with a spin-polarized current through the junction — no external magnetic field needed. MRAM is now embedded in advanced logic nodes as an alternative to SRAM for last-level cache and microcontroller code storage. Outstanding endurance (>10¹⁵ cycles) makes it suitable for write-intensive workloads. Area per bit is 2–4× larger than SRAM today, which limits its competitiveness against SRAM-based caches."
        />
        <TechCard
          name="PCM (Phase Change Memory)"
          mechanism="Amorphous ↔ crystalline phase of GeSbTe"
          readSpeed="~50–100 ns"
          writeSpeed="~50–500 ns"
          endurance="10⁷–10⁸"
          retention=">10 yr @ 85°C"
          nonVol="Yes"
          status="In production (Optane discontinued 2022)"
          color="#06b6d4"
          products="Intel Optane (3D XPoint, discontinued 2022), IBM PCM research"
          desc="A chalcogenide alloy (GeSbTe) switches between amorphous (high resistance) and crystalline (low resistance) phases using current-generated heat. SET (crystallize) requires longer heating at moderate temperature; RESET (amorphize) requires a short, high-power pulse then rapid quench. Intel's Optane DIMM used PCM in a DIMM form factor as a storage-class memory (SCM) tier — slower than DRAM (~300 ns) but non-volatile and much denser. Intel discontinued Optane in 2022 due to limited adoption, but the technology concept (SCM as a DRAM+SSD hybrid tier) remains relevant."
        />
      </div>

      <h2>NAND Flash: Storage's Workhorse</h2>
      <p>
        NAND flash is not DRAM — it's non-volatile storage, not main memory. But it's central to
        the memory hierarchy as the medium for NVMe SSDs. NAND scales by packing more bits per
        cell and stacking more layers vertically (3D NAND):
      </p>

      <NANDEvolutionCard />

      <p>
        Modern 3D NAND has 176–232 cell layers stacked vertically (Samsung V-NAND 8th gen:
        236 layers). Each layer is a NAND string of ~128 cells. The vertical strings share a
        single select transistor at top and bottom, so adding layers costs very little extra
        area — 3D is how NAND continues to scale despite the flat-plane cell footprint limit.
      </p>

      <h2>SRAM Scaling Challenges</h2>
      <p>
        SRAM (the 6T cell used in CPU caches) is struggling too. At 5 nm and below, bitcell
        area improvement nearly stalled — TSMC 3nm offered only ~5% smaller SRAM bitcell than
        5nm. This is because the 6T cell needs minimum-width transistors for all 6 devices, and
        the SRAM cell voltage margin degrades as transistors shrink.
      </p>
      <p>
        Responses: <strong>AMD 3D V-Cache</strong> (stacks additional SRAM dies on top of the
        CPU die using hybrid bonding, adding 64–192 MB L3), and research into
        <strong>SRAM-replacement STT-MRAM</strong> for last-level cache (Everspin, TSMC roadmap
        items). MRAM's density disadvantage shrinks at advanced nodes as SRAM scaling slows.
      </p>

      <h2>CXL: Memory Disaggregation</h2>
      <p>
        <strong>Compute Express Link (CXL)</strong> is a coherent interconnect protocol layered
        on PCIe 5.0/6.0. CXL.mem allows CPUs to access external DRAM blades over PCIe as if
        they were local memory — same virtual address space, cache-coherent. This enables
        <strong>memory disaggregation</strong>: a pool of DRAM shared across multiple servers.
      </p>

      <CXLDiagram />

      <p>
        CXL latency (~180–300 ns) is 2–4× worse than local DDR5, but the capacity and cost
        benefits are significant. A server can exceed its DIMM slot limit by attaching CXL DRAM
        expanders — enabling 1–10 TB of memory-addressable storage for in-memory databases,
        large language model serving, and memory-intensive analytics.
      </p>
      <p>
        CXL 3.0 (PCIe 6.0 based) enables multi-head fabric — multiple hosts sharing the same
        CXL memory pool simultaneously with cache coherency across hosts. This makes CXL a
        platform for cloud memory-as-a-service: DRAM blades in a rack allocated per-VM on demand.
      </p>

      <h2>The Heterogeneous Memory Future</h2>
      <p>
        The memory hierarchy of 2025+ is not one technology at each level — it's a
        <strong>heterogeneous stack</strong> chosen for workload:
      </p>
      <ul>
        <li><strong>On-die SRAM / eMRAM</strong> → last-level cache (3–512 MB)</li>
        <li><strong>HBM3E / HBM4</strong> → AI training bandwidth (TB/s per accelerator)</li>
        <li><strong>DDR5 / LPDDR5X</strong> → main memory capacity (32–512 GB)</li>
        <li><strong>CXL DRAM</strong> → memory capacity overflow (1–10 TB)</li>
        <li><strong>PCIe NVMe (TLC/QLC 3D NAND)</strong> → fast storage (1–64 TB)</li>
        <li><strong>QLC / PLC NAND</strong> → cold storage (100 TB+)</li>
      </ul>
      <p>
        Software and OS memory management are evolving to tier data across this stack automatically
        — placing hot data in fast tiers, cold data in slow ones, and migrating transparently
        as access patterns change. This is the active frontier of systems research.
      </p>

      {/* Completion card */}
      <div className="mt-8 rounded-xl p-6 bg-gradient-to-br from-dram-blue/10 to-dram-green/10 border border-dram-blue/30 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <h3 className="text-xl font-bold text-dram-text mb-2">Level 1 Complete!</h3>
        <p className="text-dram-muted text-sm mb-4">
          From the 1T1C cell all the way to HBM3 and emerging non-volatile memories — you now
          have a solid picture of how modern memory works. Continue to Level 2 for engineering depth.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-5">
          {lessons.map((l) => (
            <span key={l.id} className="px-2 py-1 rounded-full bg-dram-surface text-dram-muted border border-dram-border">
              {l.icon} {l.title}
            </span>
          ))}
        </div>
        <Link
          to="/level2/lesson/1"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-dram-blue text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          Start Level 2 →
        </Link>
      </div>

      <LessonNav lessonId={11} onComplete={() => markComplete(11)} />
    </div>
  )
}
