import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import DRAMArraySim from '../visualizations/DRAMArraySim'

function BitlineTopologyDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Folded vs Open Bitline Architecture
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open bitline */}
        <div>
          <div className="text-xs font-mono text-dram-amber mb-3 text-center">Open Bitline (older, simpler)</div>
          <svg width="100%" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet">
            {/* Cells left of SA */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={10} y={20 + i*40} width={22} height={18} rx={3} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1}/>
                <text x={21} y={32+i*40} textAnchor="middle" fill="#3b82f6" fontSize={8}>C{i}</text>
                <line x1={32} y1={29+i*40} x2={85} y2={80} stroke="#3b82f6" strokeWidth={1} opacity={0.5}/>
              </g>
            ))}
            {/* Cells right of SA */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={168} y={20 + i*40} width={22} height={18} rx={3} fill="#163820" stroke="#22c55e" strokeWidth={1}/>
                <text x={179} y={32+i*40} textAnchor="middle" fill="#22c55e" fontSize={8}>C{i}</text>
                <line x1={168} y1={29+i*40} x2={115} y2={80} stroke="#22c55e" strokeWidth={1} opacity={0.5}/>
              </g>
            ))}
            {/* SA */}
            <rect x={80} y={68} width={40} height={24} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5}/>
            <text x={100} y={83} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">SA</text>
            {/* BL and BLB labels */}
            <text x={55} y={65} fill="#3b82f6" fontSize={8}>BL</text>
            <text x={130} y={65} fill="#22c55e" fontSize={8}>BLB</text>
            {/* Noise note */}
            <text x={100} y={130} textAnchor="middle" fill="#ef4444" fontSize={8}>Cells from two different</text>
            <text x={100} y={142} textAnchor="middle" fill="#ef4444" fontSize={8}>rows → noise mismatch</text>
          </svg>
        </div>
        {/* Folded bitline */}
        <div>
          <div className="text-xs font-mono text-dram-green mb-3 text-center">Folded Bitline (modern standard)</div>
          <svg width="100%" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet">
            {/* BL cells */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={10} y={15 + i*35} width={22} height={18} rx={3} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1}/>
                <text x={21} y={27+i*35} textAnchor="middle" fill="#3b82f6" fontSize={8}>R{i*2}</text>
                <line x1={32} y1={24+i*35} x2={80} y2={90} stroke="#3b82f6" strokeWidth={1} opacity={0.6}/>
              </g>
            ))}
            {/* BLB cells - same side, alternate rows */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={40} y={22 + i*35} width={22} height={18} rx={3} fill="#163820" stroke="#22c55e" strokeWidth={1}/>
                <text x={51} y={34+i*35} textAnchor="middle" fill="#22c55e" fontSize={8}>R{i*2+1}</text>
                <line x1={62} y1={31+i*35} x2={120} y2={90} stroke="#22c55e" strokeWidth={1} opacity={0.6}/>
              </g>
            ))}
            {/* SA */}
            <rect x={80} y={80} width={60} height={24} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5}/>
            <text x={110} y={95} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">SA</text>
            <text x={90} y={115} fill="#3b82f6" fontSize={8}>BL</text>
            <text x={120} y={115} fill="#22c55e" fontSize={8}>BLB</text>
            <text x={110} y={140} textAnchor="middle" fill="#22c55e" fontSize={8}>Same subarray → symmetric</text>
            <text x={110} y={152} textAnchor="middle" fill="#22c55e" fontSize={8}>noise on BL and BLB</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-dram-muted mt-3">
        In the folded design, BL and BLB both come from cells in the same physical subarray, so any
        noise that couples onto BL couples equally onto BLB — the SA cancels it. Open bitline has no
        such symmetry. All modern DRAM uses folded bitlines.
      </p>
    </div>
  )
}

function AddressMultiplexDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        Address Multiplexing — RAS and CAS share the same pins
      </h3>
      <div className="flex flex-col gap-2 font-mono text-xs">
        {[
          { phase: 'RAS↓', pins: 'A[0:15]', color: '#f59e0b', label: 'Row address captured', note: 'tRCD wait' },
          { phase: 'CAS↓', pins: 'A[0:10]', color: '#3b82f6', label: 'Column address captured', note: '+ burst start' },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: r.color + '11', border: `1px solid ${r.color}33` }}>
            <span className="font-bold w-14 text-center" style={{ color: r.color }}>{r.phase}</span>
            <span className="text-dram-muted w-20">{r.pins}</span>
            <span className="text-dram-text flex-1">{r.label}</span>
            <span className="text-dram-muted text-right">{r.note}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        The same 16 address pins carry the row address on the RAS strobe, then the column address on
        the CAS strobe. This halves the pin count vs a full address bus, at the cost of requiring
        two separate bus cycles to fully address a cell.
      </p>
    </div>
  )
}

