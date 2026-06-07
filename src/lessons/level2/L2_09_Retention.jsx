import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import RetentionViz from '../../visualizations/level2/RetentionViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_09() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 09 · Cluster C: Reliability &amp; Security</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Variable Retention &amp; Reliability</h1>
        <p className="text-dram-muted mt-2">VRT cells, Arrhenius temperature model, FIT rate, and retention testing</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 6 (Write &amp; Refresh) you
        learned that DRAM cells must be refreshed every 64 ms. Here we explore why some cells fail sooner
        than others, how temperature accelerates failures, and how manufacturers guarantee reliability over
        a 10-year product lifetime.
      </div>

      <RetentionViz />

      <h2>The Arrhenius Retention Model</h2>
      <p>
        Cell charge retention follows Arrhenius kinetics — the same equation that governs chemical reaction
        rates and semiconductor degradation:
      </p>
      <p>
        <code>τ(T) = τ₀ · exp(Ea / kT)</code>
      </p>
      <p>
        Where τ₀ is a pre-exponential factor, Ea ≈ 0.6–0.8 eV is the activation energy for charge leakage
        (dominated by subthreshold channel leakage through the access transistor), k = 8.617×10⁻⁵ eV/K is Boltzmann's
        constant, and T is absolute temperature in Kelvin.
      </p>
      <p>
        The practical rule of thumb: <strong>retention halves for every 10°C temperature increase</strong>
        (for Ea ≈ 0.65 eV). JEDEC specifies 64 ms at 85°C (the maximum case temperature). At 25°C room
        temperature, typical cells retain charge for seconds to minutes.
      </p>

      <h2>Variable Retention Time (VRT)</h2>
      <p>
        VRT is the most challenging DRAM reliability phenomenon. A small fraction of cells (&lt;10 ppm
        in production DRAMs) exhibit <strong>bimodal retention time</strong>: they randomly switch between
        a long retention state and a short retention state, with state transitions occurring on timescales
        of hours.
      </p>
      <p>
        The physical cause is a single <strong>oxide trap</strong> near the storage node. When the trap is
        occupied (charged), it increases the local electric field and accelerates charge leakage from the
        capacitor. When the trap releases its charge, leakage returns to normal. The trap occupancy is
        stochastic and temperature-activated.
      </p>
      <p>
        VRT cells are particularly insidious because they can pass all reliability screens at test time
        (when they happen to be in the long-retention state) but fail months later in the field.
      </p>

      <h2>Manufacturing Variation</h2>
      <p>
        Retention time varies widely across cells within a die and between dies:
      </p>
      <ul>
        <li><strong>Within-die variation:</strong> Cell capacitor size (Cs) varies ±5–10% due to lithography and etch non-uniformity. Transistor threshold varies ±30 mV due to random dopant fluctuation.</li>
        <li><strong>Die-to-die variation:</strong> Process conditions (oxide thickness, dopant concentrations) vary across the wafer, shifting mean retention by ±20%.</li>
        <li><strong>Lot-to-lot variation:</strong> Tool-to-tool variation and recipe changes cause systematic shifts in the cell population.</li>
      </ul>
      <p>
        The 64 ms specification must be met by the <strong>worst-case cell across all corners</strong>,
        which is why manufacturers test at elevated temperature (typically 85°C or 105°C for stress testing)
        to accelerate failures.
      </p>

      <h2>FIT Rate and System Reliability</h2>
      <p>
        Reliability is quantified in <strong>FIT (Failures in Time)</strong>: the expected number of
        failures per 10^9 device-hours. A typical DRAM has a FIT rate of ~1–10 for hard failures and a
        soft error rate of ~1000 FIT from cosmic ray neutrons (secondary neutrons flip bits in storage nodes).
      </p>
      <p>
        For a server with 256 GB of DRAM (≈ 256×10^9 bytes × 8 bits/byte = ~2×10^12 bits, or ~2×10^6 Mb),
        a soft error rate of 1 FIT/Mb gives ~2×10^6 total FIT — roughly one uncorrected error per
        500 operating hours per server. Across a fleet of 10,000 servers that is ~20 errors per hour
        fleet-wide, demonstrating why ECC and memory scrubbing are non-negotiable in data center deployments.
      </p>

      <h2>Retention Testing Methodology</h2>
      <p>
        DRAM manufacturers use <strong>HTOL (High Temperature Operating Life)</strong> tests at 105°C or
        125°C for thousands of hours to accelerate aging by an Arrhenius factor. A 1000-hour HTOL test at
        105°C is roughly equivalent to 10 years at 55°C (typical memory operating temperature).
      </p>

      <LessonNav lessonId={9} onComplete={() => markComplete(9)} lessons={lessonsL2} />
    </div>
  )
}
