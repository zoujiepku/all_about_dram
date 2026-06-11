import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import DRAMCellViz from '../visualizations/DRAMCellViz'
import DRAMArraySim from '../visualizations/DRAMArraySim'

function WriteVsReadDiagram() {
  const phases = [
    {
      title: 'WRITE',
      color: '#22c55e',
      steps: [
        { label: 'PRE', desc: 'Precharge BL to Vdd/2 (same as read)' },
        { label: 'ACT', desc: 'Wordline rises, row activates (same as read)' },
        { label: 'WR', desc: 'Write driver FORCES BL to Vdd (write 1) or GND (write 0)' },
        { label: 'tWR wait', desc: 'Write driver holds BL for ≥15 ns (tWR) to fully charge/discharge cap' },
        { label: 'PRE', desc: 'After tWR: wordline closes, BL precharges' },
      ],
    },
    {
      title: 'READ',
      color: '#3b82f6',
      steps: [
        { label: 'PRE', desc: 'Precharge BL to Vdd/2' },
        { label: 'ACT', desc: 'Wordline rises, BL is FLOATING — cell moves BL' },
        { label: 'RD', desc: 'Sense amp detects ΔV ≈ ±55 mV, amplifies to rail' },
        { label: 'DATA', desc: 'Column selected, data bursts out on DQ (64 bytes, BL8)' },
        { label: 'PRE', desc: 'After tRAS: wordline closes, BL precharges' },
      ],
    },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">Write vs Read — the key difference</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((p) => (
          <div key={p.title} className="rounded-lg p-3" style={{ border: `1px solid ${p.color}33`, backgroundColor: p.color + '08' }}>
            <div className="font-bold text-sm mb-3" style={{ color: p.color }}>{p.title}</div>
            <div className="space-y-2">
              {p.steps.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono w-20 flex-shrink-0 font-bold" style={{ color: p.color }}>{s.label}</span>
                  <span className="text-dram-muted">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        In a write, the bitline is an <strong>active driver</strong> — it forces the capacitor to the desired voltage.
        In a read, the bitline is <strong>floating</strong> — it passively accepts charge from the capacitor.
        This reversal of direction is the fundamental difference.
      </p>
    </div>
  )
}

function RefreshMathCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">Refresh Math</h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-dram-muted">JEDEC retention window (at 85°C max):</span>
          <span className="text-dram-green">64 ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">Rows per bank:</span>
          <span className="text-dram-green">8,192 (typical DDR4)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">Required refresh interval (tREFI):</span>
          <span className="text-dram-amber font-bold">64 ms ÷ 8192 = 7.8 µs</span>
        </div>
        <div className="border-t border-dram-border pt-2 mt-2 flex justify-between">
          <span className="text-dram-muted">Refresh cycle time (tRFC, DDR4-8Gb):</span>
          <span className="text-dram-blue">350 ns</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">tRFC, DDR5-32Gb:</span>
          <span className="text-dram-blue">550 ns (more rows to refresh)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">Effective overhead (all-bank refresh):</span>
          <span className="text-dram-amber">350 ns ÷ 7800 ns ≈ 4.5%</span>
        </div>
      </div>
    </div>
  )
}

