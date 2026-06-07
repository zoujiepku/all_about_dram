import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import FAWViz from '../../visualizations/level2/FAWViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_06() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 06 · Cluster B: System Architecture</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Bank Parallelism &amp; tFAW</h1>
        <p className="text-dram-muted mt-2">Four-activate window constraint, bank groups in DDR4/5, and memory-level parallelism</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 7 (Timing Parameters) you
        saw tRRD (row-to-row delay between bank activations). tFAW is a global constraint layered on top of
        tRRD — it limits how many banks can be opened in a short window regardless of per-bank timing.
      </div>

      <FAWViz />

      <h2>Why Banks and Parallelism Matter</h2>
      <p>
        A modern DDR4 DRAM has <strong>16 banks</strong> (4 bank groups × 4 banks each). Each bank can
        independently perform a RAS-CAS-precharge cycle. Because most operations lock a bank for tRAS
        (~35 ns) before it can be precharged, keeping multiple banks open in a pipeline is essential for
        hiding latency:
      </p>
      <ul>
        <li>Activate bank 0 → while row 0 is open, activate bank 1</li>
        <li>Read column from bank 0 → while data transfers, read bank 1</li>
        <li>Precharge bank 0 → while bank 0 precharges, bank 1 serves more requests</li>
      </ul>
      <p>
        This <strong>memory-level parallelism (MLP)</strong> is the primary throughput mechanism for
        random-access workloads where each request hits a different bank.
      </p>

      <h2>tFAW: The Four-Activate Window</h2>
      <p>
        Row activation draws a large inrush current from the power delivery network (the wordline and sense
        amplifiers charge up simultaneously). If too many banks activate within a short period, the combined
        inrush causes <strong>IR-drop</strong> on Vdd, potentially corrupting sense amp operation.
      </p>
      <p>
        JEDEC solves this with tFAW (Four Activate Window): <em>no more than 4 ACT commands may be issued
        within any rolling time window of duration tFAW</em>. For DDR4-2400:
      </p>
      <p>
        <code>tFAW = 26 ns (at 1200 MHz → ~31 clock cycles)</code>
      </p>
      <p>
        If a fifth activation would violate the window, the controller must stall until the earliest of the
        4 window-covered activations falls outside the window.
      </p>

      <h2>Bank Groups in DDR4/5</h2>
      <p>
        DDR4 introduced <strong>bank groups</strong>: the 16 banks are divided into 4 groups of 4.
        tCCD (CAS-to-CAS delay) is shorter when the two accesses are in <em>different</em> bank groups:
      </p>
      <ul>
        <li><strong>tCCD_L</strong> (same bank group): 5–8 ck — the shared internal IO path inside the group needs longer settling time before another column access</li>
        <li><strong>tCCD_S</strong> (different bank group): 4 ck — each bank group has an independent IO path, so back-to-back accesses across groups can be scheduled more tightly</li>
      </ul>
      <p>
        The mnemonic: <em>L = Long = same group; S = Short = different group</em>. A smart
        scheduler interleaves accesses across all four bank groups to exploit tCCD_S and maximize throughput.
      </p>

      <h2>GPU vs. CPU Access Patterns</h2>
      <p>
        CPUs typically issue 1–4 outstanding memory requests per core (limited by out-of-order window size).
        GPUs issue thousands of concurrent memory requests from thousands of shader threads — naturally
        providing high MLP. This is why GPUs (with GDDR or HBM) are so efficient at memory-intensive
        workloads: they can always keep all banks busy, hiding the tRAS and tRP latencies.
      </p>
      <p>
        CPU memory controllers apply aggressive prefetching and out-of-order scheduling to achieve
        comparable MLP, but with much lower request concurrency.
      </p>

      <div className="rounded-lg p-4 bg-dram-bg text-xs font-mono space-y-1 mt-4">
        <div className="text-dram-blue">// tFAW calculation (DDR4-3200, tck = 0.625 ns)</div>
        <div>tFAW     = 26 ns / 0.625 ns = ~41.6 → rounded to 42 ck</div>
        <div>tRRD_L   = 6 ck  // row-to-row within same bank group</div>
        <div>tRRD_S   = 4 ck  // row-to-row across bank groups</div>
        <div>Rule: max 4 ACT in any tFAW window, plus tRRD_L/S between consecutive ACTs</div>
      </div>

      <LessonNav lessonId={6} onComplete={() => markComplete(6)} lessons={lessonsL2} />
    </div>
  )
}
