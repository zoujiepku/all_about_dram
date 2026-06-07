import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import TimingDiagramViz from '../visualizations/TimingDiagramViz'

function TimingTable() {
  const params = [
    { param: 'tRP', name: 'Row Precharge Time', typical: '14 ns', desc: 'Time for bitlines to equalize to Vdd/2 after closing a row. Limited by the RC time constant of the precharge circuit.' },
    { param: 'tRCD', name: 'RAS-to-CAS Delay', typical: '14 ns', desc: 'Time from wordline rise to sense amp stabilization. Limited by charge-sharing settling time plus SA resolve time.' },
    { param: 'CL', name: 'CAS Latency', typical: '14 ns (DDR4-3200 CL22)', desc: 'Time from READ command to first valid data on DQ. Includes column decoder path + IO driver.' },
    { param: 'tRAS', name: 'Row Active Strobe', typical: '32–48 ns', desc: 'Minimum time a row must stay open before precharge. Ensures complete write-back of all cells.' },
    { param: 'tRC', name: 'Row Cycle Time', typical: '46–62 ns', desc: 'tRAS + tRP — minimum time between two ACT commands to the same bank.' },
    { param: 'tWR', name: 'Write Recovery', typical: '15 ns', desc: 'Minimum time after last write burst before PRE can be issued. Guarantees full capacitor charge.' },
    { param: 'tRRD_S', name: 'Row-to-Row Delay (Short)', typical: '3–5 ns', desc: 'Minimum time between ACT commands to different bank groups. Power/IR-drop limit.' },
    { param: 'tRRD_L', name: 'Row-to-Row Delay (Long)', typical: '5–6 ns', desc: 'Minimum time between ACT commands within the same bank group.' },
    { param: 'tFAW', name: 'Four-Activate Window', typical: '20–35 ns', desc: 'At most 4 ACT commands may start within any tFAW window, regardless of bank. Limits peak current.' },
    { param: 'tCCD_S', name: 'CAS-to-CAS (Short)', typical: '4 cycles min', desc: 'Minimum time between back-to-back READ commands to different bank groups. JEDEC DDR4 floor is 4 nCK.' },
    { param: 'tCCD_L', name: 'CAS-to-CAS (Long)', typical: '5–8 cycles', desc: 'Minimum time between back-to-back READ commands to the same bank group.' },
    { param: 'tWTR_S', name: 'Write-to-Read (Short)', typical: '2–4 cycles', desc: 'Time between last write and a READ to a different bank group. Bus turnaround.' },
    { param: 'tWTR_L', name: 'Write-to-Read (Long)', typical: '6–10 cycles', desc: 'Time between last write and a READ in the same bank group. Longer for DQ/DQS to turn around.' },
    { param: 'tRFC', name: 'Refresh Cycle Time', typical: '260–550 ns', desc: 'Time a bank is occupied during auto-refresh. Increases with die capacity: bigger chip = more rows to restore.' },
    { param: 'tREFI', name: 'Refresh Interval', typical: '7.8 µs', desc: '64 ms retention window ÷ 8192 rows. Controller must issue one REF command per tREFI.' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Parameter</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Name</th>
            <th className="text-left p-3 text-dram-muted font-semibold">DDR4-3200 Typical</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Physical reason</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono font-bold text-dram-amber whitespace-nowrap">{p.param}</td>
              <td className="p-3 text-dram-text">{p.name}</td>
              <td className="p-3 font-mono text-dram-blue text-xs whitespace-nowrap">{p.typical}</td>
              <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LatencyCalcBlock() {
  const examples = [
    { label: 'DDR4-2400 CL16', mt: 2400, cl: 16, tRCD: 16, tRP: 16 },
    { label: 'DDR4-3200 CL22', mt: 3200, cl: 22, tRCD: 22, tRP: 22 },
    { label: 'DDR5-4800 CL40', mt: 4800, cl: 40, tRCD: 40, tRP: 40 },
    { label: 'DDR5-6400 CL32', mt: 6400, cl: 32, tRCD: 32, tRP: 32 },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        Absolute Latency Comparison — cycles vs nanoseconds
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-dram-muted border-b border-dram-border">
              <th className="text-left p-2">Spec</th>
              <th className="p-2">Clock period</th>
              <th className="p-2">CL cycles</th>
              <th className="p-2">CL (ns)</th>
              <th className="p-2">tRCD (ns)</th>
              <th className="p-2">tRP (ns)</th>
              <th className="p-2 font-bold text-dram-amber">Total (ns)</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e, i) => {
              const period = 2000 / e.mt
              const clNs = (e.cl * period).toFixed(1)
              const rcdNs = (e.tRCD * period).toFixed(1)
              const rpNs = (e.tRP * period).toFixed(1)
              const total = (e.cl * period + e.tRCD * period + e.tRP * period).toFixed(1)
              return (
                <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/30' : ''}`}>
                  <td className="p-2 text-dram-text font-bold">{e.label}</td>
                  <td className="p-2 text-dram-muted text-center">{period.toFixed(3)} ns</td>
                  <td className="p-2 text-dram-blue text-center">{e.cl}</td>
                  <td className="p-2 text-dram-green text-center">{clNs}</td>
                  <td className="p-2 text-dram-green text-center">{rcdNs}</td>
                  <td className="p-2 text-dram-green text-center">{rpNs}</td>
                  <td className="p-2 text-dram-amber font-bold text-center">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-dram-muted mt-3">
        DDR5-6400 CL32 has a <em>lower</em> CL number than DDR5-4800 CL40, but both have roughly
        the same absolute latency (~10 ns for CL alone). Always compare nanoseconds, not cycle counts.
      </p>
    </div>
  )
}

function tFAWDiagram() {
  const barW = 40
  const gap = 10
  const total = 5 * barW + 4 * gap
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']
  const labels = ['ACT0', 'ACT1', 'ACT2', 'ACT3', 'ACT4 ✗']
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">tFAW — Four Activate Window</h3>
      <svg width="100%" viewBox={`0 0 ${total + 60} 100`} preserveAspectRatio="xMidYMid meet">
        {/* tFAW bracket */}
        <line x1={30} y1={20} x2={30 + 4*barW + 3*gap} y2={20} stroke="#f59e0b" strokeWidth={1.5}/>
        <line x1={30} y1={15} x2={30} y2={25} stroke="#f59e0b" strokeWidth={1.5}/>
        <line x1={30 + 4*barW + 3*gap} y1={15} x2={30 + 4*barW + 3*gap} y2={25} stroke="#f59e0b" strokeWidth={1.5}/>
        <text x={30 + (4*barW + 3*gap)/2} y={14} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">tFAW window (max 4 ACTs)</text>

        {labels.map((label, i) => {
          const x = 30 + i * (barW + gap)
          const isBlocked = i === 4
          return (
            <g key={i}>
              <rect x={x} y={30} width={barW} height={35} rx={4}
                fill={isBlocked ? '#ef444422' : colors[i] + '33'}
                stroke={isBlocked ? '#ef4444' : colors[i]}
                strokeWidth={1.5}
                strokeDasharray={isBlocked ? '4 2' : undefined}
              />
              <text x={x + barW/2} y={51} textAnchor="middle" fill={isBlocked ? '#ef4444' : colors[i]} fontSize={8} fontWeight="bold">{label}</text>
              <text x={x + barW/2} y={80} textAnchor="middle" fill="#64748b" fontSize={7}>tRRD</text>
              {i < 4 && <line x1={x + barW} y1={47} x2={x + barW + gap} y2={47} stroke="#475569" strokeWidth={1} strokeDasharray="2 2"/>}
            </g>
          )
        })}
      </svg>
      <p className="text-xs text-dram-muted mt-2">
        ACT0–ACT3 each respect tRRD (minimum gap between activations). But ACT4 would place 5 activations
        within tFAW = 35 ns, violating the power budget. The controller must stall until ACT0 falls
        outside the window before issuing ACT4.
      </p>
    </div>
  )
}

export default function L07() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 07</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Timing Parameters</h1>
        <p className="text-dram-muted mt-2">tRCD, CL, tRAS, tRP, tFAW — reading a DRAM datasheet and understanding the physics</p>
      </div>

      <TimingDiagramViz />

      <h2>Why DRAM Needs Timing Constraints</h2>
      <p>
        Unlike SRAM, which provides data after a single propagation delay, DRAM requires a precise
        multi-step command sequence with enforced minimum waits between each step. These waits are
        not arbitrary — each corresponds to a physical process that cannot be rushed:
      </p>
      <ul>
        <li><strong>Capacitor charging/discharging</strong>: the RC time constant of the storage capacitor and the access transistor determines how fast charge can flow during reads and writes (→ tRCD, tWR)</li>
        <li><strong>Sense amp resolution</strong>: the cross-coupled latch takes 1–2 ns to amplify ΔV ≈ 55 mV to full rail; activating the column path too early sees indeterminate voltage (→ tRCD)</li>
        <li><strong>Bitline equalization</strong>: the RC settling of bitline to Vdd/2 after a row closes (→ tRP)</li>
        <li><strong>Peak current limits</strong>: activating too many rows simultaneously causes a current spike through the package inductance, creating a voltage glitch — bounded by tRRD and tFAW</li>
      </ul>
      <p>
        Violating any timing constraint doesn't cause slow performance — it causes <strong>data
        corruption or incorrect sensing</strong>. The memory controller must respect all constraints
        simultaneously.
      </p>

      <h2>Complete Timing Parameter Reference</h2>
      <TimingTable />

      <h2>The Three Latency Scenarios</h2>
      <p>
        The command sequence and associated latency differ based on the row buffer state (from Module 05):
      </p>
      <ul>
        <li><strong>Bank closed (row empty)</strong>: ACT → wait tRCD → RD → wait CL → data. Total ≈ tRCD + CL</li>
        <li><strong>Row hit (same row already open)</strong>: RD → wait CL → data. Total ≈ CL only. Fastest case.</li>
        <li><strong>Row miss (different row open)</strong>: PRE → wait tRP → ACT → wait tRCD → RD → wait CL → data. Total ≈ tRP + tRCD + CL. Slowest case.</li>
      </ul>

      <h2>Absolute vs Cycle-Count Latency</h2>
      <p>
        Timing parameters are published in <em>clock cycles</em> on datasheets. As data rates increase,
        the cycle time shrinks — so a higher CL number at a faster speed may have less absolute latency
        than a lower CL at a slower speed. Always convert to nanoseconds:
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>Cycle time = 2000 ms ÷ (MT/s rate)</div>
        <div className="text-dram-muted mt-1">DDR4-3200: 2000 ÷ 3200 = 0.625 ns/cycle</div>
        <div className="text-dram-muted">DDR5-6400: 2000 ÷ 6400 = 0.3125 ns/cycle</div>
      </div>
      <LatencyCalcBlock />

      <h2>tFAW: The Four-Activate Window</h2>
      <p>
        Every row activation draws a significant current pulse through the wordline driver and the
        array power supply. If too many banks are activated in rapid succession, the combined
        di/dt causes a voltage droop on Vdd that can corrupt sensing in cells that are in the
        middle of a charge-share. tFAW is the rolling time window during which at most 4 ACT
        commands are permitted across all banks.
      </p>

      <tFAWDiagram />

      <p>
        tFAW works together with tRRD. Even if tFAW has room for another activation, each
        individual ACT must still be separated from the previous one by tRRD (typically 5 ns).
        tRRD protects the wordline drivers; tFAW protects the power supply.
      </p>

      <h2>tCCD: Back-to-Back Column Commands</h2>
      <p>
        DDR4 introduced bank groups — clusters of banks that share a common internal data path.
        Reading from two different bank groups can be pipelined more tightly (tCCD_S = 4 cycles minimum per JEDEC DDR4)
        than reading from the same bank group (tCCD_L = 5–8 cycles). The difference exists because
        within a bank group, the shared sense-amp output path needs settling time between consecutive
        column accesses.
      </p>
      <p>
        A good memory controller will interleave requests across bank groups to exploit tCCD_S and
        keep the DQ bus nearly fully utilized.
      </p>

      <h2>tWTR: Write-to-Read Turnaround</h2>
      <p>
        After a write burst, the DQ pins must switch direction — from the controller driving them
        outward to the DRAM driving them inward. tWTR (write-to-read turnaround) provides time
        for the bus to change direction and for the DQS strobe signal to re-align. tWTR_L (same
        bank group) is longer than tWTR_S (different bank group) for the same bus-contention reason
        as tCCD.
      </p>

      <h2>Reading a Timing Specification: CL-tRCD-tRP-tRAS</h2>
      <p>
        DRAM sticks use the shorthand notation <code>CL-tRCD-tRP-tRAS</code>. Example:
        <strong> 22-22-22-52</strong> at DDR4-3200 means:
      </p>
      <ul>
        <li>CL = 22 cycles = 13.75 ns</li>
        <li>tRCD = 22 cycles = 13.75 ns</li>
        <li>tRP = 22 cycles = 13.75 ns</li>
        <li>tRAS = 52 cycles = 32.5 ns</li>
      </ul>
      <p>
        Overclockers often tighten these timings (lower numbers), which reduces absolute latency.
        But the physical processes must complete — going too tight causes errors or instability.
        The JEDEC-specified timings are conservative enough that most chips can run tighter with
        adequate voltage and cooling.
      </p>

      <LessonNav lessonId={7} onComplete={() => markComplete(7)} />
    </div>
  )
}
