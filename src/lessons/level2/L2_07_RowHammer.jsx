import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import RowHammerSim from '../../visualizations/level2/RowHammerSim'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_07() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 07 · Cluster C: Reliability &amp; Security</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">RowHammer Attack</h1>
        <p className="text-dram-muted mt-2">Charge-pumping mechanism, bit flips at sub-20 nm, TRR bypass, and DDR5 RFM</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 6 (Write &amp; Refresh) you
        learned that DRAM cells leak charge and need periodic refresh. RowHammer is the discovery that
        an attacker can deliberately force bit flips in <em>adjacent</em> rows by hammering a row millions
        of times — without ever touching the victim row's data.
      </div>

      <RowHammerSim />

      <h2>The RowHammer Mechanism</h2>
      <p>
        When a DRAM wordline is activated, the NMOS access transistor briefly turns on with V_GS ≈ Vpp −
        V_cell ≈ 1.5–2 V. At sub-20 nm feature sizes, this creates <strong>hot carriers</strong> — electrons
        with enough energy to penetrate the thin gate oxide of the access transistors in physically adjacent
        rows. This is called <strong>charge pumping</strong>.
      </p>
      <p>
        Each activation injects a tiny charge disturbance (~attofarads) into the neighbor row's storage
        nodes. Over tens of thousands to hundreds of thousands of repeated activations within a single 64 ms
        refresh interval, this accumulated disturbance can flip bits in victim rows.
      </p>
      <p>
        Kim et al. discovered at ISCA 2014 that as few as <strong>139,000 activations</strong> per tREFW
        were sufficient to flip bits in commodity DDR3 DIMMs — orders of magnitude below what manufacturers
        had considered a threat.
      </p>

      <h2>Single-Sided vs. Double-Sided Hammering</h2>
      <p>
        In <strong>single-sided hammering</strong>, one aggressor row is repeatedly activated. The victim
        row (one physical row above or below) accumulates charge from one direction.
      </p>
      <p>
        In <strong>double-sided hammering</strong>, two rows flanking a victim (aggressor row A and aggressor
        row A+2) are alternately hammered. The victim row A+1 receives disturbance from both sides
        simultaneously, requiring roughly half as many activations to flip a bit.
      </p>

      <h2>Exploits and Security Impact</h2>
      <p>
        RowHammer transcends a hardware reliability bug — it becomes a security vulnerability:
      </p>
      <ul>
        <li><strong>Privilege escalation:</strong> Flipping a bit in a page table entry can remap a user page to a privileged physical page.</li>
        <li><strong>Rowhammer.js (2016):</strong> JavaScript-based attack using cache eviction to ensure every access reaches DRAM.</li>
        <li><strong>RAMBleed (2019):</strong> Uses RowHammer to read out secret key material from adjacent rows — exploiting the read-disturb information leak.</li>
        <li><strong>Half-Double (2021):</strong> Google demonstrated that the "victim" row doesn't have to be directly adjacent — charge can leak two rows away through coupled disturbance.</li>
      </ul>

      <h2>Mitigations</h2>
      <p>
        <strong>Target Row Refresh (TRR)</strong> was the first DRAM-side mitigation: count activations per
        row, and issue a refresh to neighbors when a threshold is reached. However, researchers showed TRR
        can be bypassed by scattering hammers across multiple rows, overwhelming the limited tracking
        hardware.
      </p>
      <p>
        <strong>PARA (Probabilistic Adjacent Row Activation):</strong> With probability p, refresh the
        adjacent rows after every row activation. Requires no tracking state but creates bandwidth overhead
        proportional to p.
      </p>
      <p>
        <strong>DDR5 RFM (Refresh Management):</strong> JEDEC mandated RFM in DDR5. The memory controller
        counts activations per DRAM device using a rolling Access Count Register (ACR) and issues explicit
        RFM commands when the count exceeds a threshold (RAAIMT = Rowhammer Activation Interval
        Management Threshold). This is a deterministic, standardized solution unlike TRR.
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>Mitigation</div><div>Effectiveness</div><div>Overhead</div>
        </div>
        {[
          ['TRR (DDR4)', 'Bypassable with multi-row patterns', 'Minimal BW overhead'],
          ['PARA', 'Probabilistic — not guaranteed', 'Proportional to refresh rate p'],
          ['DDR5 RFM', 'Deterministic, standardized', '~1–2% BW at typical workloads'],
          ['ECC + scrubbing', 'Corrects single flips after the fact', 'Scrub adds latency + BW'],
        ].map(([mit, eff, oh]) => (
          <div key={mit} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{mit}</div>
            <div className="text-dram-muted">{eff}</div>
            <div className="text-amber-400">{oh}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={7} onComplete={() => markComplete(7)} lessons={lessonsL2} />
    </div>
  )
}
