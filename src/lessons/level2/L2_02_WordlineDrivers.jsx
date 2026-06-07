import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import WordlineViz from '../../visualizations/level2/WordlineViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_02() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 02 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Wordline & Bitline Drivers</h1>
        <p className="text-dram-muted mt-2">Voltage boosting, bitline precharge, negative wordline, and cell disturb</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 3 (The DRAM Cell) and Module 5
        (Read Operation), the wordline was treated as a simple on/off signal. Here we examine why the wordline
        must swing <em>above</em> Vdd, and why it must swing <em>below</em> GND during standby.
      </div>

      <WordlineViz />

      <h2>Why Vpp &gt; Vdd is Required</h2>
      <p>
        The cell access transistor is an NMOS device. To fully charge the storage capacitor to Vdd (writing
        a '1'), the gate voltage must exceed Vdd + Vth:
      </p>
      <p>
        <code>V_WL ≥ V_dd + V_th(body)</code>
      </p>
      <p>
        With Vdd = 1.2 V and an NMOS threshold of ~0.5 V (including body effect), the wordline must reach
        at least 1.7 V. In practice, designs use <strong>Vpp = 2.5–3.0 V</strong> to provide margin and
        account for process variation. Vpp is generated on-chip by a <strong>charge pump</strong> that
        bootstraps Vdd up to higher voltages.
      </p>
      <p>
        At sub-20 nm nodes, NMOS thresholds drop toward 0.3 V, reducing the required Vpp, but short-channel
        effects and DIBL (drain-induced barrier lowering) introduce new design constraints.
      </p>

      <h2>Bitline Precharge and Equalization</h2>
      <p>
        Before every access, the bitline pair (BL and BLB) must be driven to Vdd/2. This is done by a
        <strong> precharge / equalization circuit</strong> consisting of three NMOS transistors:
      </p>
      <ul>
        <li>One NMOS connects BL to Vdd/2</li>
        <li>One NMOS connects BLB to Vdd/2</li>
        <li>One NMOS connects BL directly to BLB (equalization)</li>
      </ul>
      <p>
        The equalization transistor is critical: it forces BL = BLB regardless of any residual voltage
        mismatch from the previous cycle, removing kickback noise that could cause wrong sensing.
      </p>

      <h2>Negative Wordline (nWL)</h2>
      <p>
        During standby (wordline at rest), the ideal situation would be V_GS = −∞ to completely cut off the
        NMOS transistor and eliminate subthreshold leakage. In practice, modern DRAMs apply a
        <strong> negative wordline voltage nWL ≈ −0.5 V to −0.7 V</strong> during standby.
      </p>
      <p>
        The effect: with V_G = −0.5 V and V_S ≈ 0 V, V_GS = −0.5 V (gate is 0.5 V below source), the NMOS is deeper in cutoff, increasing
        the effective threshold via the body effect and reducing subthreshold leakage current by a factor of
        ~10×. This directly extends cell retention time — critical for achieving the 64 ms JEDEC spec at 85°C.
      </p>

      <h2>Cell Disturb During Half-Select</h2>
      <p>
        In an array, every row shares a wordline, and every column shares a bitline. When row A is activated,
        all cells in row A are read/restored. But the column circuitry only selects one cell — the others
        experience <strong>read disturb</strong>: their charge is partially shared and then restored.
      </p>
      <p>
        The disturb is small per access but accumulates. For cells that are not in the activated row
        (half-selected), the wordline stays low and the bitline may wiggle slightly due to coupling — this
        is <strong>bitline disturb</strong>. Negative wordline mitigates this by keeping unselected wordlines
        firmly off.
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>Signal</div><div>Active level</div><div>Standby level</div>
        </div>
        {[
          ['Wordline (WL)', 'Vpp = 2.5–3.0 V', 'nWL = −0.5 to −0.7 V'],
          ['Bitline (BL/BLB)', 'Vdd (1) or GND (0)', 'Vdd/2 (precharged)'],
          ['SA enable (SAP)', 'GND (latch fires)', 'Vdd/2 (floating)'],
          ['SA enable (SAN)', 'Vdd (latch fires)', 'Vdd/2 (floating)'],
        ].map(([sig, act, std]) => (
          <div key={sig} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-text font-mono">{sig}</div>
            <div className="text-dram-green">{act}</div>
            <div className="text-dram-muted">{std}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={2} onComplete={() => markComplete(2)} lessons={lessonsL2} />
    </div>
  )
}