function RetentionTempTable() {
  const rows = [
    { temp: '25°C (room)', retention: '~1–4 s', note: 'Far above spec; actual cells measured at seconds' },
    { temp: '55°C (warm)', retention: '~512 ms', note: 'Arrhenius: ~8× longer than 85°C spec' },
    { temp: '85°C (spec max)', retention: '≥64 ms', note: 'JEDEC baseline — worst-case cells must meet this' },
    { temp: '95°C (ext. temp)', retention: '≥32 ms', note: 'JEDEC 2× refresh spec; tREFI halved to 3.9 µs' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Temperature</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Typical Retention</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono text-dram-amber">{r.temp}</td>
              <td className="p-3 font-bold text-dram-green">{r.retention}</td>
              <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function L06() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 06</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Write &amp; Refresh</h1>
        <p className="text-dram-muted mt-2">Writing data into cells and keeping charge alive with periodic refresh</p>
      </div>

      <h2>How Writing Works</h2>
      <p>
        A write starts identically to a read: precharge → row activate. But at the CAS step,
        instead of letting the sense amp float and detect, the <strong>write driver</strong>
        takes over and actively forces the bitline to the desired voltage.
      </p>

      <WriteVsReadDiagram />

      <h3>The Write Driver: Active vs Floating Bitline</h3>
      <p>
        This is the most important distinction. During a read, the bitline is floating — it
        finds its equilibrium based on charge sharing between the cell capacitor and the
        bitline capacitance. During a write, the write driver clamps the bitline to either
        Vdd (for a '1') or GND (for a '0'), regardless of what the cell currently holds.
      </p>
      <p>
        With the wordline high and BL being driven hard by the write driver, the capacitor
        charges or discharges through the open transistor. The write driver must hold the
        bitline for at least <strong>tWR = 15 ns</strong> (write recovery time) to ensure
        the capacitor has fully settled to the new value. Issuing a PRE before tWR elapses
        would close the wordline before the capacitor finished charging, leaving it partially
        written — a data corruption.
      </p>

      <h3>Write Column Masking (DM / DBI)</h3>
      <p>
        DDR3/4/5 supports writing only specific bytes within a burst. The <strong>DM</strong>
        (Data Mask) pins, sampled synchronously with data, suppress the write driver for
        masked bytes — those cells are not written. DDR4/5 can replace DM with{' '}
        <strong>DBI</strong> (Data Bus Inversion): if more than 4 bits of a byte would need
        to be driven to '0' (more power), DBI inverts the byte and sets a flag, reducing
        switching activity and power by up to 25%.
      </p>

      <h3>Write CAS Latency (CWL)</h3>
      <p>
        The write has its own latency: <strong>CWL</strong> (CAS Write Latency). It is always
        less than or equal to CL. For DDR4-3200 CL22, CWL is typically 16 cycles. The lower
        CWL means write data must be placed on the bus earlier than the READ command issues,
        so the data arrives at the DRAM at the right time relative to the CAS-WRITE command.
      </p>

      <h2>Cell Leakage — Why Charge Disappears</h2>
      <p>
        Even with the wordline low (transistor OFF), the cell is not perfectly isolated. Three
        leakage mechanisms continuously drain charge:
      </p>
      <ul>
        <li><strong>Subthreshold leakage</strong>: the NMOS transistor conducts a tiny current
            even below threshold. At 65 nm and below, this is the dominant path — approximately
            100–200 fA (femtoamperes) flowing from the capacitor through the transistor drain
            to the bitline (at Vdd/2).</li>
        <li><strong>Gate oxide tunneling</strong>: at ultra-thin gate oxides (&lt;2 nm), electrons
            quantum-mechanically tunnel through the SiO₂. Less significant than subthreshold
            at typical operating temperatures.</li>
        <li><strong>Junction leakage</strong>: the capacitor's bottom plate forms a p-n junction
            with the substrate; reverse-bias leakage contributes at high temperatures.</li>
      </ul>
      <p>
        Combined, these mechanisms drain a cell from full charge to below the 50% sensing
        threshold. At room temperature, measured retention is typically <strong>1–4 seconds</strong>.
        JEDEC defines the retention window as <strong>64 ms at up to 85°C</strong> — the worstcase
        cells at maximum operating temperature must survive at least this long between refreshes.
      </p>

      <h2>Temperature and Retention</h2>
      <p>
        Subthreshold leakage doubles roughly every 10°C of temperature increase (Arrhenius
        relationship). This dramatically shortens retention at elevated temperatures:
      </p>

      <RetentionTempTable />

      <p>
        JEDEC defines two operating ranges. Standard (0–85°C): 64 ms refresh window,
        tREFI = 7.8 µs. Extended temperature (85–95°C): 32 ms window, tREFI = 3.9 µs —
        this matches the Arrhenius prediction (retention halves per 10°C, so one more
        doubling from 85°C gives ≥32 ms at 95°C). This is called
        <strong>high temperature self-refresh (HTSR)</strong> in LPDDR, or
        <strong>2× refresh rate mode</strong> in server DDR. Above 95°C, no JEDEC spec
        exists and data loss is unavoidable regardless of refresh rate.
      </p>

      <DRAMCellViz />

      <h2>Refresh Mechanics</h2>
      <p>
        A refresh command is electrically identical to a full row read — but with no column
        select and no data output. The sequence per bank:
      </p>
      <ol>
        <li>The memory controller (or DRAM's internal auto-refresh counter) issues a <strong>REF</strong> command.</li>
        <li>The DRAM's internal <strong>refresh row counter</strong> selects the next row to refresh (cycled through all 8,192 rows automatically).</li>
        <li>That row's wordline rises, cells charge-share onto bitlines.</li>
        <li>Sense amps fire and restore all cells in the row to full charge.</li>
        <li>Wordline drops, bitlines precharge, counter increments to the next row.</li>
      </ol>
      <p>
        The controller supplies the timing (one REF every tREFI = 7.8 µs) but does not specify
        which row — the DRAM manages that internally. This is called <strong>auto-refresh (AR)</strong>.
        Alternatively, <strong>self-refresh (SR)</strong> mode lets the DRAM run its own internal
        oscillator and refresh itself with no controller involvement — used during deep sleep in
        LPDDR to cut controller power.
      </p>

      <h2>Refresh Math</h2>
      <RefreshMathCard />

      <h2>All-Bank vs Per-Bank Refresh</h2>
      <p>
        Traditional DRAM uses <strong>all-bank refresh (ABR)</strong>: every bank refreshes the
        same row simultaneously when a REF command arrives. During tRFC (up to 550 ns for 32 Gb
        DDR5), all banks are unavailable. This creates a regular dead zone for the CPU.
      </p>
      <p>
        <strong>Per-bank refresh (PBR)</strong>, introduced in DDR5, allows each bank to refresh
        independently. While bank 0 is refreshing, banks 1–15 can still serve read/write requests.
        tRFC per bank is shorter (130 ns vs 350 ns) because the refresh current is spread over
        fewer banks at once, but the refresh frequency must increase. The net effect is far better
        worst-case latency at the cost of slightly more complex scheduling.
      </p>

      <h2>Refresh Management (RFM) — RowHammer Defense</h2>
      <p>
        DDR5 added <strong>RFM (Refresh Management)</strong> as a RowHammer mitigation. If the
        controller has been activating a particular row unusually frequently, RFM commands direct
        the DRAM to perform targeted refreshes of the rows physically adjacent to the hot row.
        This prevents accumulated disturbance charge from flipping bits in neighboring cells.
        RFM is separate from the ordinary tREFI refresh cycle and adds latency only when triggered.
      </p>

      <h2>Use the Simulator</h2>
      <p>
        Switch the array to <strong>Write</strong> mode, pick value 0 or 1, click cells to write.
        Watch the cell values change. Toggle <strong>Simulate Leak</strong> in the cell viz above
        to watch charge drain, then hit <strong>Refresh Row</strong> to restore it.
      </p>

      <DRAMArraySim />

      <LessonNav lessonId={6} onComplete={() => markComplete(6)} />
    </div>
  )
}
