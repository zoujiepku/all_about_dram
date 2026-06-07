import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import SchedulerSim from '../../visualizations/level2/SchedulerSim'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_04() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 04 · Cluster B: System Architecture</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Memory Controller Scheduling</h1>
        <p className="text-dram-muted mt-2">FR-FCFS, open vs. closed page policy, row-buffer classification, and starvation</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 7 (Timing Parameters) you
        saw that a row-buffer hit (tCL only) is 3–4× faster than a row-buffer miss (tRP + tRCD + tCL). The
        memory controller's scheduling policy determines how often you get hits.
      </div>

      <SchedulerSim />

      <h2>Row-Buffer Classification</h2>
      <p>
        Every incoming memory request falls into one of three categories based on the current state of the
        bank's row buffer:
      </p>
      <ul>
        <li><strong>Row-buffer hit:</strong> The requested row is already open (was activated by a prior request). Latency ≈ tCL only (e.g., 16 ns at DDR4-3200).</li>
        <li><strong>Row-buffer miss:</strong> A different row is open. The old row must be precharged (tRP) before the new row can be activated (tRCD). Latency ≈ tRP + tRCD + tCL ≈ 48 ns.</li>
        <li><strong>Row-buffer empty:</strong> The bank has been precharged; no row is open. Skip tRP, but still need tRCD + tCL ≈ 32 ns.</li>
      </ul>

      <h2>FR-FCFS Scheduling</h2>
      <p>
        <strong>First-Ready FCFS (FR-FCFS)</strong> is the most widely deployed scheduling algorithm.
        It reorders the request queue so that all row-buffer hits are served before row-buffer misses or
        empties, regardless of arrival order. Within the same row-buffer class, requests are served
        first-come first-served.
      </p>
      <p>
        The benefit: FR-FCFS maximizes row-buffer locality, dramatically improving throughput for
        workloads with spatial locality (database scans, GPU texture fetches). The cost: row-buffer miss
        requests may be indefinitely delayed if hits keep arriving — a form of <strong>starvation</strong>.
      </p>
      <p>
        Modern controllers add an <strong>age threshold</strong>: a miss request that has waited more than
        τ cycles is promoted to "high priority" regardless of its row-buffer status, preventing unbounded
        delay.
      </p>

      <h2>Open-Page vs. Closed-Page Policy</h2>
      <p>
        The page policy determines what happens after a column access completes:
      </p>
      <ul>
        <li>
          <strong>Open page:</strong> The row stays open after the access. If the next request is to the
          same row (a hit), latency is minimal. If it's a miss, an extra precharge is needed. Best for
          workloads with high spatial locality (streaming reads/writes to the same row).
        </li>
        <li>
          <strong>Closed page:</strong> The row is immediately precharged after each access. Every request
          pays tRP + tRCD + tCL, but there are no miss penalties for out-of-order access patterns.
          Best for random workloads (key-value stores, pointer-chasing graphs).
        </li>
      </ul>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4 mb-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>Policy</div><div>Best for</div><div>Worst for</div>
        </div>
        {[
          ['FR-FCFS + open page', 'High spatial locality (databases, GPU)', 'Random, mixed-requester workloads'],
          ['FCFS + closed page', 'Fair access, real-time guarantees', 'Streaming (wastes row-buffer hits)'],
          ['Round-robin', 'Multi-tenant fairness', 'Single-thread throughput'],
        ].map(([pol, best, worst]) => (
          <div key={pol} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{pol}</div>
            <div className="text-dram-green">{best}</div>
            <div className="text-amber-400">{worst}</div>
          </div>
        ))}
      </div>

      <h2>Latency Distributions</h2>
      <p>
        In real systems, the memory latency seen by the CPU is not a fixed number — it is a distribution.
        Under open-page FR-FCFS with a hot working set, 80–90% of requests are hits (tCL ≈ 16 ns).
        Under pointer-chasing workloads with random access, 90%+ are misses (≈48 ns). The tail latency
        (99th percentile) matters greatly for latency-sensitive applications like in-memory databases and
        real-time analytics — this motivates hardware prefetchers and QoS-aware schedulers.
      </p>

      <LessonNav lessonId={4} onComplete={() => markComplete(4)} lessons={lessonsL2} />
    </div>
  )
}
