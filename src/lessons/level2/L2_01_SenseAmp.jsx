import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import SenseAmpSim from '../../visualizations/level2/SenseAmpSim'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_01() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 01 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Sense Amplifier Design</h1>
        <p className="text-dram-muted mt-2">Cross-coupled inverter latch, charge-sharing ΔV, and noise margin</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 4 (Array Organization) you learned
        that sense amplifiers detect the tiny voltage swing left on the bitline after a cell is connected. Here we
        go inside the SA: how many transistors it uses, what makes it reliable, and how to quantify its noise margin.
      </div>

      <SenseAmpSim />

      <h2>The Charge-Sharing Problem</h2>
      <p>
        A DRAM cell stores charge on a capacitor Cs ≈ 10–30 fF. The bitline has parasitic capacitance
        Cbl ≈ 100–400 fF — typically 10–20× larger than the cell capacitor. When the wordline opens the
        access transistor, charge redistributes between Cs and Cbl until equilibrium:
      </p>
      <p>
        <code>V_BL = (Cs × V_cell + Cbl × Vdd/2) / (Cs + Cbl)</code>
      </p>
      <p>
        The bitline was precharged to Vdd/2, so the signal swing is:
      </p>
      <p>
        <code>ΔV = V_BL − Vdd/2 = Cs / (Cs + Cbl) × (V_cell − Vdd/2)</code>
      </p>
      <p>
        For a fully charged cell (V_cell = Vdd) and typical values (Cs = 20 fF, Cbl = 200 fF, Vdd = 1.2 V):
      </p>
      <p>
        <code>ΔV = (20 / 220) × 0.6 V ≈ 55 mV</code>
      </p>
      <p>
        This 55 mV must be reliably amplified from noise to full Vdd/GND — that is the sense amplifier's job.
      </p>

      <h2>The Cross-Coupled Latch</h2>
      <p>
        A DRAM sense amplifier is a <strong>cross-coupled inverter latch</strong> — two CMOS inverters whose
        input and output are swapped:
      </p>
      <ul>
        <li>M3 (PMOS) + M1 (NMOS) form inverter 1: input = BLB, output = BL</li>
        <li>M4 (PMOS) + M2 (NMOS) form inverter 2: input = BL, output = BLB</li>
      </ul>
      <p>
        The latch is activated by two enable signals: <strong>SAP</strong> (SA enable P) connects the PMOS
        sources to Vdd, and <strong>SAN</strong> (SA enable N) connects the NMOS sources to GND. Before SA
        fires, both enables are at Vdd/2 — the latch is "floating" and the bitlines sit at the charge-sharing
        equilibrium.
      </p>
      <p>
        When SAP/SAN fire simultaneously, both inverters see their supplies connected. The side with the
        slightly higher voltage (BL = Vdd/2 + ΔV) pulls toward Vdd via positive feedback; the lower side
        (BLB = Vdd/2) is pulled toward GND. The latch resolves in 1–2 ns.
      </p>

      <h2>Noise Margin and Offset</h2>
      <p>
        The minimum detectable ΔV is not zero — transistor mismatch between M1/M2 and M3/M4 creates an
        effective input offset voltage V_os ≈ 5–20 mV. If ΔV &lt; V_os, the latch may resolve in the wrong
        direction, reading a flipped bit.
      </p>
      <p>
        <strong>Auto-zero offset cancellation:</strong> Modern DRAMs add a "dummy cell" connected to BLB
        whose stored charge is exactly half-Vdd, providing a clean reference voltage. A more advanced
        technique samples and cancels the latch offset before each sense cycle (auto-zero), allowing
        operation with ΔV as small as 20–30 mV.
      </p>

      <h2>SA Firing Sequence</h2>
      <ol>
        <li>Precharge: both BL and BLB driven to Vdd/2 via equalization transistor</li>
        <li>Equalization off: BL and BLB float</li>
        <li>Wordline rises: cell connects to BL, charge sharing occurs (ΔV ≈ 55 mV)</li>
        <li>SA enable (SAP falls, SAN rises): latch fires and regenerates BL → Vdd, BLB → 0</li>
        <li>Column select: the appropriate bit is read out to the data bus</li>
        <li>Restore: BL stays at Vdd, wordline stays high — cell capacitor recharges to Vdd</li>
        <li>Precharge: wordline falls, equalization restores BL = BLB = Vdd/2 for next access</li>
      </ol>

      <div className="rounded-lg p-4 bg-dram-bg border border-dram-border text-xs font-mono space-y-1 my-4">
        <div className="text-dram-blue">// Sense amp timing budget</div>
        <div>tRCD = 16 ns  // wordline to SA fire (charge sharing settles)</div>
        <div>tCL  = 16 ns  // SA fired to data valid on DQ pin</div>
        <div>tWR  = 15 ns  // write recovery (cell recharge before precharge)</div>
      </div>

      <LessonNav lessonId={1} onComplete={() => markComplete(1)} lessons={lessonsL2} />
    </div>
  )
}
