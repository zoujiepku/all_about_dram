import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import DRAMArraySim from '../visualizations/DRAMArraySim'

function ReadStepDiagram() {
  const steps = [
    { step: 'PRECHARGE', signal: 'PRE', color: '#3b82f6', desc: 'All bit lines driven to Vdd/2. Equalization transistor shorts BL and BLB. Bank is idle, row buffer is empty.' },
    { step: 'ROW ACTIVATE', signal: 'ACT', color: '#f59e0b', desc: 'Row address latched. Wordline rises to Vpp. Cell capacitors charge-share onto bitlines. Sense amps fire after tRCD.' },
    { step: 'COL SELECT', signal: 'RD', color: '#a855f7', desc: 'Column address sent. Column decoder gates selected bitlines to the DQ output bus. DQS strobe begins.' },
    { step: 'BURST TRANSFER', signal: 'DQ', color: '#22c55e', desc: 'Burst of 8 (BL8) consecutive columns transferred at DDR rate. DQS toggles per byte lane. 64 bytes fill a cache line.' },
    { step: 'RESTORE', signal: '—', color: '#06b6d4', desc: 'Wordline stays high. Sense amps drive BL to full rail, recharging all cells in the open row (write-back).' },
    { step: 'PRECHARGE', signal: 'PRE', color: '#3b82f6', desc: 'Row closes after tRAS. Bitlines equalize to Vdd/2. Bank ready for next activation.' },
  ]

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Complete Read Sequence
      </h3>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: s.color + '22', color: s.color, border: `1px solid ${s.color}55` }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.step}</span>
                <span className="font-mono text-xs text-dram-muted">[{s.signal}]</span>
              </div>
              <p className="text-xs text-dram-muted mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LatencyPipelineDiagram() {
  const phases = [
    { label: 'tRP', ns: 14, color: '#3b82f6', desc: 'Precharge' },
    { label: 'tRCD', ns: 14, color: '#f59e0b', desc: 'Row activate → SA fires' },
    { label: 'CL', ns: 14, color: '#a855f7', desc: 'CAS → data' },
    { label: 'Burst', ns: 5, color: '#22c55e', desc: 'BL8 data' },
  ]
  const total = phases.reduce((s, p) => s + p.ns, 0)
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        Read Latency Budget (DDR4-3200 CL22, bank-closed)
      </h3>
      <div className="flex w-full h-10 rounded-lg overflow-hidden mb-2">
        {phases.map((p) => (
          <div
            key={p.label}
            className="flex items-center justify-center text-xs font-mono font-bold"
            style={{ width: `${(p.ns / total) * 100}%`, backgroundColor: p.color + '33', color: p.color, border: `1px solid ${p.color}44` }}
          >
            {p.label}
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap mt-2">
        {phases.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-dram-muted">{p.label} = {p.ns} ns ({p.desc})</span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded bg-dram-bg text-xs font-mono text-dram-text">
        Total first-word latency ≈ tRP + tRCD + CL = 14 + 14 + 14 = <span className="text-dram-amber font-bold">42 ns</span>
        <span className="text-dram-muted ml-2">(+ controller overhead → ~60–80 ns end-to-end)</span>
      </div>
    </div>
  )
}

function RowBufferDiagram() {
  const scenarios = [
    { name: 'Row Buffer Hit', color: '#22c55e', latency: '~10 ns', desc: 'The requested row is already open. Skip ACT entirely — just issue CAS. Best case.', pct: 'CL only' },
    { name: 'Row Buffer Miss', color: '#f59e0b', latency: '~45 ns', desc: 'A different row is open in the same bank. Must PRE (close it) then ACT (open new row) before CAS.', pct: 'PRE + tRP + tRCD + CL' },
    { name: 'Row Buffer Empty', color: '#3b82f6', latency: '~35 ns', desc: 'No row is open in this bank. Just issue ACT then CAS. Skips the PRE wait.', pct: 'tRCD + CL' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Row Buffer Policy — the three cases
      </h3>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <div key={s.name} className="rounded-lg p-3 flex gap-3" style={{ backgroundColor: s.color + '0d', border: `1px solid ${s.color}33` }}>
            <div className="flex-shrink-0 text-right w-24">
              <div className="font-bold text-sm" style={{ color: s.color }}>{s.latency}</div>
              <div className="text-xs font-mono text-dram-muted">{s.pct}</div>
            </div>
            <div>
              <div className="font-semibold text-sm text-dram-text">{s.name}</div>
              <div className="text-xs text-dram-muted mt-0.5">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        The memory controller's <strong>row buffer management policy</strong> — open-page (keep row open, bet on locality) vs. closed-page (precharge after every access, bet on variety) — is a critical scheduling decision. Real workloads with spatial locality benefit enormously from open-page.
      </p>
    </div>
  )
}

export default function L05() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 05</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">The Read Operation</h1>
        <p className="text-dram-muted mt-2">Tracing a memory read from CPU request to data on the bus — every step explained</p>
      </div>

      <ReadStepDiagram />

      <h2>What Triggers a DRAM Read</h2>
      <p>
        When a CPU core issues a load instruction, the memory system first checks the L1, L2, and L3
        caches. If all three miss, the memory controller initiates a DRAM read. It translates the
        physical address into a DRAM rank, bank number, row address, and column address — then issues
        the following command sequence.
      </p>

      <h2>Step 1: Precharge — Setting the Reference</h2>
      <p>
        Every read starts with the bank's bitlines equalized to <strong>Vdd/2 = 0.6 V</strong>
        (for DDR5 at 1.2 V). A precharge circuit at the top of each bitline pair contains three
        transistors: two to connect BL and BLB to Vdd/2, and one equalization transistor that
        momentarily shorts BL to BLB to force both to exactly the same voltage.
      </p>
      <p>
        The precharge takes <strong>tRP</strong> (row precharge time) to complete — typically
        10–15 ns on DDR4/5. If the bank already had a row open from a previous access, the
        controller must issue PRE first and wait tRP before it can open any new row.
      </p>
      <p>
        During precharge, the storage capacitors are completely isolated (WL is low, transistors
        are off). The charge stored in the cells is undisturbed.
      </p>

      <h2>Step 2: Row Activate — Charge Sharing and Sense Amp</h2>
      <p>
        The controller sends an ACT (activate) command containing the row address. The row decoder
        drives the selected wordline high — to Vpp ≈ 2.5–3 V, boosted above Vdd so the NMOS
        access transistors fully turn on.
      </p>
      <p>
        All transistors in that row (typically 1,024 in a subarray) switch on simultaneously.
        Each cell's capacitor shares its charge with the corresponding bitline. A cell storing '1'
        (capacitor at Vdd) pulls its bitline slightly above Vdd/2; a cell storing '0' (capacitor
        near 0 V) pulls slightly below. The deviation is only <strong>ΔV ≈ ±55 mV</strong>
        (from the charge-sharing formula, with Cs=20fF and Cbl=200fF).
      </p>
      <p>
        After waiting <strong>tRCD</strong> (RAS-to-CAS delay, 10–15 ns) for the bitlines to
        fully settle, the sense amplifiers fire. Each SA resolves in 1–2 ns, amplifying the ±55 mV
        signal to full 0–1.2 V rails. The row is now "open" — all 1,024 cells in the row are
        latched into the sense amplifiers, which act as a row buffer.
      </p>

      <h2>Step 3: Column Select — CAS and DQS</h2>
      <p>
        With the row open and sense amps holding data, the controller issues a READ command
        containing the column address. The <strong>column decoder</strong> selects the appropriate
        bitlines and connects them through the IO gating to the DQ output bus.
      </p>
      <p>
        After waiting <strong>CL</strong> (CAS latency, measured in clock cycles), the first
        data byte appears on the DQ pins. For DDR4-3200 at CL22, each cycle is 0.625 ns, so
        CL = 22 × 0.625 = <strong>13.75 ns</strong> of additional wait.
      </p>
      <p>
        The <strong>DQS</strong> (data strobe) signal toggles in sync with the data, one per
        byte lane. The controller uses DQS as a source-synchronous clock to capture each byte
        exactly at its valid window center. Without DQS, the controller would have to know the
        exact round-trip propagation delay to latch data correctly.
      </p>

      <h2>Step 4: Burst Transfer</h2>
      <p>
        DRAM always transfers data in bursts, not single bytes. A <strong>BL8 burst</strong>
        (burst length 8) returns 8 consecutive column locations per READ command. At DDR speed
        (data on both clock edges), BL8 on a 64-bit bus delivers:
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>8 transfers × 8 bytes = 64 bytes per READ command</div>
        <div className="text-dram-muted mt-1">= one full CPU cache line per command</div>
        <div className="text-dram-muted mt-1">At 3200 MT/s: 64B ÷ (8 transfers × 0.3125ns) ≈ 25.6 GB/s peak</div>
      </div>
      <p>
        The burst amortizes the expensive ACT overhead (tRCD ≈ 14 ns) over 64 useful bytes. If
        DRAM returned only 1 byte per command, effective bandwidth would collapse.
      </p>

      <h2>Step 5: Restore — the Implicit Write-Back</h2>
      <p>
        After data appears on DQ, the wordline is <em>still high</em>. The sense amps, now driving
        BL to full rails (Vdd or GND), are simultaneously pumping that voltage back through the
        transistors into the cell capacitors. This is the <strong>write-back / restore</strong>
        step that makes destructive reads self-healing.
      </p>
      <p>
        The row must stay open for at least <strong>tRAS</strong> (row active strobe time, ≈ 32–48 ns)
        to guarantee complete restoration. Closing the row before tRAS expires risks leaving some
        cells only partially recharged.
      </p>

      <h2>The Latency Budget</h2>
      <LatencyPipelineDiagram />

      <h2>The Row Buffer: Open vs Closed Page Policy</h2>
      <p>
        Once a row is activated, the sense amps hold all its data — the row is "in the row buffer."
        A subsequent read to the <em>same row</em> in the <em>same bank</em> can skip the PRE and
        ACT steps entirely, going straight to CAS. This is a <strong>row buffer hit</strong> and
        is dramatically faster.
      </p>

      <RowBufferDiagram />

      <p>
        The memory controller must decide whether to leave a row open after an access
        (<strong>open-page policy</strong>) betting the next access will hit the same row, or to
        immediately precharge after each access (<strong>closed-page policy</strong>) minimizing
        latency for misses. Real controllers use adaptive policies: open-page for sequential or
        strided access patterns, closed-page for random workloads.
      </p>

      <h2>Try It</h2>
      <p>
        Click any cell in the array simulator. Watch the row activate (all cells in the row light up),
        the column select (the specific cell is highlighted), and the data appear on the output.
      </p>

      <DRAMArraySim mode="read" />

      <LessonNav lessonId={5} onComplete={() => markComplete(5)} />
    </div>
  )
}
