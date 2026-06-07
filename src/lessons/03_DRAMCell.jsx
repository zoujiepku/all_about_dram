import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import DRAMCellViz from '../visualizations/DRAMCellViz'
import DRAMCellWalkthrough from '../visualizations/DRAMCellWalkthrough'

export default function L03() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 03</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">The DRAM Cell (1T1C)</h1>
        <p className="text-dram-muted mt-2">One transistor + one capacitor — how reading, writing, and refreshing actually work</p>
      </div>

      <DRAMCellViz />

      <h2>Structure of the 1T1C Cell</h2>
      <p>
        Every bit in a DRAM chip lives in a <strong>1T1C cell</strong>: one NMOS transistor and one
        capacitor. Three wires connect to it:
      </p>
      <ul>
        <li><strong>Wordline (WL)</strong> — connects to the transistor's gate. When WL is high, the transistor turns ON and connects the capacitor to the bitline. When WL is low, the transistor is OFF and the capacitor is isolated.</li>
        <li><strong>Bitline (BL)</strong> — the column data wire. It carries data in and out of the cell and is shared by all cells in the same column.</li>
        <li><strong>Storage capacitor (Cs)</strong> — about 20 femtofarads (fF). One plate connects to the transistor's drain; the other plate is held at Vdd/2 = 0.6 V as a reference.</li>
      </ul>
      <p>
        Logic <strong>1</strong> = capacitor charged to ~Vdd (1.2 V). Logic <strong>0</strong> = capacitor discharged to ~0 V.
        The bitline has a much larger parasitic capacitance (Cbl ≈ 200 fF) because it connects to
        hundreds of cells, metal wires, and the sense amplifier. This 10:1 capacitance ratio (Cbl/Cs)
        is the root cause of almost everything unusual about DRAM operation.
      </p>

      <h2>Step-by-Step Walkthrough</h2>
      <p>
        Use the interactive diagram below to walk through each operation one step at a time.
        The circuit diagram updates live — watch the voltages, the transistor state, and the
        charge flow arrow as you click through each phase.
      </p>

      <DRAMCellWalkthrough />

      <h2>How Reading Works — in Detail</h2>

      <h3>Step 1: Precharge</h3>
      <p>
        Before any access, the bitline is <strong>precharged to exactly Vdd/2 = 0.6 V</strong> by a
        precharge circuit sitting above the cell array. A dedicated equalization transistor shorts BL
        and BLB (the complementary bitline) together briefly, forcing both to Vdd/2. WL stays low, so
        the cell capacitor is isolated and its charge is undisturbed.
      </p>
      <p>
        Why Vdd/2? Because the sense amplifier works by detecting a <em>difference</em> from this
        midpoint. Precharging to the exact midpoint maximizes symmetry and noise immunity.
      </p>

      <h3>Step 2: Wordline Rises</h3>
      <p>
        The row decoder asserts the wordline. The voltage must be <strong>boosted above Vdd</strong>
        (typically Vpp ≈ 2.5–3 V) because an NMOS transistor only fully turns on when its gate
        voltage exceeds its source voltage by at least one threshold voltage (Vth ≈ 0.5 V). If WL
        were only Vdd = 1.2 V, the transistor would turn off once the capacitor charged to
        Vdd − Vth ≈ 0.7 V, preventing full charge transfer. With Vpp, the transistor stays fully on.
      </p>

      <h3>Step 3: Charge Sharing — the tiny ΔV</h3>
      <p>
        Once the transistor opens, the cell capacitor and the bitline capacitance form a single
        connected node. Charge redistributes until they reach the same equilibrium voltage:
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>V_eq = (Cs × V_cap + Cbl × Vdd/2) / (Cs + Cbl)</div>
        <div className="text-dram-muted mt-2">For stored '1': (20fF × 1.2V + 200fF × 0.6V) / 220fF ≈ 0.6545 V</div>
        <div className="text-dram-muted">For stored '0': (20fF × 0.0V + 200fF × 0.6V) / 220fF ≈ 0.5455 V</div>
      </div>
      <p>
        The bitline moves by only <strong>ΔV ≈ ±55 mV</strong> from Vdd/2. That's less than 5% of the
        supply voltage — barely a whisper. The sense amplifier must reliably detect this tiny signal
        in the presence of thermal noise, process variation, and interference from neighboring cells.
      </p>

      <h3>Step 4: Sense Amplifier Fires</h3>
      <p>
        The sense amplifier is a <strong>cross-coupled inverter latch</strong>. It connects BL and
        BLB to a pair of back-to-back inverters. When activated, it acts like a flip-flop: whichever
        side is slightly higher gets driven to Vdd; the other gets pulled to GND.
      </p>
      <p>
        The SA takes 1–2 nanoseconds to resolve, amplifying ΔV ≈ 55 mV all the way to a full 1.2 V
        swing. It must activate only after the bitline has settled to V_eq — activating too early
        means detecting noise instead of signal. The minimum detectable ΔV is about 20 mV.
      </p>

      <h3>Step 5: Restore (Write-Back)</h3>
      <p>
        After the SA fires, BL is now being driven to either Vdd (for '1') or GND (for '0'). The
        wordline is <em>still high</em>, so this full-rail voltage drives back through the transistor
        into the cell capacitor, restoring it to its original charge. This is the write-back that
        makes the destructive read self-healing.
      </p>
      <p>
        The restore phase takes about 15 ns (tWR — write recovery time). The wordline cannot go low
        until the capacitor has had enough time to fully recharge.
      </p>

      <h3>Step 6: Precharge Again</h3>
      <p>
        WL goes low, the transistor turns off, and the bitline is precharged back to Vdd/2 — ready
        for the next access. The total read cycle time (tRC) includes all these phases and is
        typically 45–55 ns for DDR5.
      </p>

      <h2>How Writing Works — in Detail</h2>
      <p>
        Writing is actually simpler than reading, but the setup is different in one key way: the
        bitline is <strong>not floating</strong>. The write driver actively forces BL to the desired
        voltage (Vdd for '1', GND for '0') before and during the wordline pulse.
      </p>
      <ol>
        <li><strong>Precharge BL to Vdd/2</strong> — same as before any access.</li>
        <li><strong>Write driver overrides BL</strong> — the controller forces BL to Vdd (write '1')
            or GND (write '0'). Unlike a read, the bitline is actively driven — it's not left floating
            to passively absorb whatever charge the capacitor shares.</li>
        <li><strong>WL rises</strong> — with BL being held at the target voltage, the capacitor
            charges (or discharges) through the transistor to match BL. Because BL is driven, this
            happens quickly and completely.</li>
        <li><strong>WL falls after tWR</strong> — after at least tWR = 15 ns to allow full charge
            transfer, the wordline drops, isolating the capacitor with its new charge.</li>
      </ol>
      <p>
        The critical difference: in a read, BL is floating and the cell capacitor moves BL. In a
        write, BL is driven and it moves the cell capacitor. Direction reverses; charge source switches.
      </p>

      <h2>How Refresh Works — in Detail</h2>

      <h3>Why Refresh Is Necessary</h3>
      <p>
        The cell transistor is not a perfect switch. In its off state, a tiny subthreshold leakage
        current (~100–200 fA, femtoamperes) still flows. Over time, this drains charge from the capacitor. At room
        temperature (~25°C), a fully charged cell leaks enough to flip polarity in roughly
        <strong>64 milliseconds</strong>. That's the retention time budget — every row must be
        refreshed within this window.
      </p>
      <p>
        Temperature makes things dramatically worse: retention time halves for every ~10°C increase.
        At 85°C (typical worst-case junction temperature), retention drops to about 4 ms — which is
        why some server DRAMs use a faster 32 ms refresh interval under high load.
      </p>

      <h3>The Refresh Sequence</h3>
      <p>
        A refresh is electrically <strong>identical to a read — with no column select</strong>. The
        memory controller (or an internal refresh counter in self-refresh mode) asserts a REF command.
        The DRAM's internal row counter selects the next row to refresh, the wordline rises, charge
        sharing occurs on every bitline in that row simultaneously, the sense amplifiers fire and
        restore all cells, and then the wordline drops and all bitlines precharge.
      </p>
      <p>
        No data is sent out — there's no column select, no data bus activity. The refresh is entirely
        internal. Each refresh command restores one full row (typically 1,024–2,048 cells in parallel).
      </p>

      <h3>Refresh Math</h3>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>Rows to refresh: 8,192 (typical DDR4/5)</div>
        <div>Retention limit: 64 ms</div>
        <div>Required refresh interval: tREFI = 64 ms ÷ 8,192 = 7.8 µs</div>
        <div className="text-dram-muted mt-2">≈ one refresh command every 7,800 ns</div>
        <div className="text-dram-muted">Each refresh takes ~75 ns (tRFC)</div>
        <div className="text-dram-muted">Refresh overhead ≈ 75/7800 ≈ 1% of bandwidth</div>
      </div>
      <p>
        1% overhead sounds small, but it's unavoidable — you cannot serve a memory request during
        the ~75 ns that the array is occupied by a refresh. As DRAM density grows (more rows),
        tRFC grows and the overhead increases. DDR5 introduced <strong>per-bank refresh</strong>
        to allow other banks to serve requests while one bank refreshes.
      </p>

      <h2>Why 1T1C and Not Something Simpler?</h2>
      <p>
        SRAM uses 6 transistors per bit: two cross-coupled inverters (4 transistors) plus two
        access transistors. It's fast, never needs refresh, and reads are non-destructive. But
        at 6T vs 1T+1C, DRAM packs roughly 4–6× more bits per unit area. At the scale of 16 GB
        or 32 GB DIMMs, that density difference is everything. The complexity of refresh and
        destructive reads is a worthwhile engineering trade-off for the density gain.
      </p>

      <LessonNav lessonId={3} onComplete={() => markComplete(3)} />
    </div>
  )
}