export default function L04() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 04</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DRAM Array Organization</h1>
        <p className="text-dram-muted mt-2">How billions of 1T1C cells are organized into a fast, addressable array</p>
      </div>

      <DRAMArraySim />

      <h2>From One Cell to a 2D Array</h2>
      <p>
        A single 1T1C cell stores one bit. Stack enough of them in a grid and you have memory.
        The grid has two axes: <strong>rows</strong> (wordlines, horizontal) and <strong>columns</strong>
        (bitlines, vertical). Every cell sits at exactly one row–column intersection. To address any
        specific bit you raise one wordline (selects the row) and then activate one column path
        (selects the column).
      </p>
      <p>
        A typical DDR4 chip (e.g., 8 Gb x8) has <strong>65,536 rows × 8,192 columns</strong> per
        bank, giving 512 Mb per bank. With 16 banks, that's <strong>8 Gb</strong> per chip. A
        16 GB DDR4 DIMM uses eight such chips per rank on a 64-bit-wide bus (each x8 chip
        contributing 8 bits), with two ranks totaling 16 GB — plus one extra chip per rank for ECC.
      </p>

      <h2>Wordlines and Bitlines</h2>
      <p>
        <strong>Wordlines</strong> run horizontally through the array. Each wordline connects to
        the gate of every transistor in its row — typically 1,024 transistors in parallel. Raising
        a wordline turns on all those transistors simultaneously, exposing every cell in that row
        to its corresponding bitline. This operation is called <strong>row activation</strong> or
        "opening a row."
      </p>
      <p>
        <strong>Bitlines</strong> run vertically. Each bitline connects to the drain of every
        transistor in its column — all the cells in that column share a single bitline. Because
        the bitline touches hundreds of cells, its total parasitic capacitance (Cbl ≈ 100–300 fF)
        is much larger than the storage capacitor of any single cell (Cs ≈ 15–25 fF). This ratio
        is what forces the sense amplifier to detect very tiny voltage shifts.
      </p>

      <h2>Sense Amplifiers and the Sense Amp Zone</h2>
      <p>
        At the bottom (or top, depending on the layout) of each bitline sits a <strong>sense
        amplifier (SA)</strong>. Its job: detect whether the bitline moved slightly above or below
        Vdd/2 after a row was activated, then amplify that difference to a full rail-to-rail swing.
        The SA is a cross-coupled inverter latch — it resolves in 1–2 ns once the bitline has
        settled to its charge-sharing equilibrium.
      </p>
      <p>
        Sense amps consume significant area (roughly 2–3 µm wide per SA at 20 nm nodes). To
        minimize wasted silicon, the array is divided into <strong>subarrays</strong>, and sense
        amps are shared between adjacent subarrays via a shared sense-amp zone. A typical chip has
        256–512 subarrays, each about 256 rows × 512 columns, with a SA zone between every pair.
      </p>

      <h2>Folded vs. Open Bitline Architecture</h2>
      <p>
        The way BL and BLB connect to the SA determines how well it rejects noise:
      </p>

      <BitlineTopologyDiagram />

      <p>
        In the <strong>open bitline</strong> topology (older, DDR1-era), BL comes from cells in
        one subarray and BLB comes from cells in a different adjacent subarray. Any noise that
        couples differently to the two sides (e.g., from wordline crosstalk) looks like a real
        signal to the SA.
      </p>
      <p>
        In the <strong>folded bitline</strong> topology (used in all modern DRAM), BL and BLB
        both come from the same subarray, with cells at alternating pitches — even rows connect
        to BL, odd rows connect to BLB. Noise that couples into the subarray hits BL and BLB
        equally, so the SA sees zero differential noise. This common-mode rejection is why folded
        bitline dominates.
      </p>
      <p>
        Downside of folded bitline: the cell density is effectively halved per bitline (only
        every other row connects to BL, the rest to BLB). Designs compensate with tighter cell
        pitches and half-pitch wordlines.
      </p>

      <h2>Row and Column Decoders</h2>
      <p>
        The row decoder receives a row address (typically 15–16 bits) and asserts exactly one
        wordline. Internally it uses a <strong>NAND-based decode tree</strong>: the address is
        split into segments that are pre-decoded (generating partial select signals), then the
        partial signals are combined in a final NAND gate per wordline. This reduces the fan-in
        of each gate while keeping decoding fast (&lt; 5 ns for the full decode path).
      </p>
      <p>
        The <strong>column decoder</strong> (also called the CAS mux or IO gating) selects
        which bitlines in the open row get connected to the DQ output bus. For a BL8 burst
        (burst of 8 consecutive columns), it activates 8 × (bus width) bitlines in sequence
        during the burst.
      </p>

      <h2>Address Multiplexing</h2>
      <p>
        DRAM chips share their address pins between the row address and the column address —
        this is address multiplexing. The row address is presented first (latched on the RAS
        strobe), then the column address is presented on the same pins (latched on the CAS
        strobe). This halves the required pin count compared to a full parallel address bus,
        significantly reducing package cost.
      </p>

      <AddressMultiplexDiagram />

      <p>
        Modern DDR uses a <strong>command/address (CA) bus</strong> that encodes commands
        (ACT, READ, WRITE, PRE, REF) as bit patterns on the address pins, removing the physical
        RAS/CAS strobe pins. The semantics remain the same: the row address and column address
        arrive as separate bus transactions separated by tRCD.
      </p>

      <h2>Banks: Independent Sub-Arrays</h2>
      <p>
        A single array can only serve one row at a time — activating a second row in the same
        bank requires first closing (precharging) the first row. To allow pipelining of memory
        requests, modern DRAM chips are divided into <strong>banks</strong>: physically separate
        arrays with their own row decoders, sense amps, and open-row register.
      </p>
      <ul>
        <li>DDR3: 8 banks per chip</li>
        <li>DDR4: 16 banks (4 bank groups × 4 banks per group). Bank groups have their own
            internal data path, allowing back-to-back column accesses to different bank groups
            with only tCCD_S = 4 cycles minimum, vs tCCD_L = 5–8 cycles within a group.</li>
        <li>DDR5: 32 banks (8 bank groups × 4 banks per group, per subchannel)</li>
      </ul>
      <p>
        While bank A is waiting through tRAS (row must stay open for minimum time), the memory
        controller can activate a row in bank B, issue the CAS, and get data — hiding the latency
        of bank A behind useful work in bank B. This is <strong>bank-level parallelism</strong>
        and is the primary technique memory controllers use to maximize throughput.
      </p>

      <LessonNav lessonId={4} onComplete={() => markComplete(4)} />
    </div>
  )
}
