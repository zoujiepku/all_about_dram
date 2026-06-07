import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import HBMStackViz from '../visualizations/HBMStackViz'

function HBMGenerationTable() {
  const gens = [
    { gen: 'HBM1', year: '2013 (std) / 2015 (product)', bw: '128 GB/s/stack', capacity: '1 GB', dies: '4', bus: '1024-bit', vdd: '1.2V', note: 'JEDEC standard 2013; first product AMD Fury X (June 2015)' },
    { gen: 'HBM2', year: '2016', bw: '256 GB/s/stack', capacity: '4–8 GB', dies: '4–8', bus: '1024-bit', vdd: '1.2V', note: 'NVIDIA V100, AMD Instinct MI25' },
    { gen: 'HBM2E', year: '2020', bw: '460 GB/s/stack', capacity: '8–16 GB', dies: '8', bus: '1024-bit', vdd: '1.2V', note: 'NVIDIA A100, AMD MI100 (up to 1.6 TB/s at 3.2 Gbps/pin)' },
    { gen: 'HBM3', year: '2022', bw: '819 GB/s/stack', capacity: '24 GB', dies: '12', bus: '1024-bit', vdd: '1.1V', note: 'NVIDIA H100, AMD MI300 — 6.4 Gbps/pin' },
    { gen: 'HBM3E', year: '2024', bw: '1.2 TB/s/stack', capacity: '36–64 GB', dies: '16', bus: '1024-bit', vdd: '1.1V', note: 'NVIDIA H200, AMD MI300X — 9.6 Gbps/pin' },
    { gen: 'HBM4 (planned)', year: '2025+', bw: '2+ TB/s/stack', capacity: '64–128 GB', dies: '16+', bus: '2048-bit', vdd: '1.0V', note: 'Hybrid bonding (no microbumps), monolithic base die option' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Generation</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Year</th>
            <th className="text-left p-3 text-dram-muted font-semibold">BW/Stack</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Capacity</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Dies</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Notable Use</th>
          </tr>
        </thead>
        <tbody>
          {gens.map((g, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-bold text-dram-blue whitespace-nowrap">{g.gen}</td>
              <td className="p-3 text-dram-muted">{g.year}</td>
              <td className="p-3 font-mono text-dram-green font-bold">{g.bw}</td>
              <td className="p-3 font-mono text-dram-amber">{g.capacity}</td>
              <td className="p-3 font-mono text-dram-muted">{g.dies}</td>
              <td className="p-3 text-dram-muted hidden md:table-cell">{g.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PackageDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        2.5D Package: GPU + HBM on Silicon Interposer
      </h3>
      <svg width="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
        {/* PCB / substrate */}
        <rect x="0" y="160" width="500" height="40" rx="4" fill="#0f1e2e" stroke="#334155" strokeWidth="1.5"/>
        <text x="250" y="184" textAnchor="middle" fill="#64748b" fontSize="11">PCB / Organic Substrate</text>

        {/* Silicon interposer */}
        <rect x="20" y="130" width="460" height="34" rx="4" fill="#1a2744" stroke="#3b82f6" strokeWidth="1.5"/>
        <text x="250" y="151" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">Silicon Interposer (passive routing layer)</text>

        {/* GPU die */}
        <rect x="150" y="60" width="200" height="70" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
        <text x="250" y="93" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="bold">GPU / AI Accelerator</text>
        <text x="250" y="111" textAnchor="middle" fill="#64748b" fontSize="10">Logic die (TSMC 4N / 5nm)</text>

        {/* HBM stacks */}
        {[[30, 70], [390, 70]].map(([x, y], idx) => (
          <g key={idx}>
            {[0, 1, 2].map(j => (
              <rect key={j} x={x} y={y - j * 14} width={80} height={13} rx={2}
                fill={j === 0 ? '#163820' : '#1a2744'}
                stroke={j === 0 ? '#22c55e' : '#3b82f6'}
                strokeWidth={1}
              />
            ))}
            <text x={x + 40} y={y + 10} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight="bold">HBM3</text>
            <text x={x + 40} y={y + 22} textAnchor="middle" fill="#64748b" fontSize={8}>12 DRAM dies</text>
            <text x={x + 40} y={y + 33} textAnchor="middle" fill="#64748b" fontSize={8}>+ logic base</text>
            {/* TSV indication */}
            {[0,1,2,3].map(k => (
              <line key={k} x1={x + 15 + k * 15} y1={y + 13} x2={x + 15 + k * 15} y2={130}
                stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.7}/>
            ))}
          </g>
        ))}
        <text x="55" y="155" textAnchor="middle" fill="#f59e0b" fontSize={8}>TSVs + μ-bumps</text>
        <text x="425" y="155" textAnchor="middle" fill="#f59e0b" fontSize={8}>TSVs + μ-bumps</text>
        {/* BGA balls */}
        {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460].map(x => (
          <circle key={x} cx={x} cy={167} r={5} fill="#334155" stroke="#475569" strokeWidth={1}/>
        ))}
        <text x="250" y="118" textAnchor="middle" fill="#64748b" fontSize={8}>Bump connections to interposer</text>
      </svg>
      <p className="text-xs text-dram-muted mt-3">
        The GPU die and HBM stacks are co-packaged on a silicon interposer that provides
        high-density routing (2–5 µm line/space) between them. The interposer itself connects
        to the PCB via standard BGA solder balls. This is "2.5D" because the dies are side-by-side
        on the interposer, not stacked directly on top of each other.
      </p>
    </div>
  )
}

function TSVExplainer() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">Through-Silicon Via (TSV) — key dimensions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {[
          { label: 'Diameter', value: '5–10 µm', note: 'Etched by Bosch DRIE' },
          { label: 'Depth', value: '30–50 µm', note: 'Through thinned die' },
          { label: 'Pitch', value: '40–60 µm', note: 'Center-to-center' },
          { label: 'Count/stack', value: '~40,000', note: 'HBM3 per-stack estimate' },
        ].map((item) => (
          <div key={item.label} className="bg-dram-bg rounded-lg p-3 text-center">
            <div className="text-xs text-dram-muted">{item.label}</div>
            <div className="text-dram-amber font-bold font-mono text-sm mt-1">{item.value}</div>
            <div className="text-xs text-dram-muted mt-1">{item.note}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted">
        TSVs enable a 1024-bit bus width between DRAM dies within the stack — physically impossible
        with solder bumps on a PCB. The short distance (µm vs cm) also means TSV interconnects
        have ~100× lower capacitance than PCB traces, requiring far less power per bit transferred.
      </p>
    </div>
  )
}

function MicrobumpVsHybridBonding() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">Microbump vs Hybrid Bonding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: 'Microbumps (HBM1–HBM3E)',
            pitch: '~55 µm pitch',
            color: '#f59e0b',
            desc: 'Tiny solder balls connect the DRAM dies to the logic base die. The bump size limits how densely connections can be placed. At 55 µm pitch, a 1024-bit bus requires ~1 mm² of bump area.',
            pros: 'Proven in volume production, reworkable',
            cons: 'Limits pitch → limits bandwidth density',
          },
          {
            name: 'Hybrid Bonding (HBM4+)',
            pitch: '~1–10 µm pitch',
            color: '#22c55e',
            desc: 'Copper pads on adjacent dies bond directly metal-to-metal without solder. Die faces are polished to atomic flatness, then bonded under heat and pressure. 10–50× denser than microbumps.',
            pros: 'Massive density improvement, lower resistance, lower inductance',
            cons: 'Requires extreme surface preparation, harder to yield at volume',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="text-xs font-mono text-dram-muted mb-2">{item.pitch}</div>
            <div className="text-xs text-dram-muted mb-2">{item.desc}</div>
            <div className="text-xs text-dram-green"><strong className="text-dram-text">Pro:</strong> {item.pros}</div>
            <div className="text-xs text-dram-amber mt-1"><strong className="text-dram-text">Con:</strong> {item.cons}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function L10() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 10</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">HBM &amp; 3D DRAM</h1>
        <p className="text-dram-muted mt-2">Stacking dies vertically to achieve terabyte-per-second bandwidth</p>
      </div>

      <HBMStackViz />

      <h2>Why HBM Exists: The Pin-Count Wall</h2>
      <p>
        GDDR6 at up to 512 GB/s uses 8 chips each with a 32-bit bus — 256 data pins total,
        running at 16 Gbps. To double that bandwidth, you could double pin count (more chips on
        a wider bus) or double speed (harder signal integrity). Both hit limits quickly: PCB routing space
        runs out, and at very high speeds, signal integrity on PCB traces requires expensive
        equalization and tight impedance control.
      </p>
      <p>
        HBM sidesteps this by moving the memory dies <em>above</em> (or beside) the logic die,
        connected by a 1024-bit internal bus through <strong>Through-Silicon Vias (TSVs)</strong>
        — copper-filled holes etched through the silicon itself. At 1024-bit width and 6.4 Gbps/pin,
        HBM3 achieves 819 GB/s per stack with far fewer external PCB connections than any
        equivalent GDDR configuration.
      </p>

      <h2>HBM Generations</h2>
      <HBMGenerationTable />

      <h2>Through-Silicon Vias (TSVs)</h2>
      <TSVExplainer />

      <p>
        TSV fabrication requires thinning the DRAM die (standard is 700 µm; HBM dies are ground
        to 30–50 µm), etching holes with deep reactive-ion etching (DRIE), depositing insulating
        liner, and filling with copper. The entire stack assembly is done in a wafer-level process
        before individual chips are cut.
      </p>

      <h2>The 2.5D Package: GPU + HBM on Interposer</h2>
      <PackageDiagram />

      <p>
        The silicon interposer is a passive chip (no transistors, just wiring) made using standard
        CMOS lithography at 300 mm wafer scale. It can have 4–8 metal routing layers with 2–5 µm
        line/space — 10× finer than a PCB's 50–100 µm. This enables thousands of signals to route
        between the GPU die and each HBM stack over short distances without signal integrity issues.
      </p>
      <p>
        The cost of the silicon interposer is significant (it's a large piece of prime silicon),
        which is why HBM packages are far more expensive than GDDR6. An H100 GPU module with 5
        HBM3 stacks costs ~$30,000 at launch — GDDR6 GPU cards with similar memory bandwidth cost
        ~$500–$1,500.
      </p>

      <h2>Microbumps and Hybrid Bonding</h2>
      <MicrobumpVsHybridBonding />

      <h2>Processing-In-Memory (PIM)</h2>
      <p>
        Moving data from memory to the processor is expensive — memory bandwidth is limited and
        each data transfer consumes energy. <strong>PIM</strong> adds compute elements directly
        inside the HBM stack, processing data where it lives.
      </p>
      <ul>
        <li><strong>SK Hynix AiM (Accelerator-in-Memory)</strong>: adds SIMD multiply-accumulate
            units to the HBM logic base die. Used in Samsung's Flashbolt and SK Hynix's own
            AI server products. Achieves ~1 TOPS of MAC throughput within the stack, avoiding
            the memory bus entirely for convolution-heavy ML kernels.</li>
        <li><strong>Samsung HBM-PIM</strong>: adds programmable FP16 compute
            in the sense-amp region of each bank. Each die has dedicated PIM execution engines
            accessible via new JEDEC-defined commands.</li>
        <li><strong>UPMEM</strong>: a non-HBM approach — a DIMM-based design with a 24-core
            RISC processor per DRAM chip. Effective for database scans and genome sequencing
            where the access pattern matches the parallel structure.</li>
      </ul>
      <p>
        PIM is challenging because it forces a new programming model: the programmer must be
        aware of which data is in which physical bank and schedule PIM operations accordingly.
        It works best for embarrassingly parallel, memory-bound kernels with simple arithmetic.
      </p>

      <h2>HBM4 and Beyond</h2>
      <p>
        HBM4 (planned 2025–2026) doubles the bus width to 2048 bits per stack by adopting
        <strong>hybrid bonding</strong> at 1–10 µm pitch (replacing 55 µm microbumps). At
        ~9.6 Gbps/pin, bandwidth per stack exceeds 2 TB/s. Capacity target is 64–128 GB
        per stack with a 16-die + logic-base assembly.
      </p>
      <p>
        SK Hynix has also announced an option to fabricate the HBM4 logic base die on an advanced
        TSMC node (3nm class) rather than their own DRAM node, enabling the base die to contain
        a more sophisticated memory controller with built-in machine learning acceleration —
        blurring the line between compute and memory further.
      </p>

      <LessonNav lessonId={10} onComplete={() => markComplete(10)} />
    </div>
  )
}
