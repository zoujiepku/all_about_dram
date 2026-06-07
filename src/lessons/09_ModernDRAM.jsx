import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'

function ComparisonTable() {
  const types = [
    {
      name: 'DDR5',
      use: 'Desktop / Server / Workstation',
      voltage: '1.1V',
      bandwidth: '38–51 GB/s/channel (×2 = 76–102 GB/s dual-ch)',
      busWidth: '2 × 32-bit subchannels per DIMM',
      latency: '~14 ns (CL + tRCD)',
      capacity: 'Up to 128 GB per DIMM (2024)',
      feature: 'On-die ECC, PMIC on DIMM, 16n prefetch, per-bank refresh, RFM RowHammer defense',
      color: '#a855f7',
    },
    {
      name: 'LPDDR5 / 5X',
      use: 'Mobile SoC / Thin Laptop / Smartphone',
      voltage: '0.5–1.05V',
      bandwidth: '44–68 GB/s (5X: up to 85 GB/s)',
      busWidth: '16/32-bit per channel (4–8 channels to SoC)',
      latency: '~15 ns',
      capacity: '4–32 GB on-package (PoP)',
      feature: 'Deep sleep modes (nW self-refresh), flip-chip PoP integration, Link-ECC for on-package SI',
      color: '#22c55e',
    },
    {
      name: 'GDDR6 / 6X',
      use: 'Discrete GPU / AI Inference',
      voltage: '1.35V',
      bandwidth: '448–512 GB/s (256-bit @ 14–16 Gbps/pin)',
      busWidth: '16 or 32-bit per chip',
      latency: '~30 ns (higher but hidden by GPU parallelism)',
      capacity: '8–24 GB (consumer), up to 32 GB (pro)',
      feature: 'PAM4 signaling (GDDR6X), WCK at 2× data rate, wide per-pin training, high Vpp',
      color: '#f59e0b',
    },
    {
      name: 'HBM3 / 3E',
      use: 'AI Accelerator (H100/H200) / HPC',
      voltage: '1.1V',
      bandwidth: '819 GB/s per stack (HBM3E: up to 1.2 TB/s)',
      busWidth: '1024-bit per stack',
      latency: '~100 ns (controller + PHY overhead)',
      capacity: '24–36 GB per stack (HBM3E: up to 64 GB)',
      feature: 'TSV + microbump stack, silicon interposer (2.5D), PIM extensions in some variants',
      color: '#3b82f6',
    },
  ]

  return (
    <div className="space-y-4 mb-6">
      {types.map((t) => (
        <div
          key={t.name}
          className="rounded-xl p-5 border"
          style={{ borderColor: t.color + '44', backgroundColor: t.color + '08' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-lg" style={{ color: t.color }}>{t.name}</h4>
            <span className="text-xs text-dram-muted px-2 py-1 bg-dram-bg rounded font-mono">{t.use}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {[
              ['Voltage', t.voltage],
              ['Bandwidth', t.bandwidth],
              ['Latency', t.latency],
              ['Bus Width', t.busWidth],
              ['Capacity', t.capacity],
            ].map(([k, v]) => (
              <div key={k} className="bg-dram-bg rounded-lg p-2">
                <div className="text-xs text-dram-muted">{k}</div>
                <div className="text-xs font-bold font-mono leading-tight mt-0.5" style={{ color: t.color }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-dram-muted bg-dram-bg rounded-lg p-2">
            <span className="text-dram-text font-medium">Key features: </span>{t.feature}
          </div>
        </div>
      ))}
    </div>
  )
}

function DDRBusDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DDR5 Subchannel Architecture
      </h3>
      <svg width="100%" height="140" viewBox="0 0 540 140" preserveAspectRatio="xMidYMid meet">
        {/* Controller */}
        <rect x="10" y="40" width="100" height="60" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="60" y="65" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">Memory</text>
        <text x="60" y="79" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">Controller</text>

        {/* Subchannel A label */}
        <text x="195" y="28" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">Subchannel A (32-bit)</text>
        <line x1="110" y1="55" x2="280" y2="55" stroke="#a855f7" strokeWidth="2"/>
        <text x="195" y="50" textAnchor="middle" fill="#a855f7" fontSize="8">DQ[0:31] + DQS[0:3] + DM[0:3]</text>

        {/* Subchannel B label */}
        <text x="195" y="110" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">Subchannel B (32-bit)</text>
        <line x1="110" y1="85" x2="280" y2="85" stroke="#22c55e" strokeWidth="2"/>
        <text x="195" y="97" textAnchor="middle" fill="#22c55e" fontSize="8">DQ[32:63] + DQS[4:7] + DM[4:7]</text>

        {/* DIMM */}
        <rect x="280" y="30" width="100" height="80" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <text x="330" y="65" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">DDR5</text>
        <text x="330" y="79" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">DIMM</text>

        {/* Arrows indicating independent */}
        <text x="420" y="55" fill="#64748b" fontSize="9">Independent</text>
        <text x="420" y="68" fill="#64748b" fontSize="9">command/data</text>
        <text x="420" y="81" fill="#64748b" fontSize="9">scheduling</text>

        {/* DDR arrows for subchannel A */}
        {[130, 160, 190].map(x => (
          <g key={x}>
            <line x1={x} y1="46" x2={x} y2="54" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
            <line x1={x+15} y1="54" x2={x+15} y2="46" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
          </g>
        ))}
        {/* DDR arrows for subchannel B */}
        {[130, 160, 190].map(x => (
          <g key={x}>
            <line x1={x} y1="82" x2={x} y2="90" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
            <line x1={x+15} y1="90" x2={x+15} y2="82" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
          </g>
        ))}
      </svg>
      <p className="text-xs text-dram-muted mt-2">
        Each subchannel has its own command/address bus and can be scheduled independently. A 32-byte
        access can go to subchannel A while subchannel B handles a different 32-byte access simultaneously.
        This halves the minimum transfer granularity vs DDR4's single 64-bit bus.
      </p>
    </div>
  )
}

function GDDRDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        GDDR6 on a GPU — wide parallel bus
      </h3>
      <svg width="100%" height="130" viewBox="0 0 520 130" preserveAspectRatio="xMidYMid meet">
        {/* GPU die */}
        <rect x="170" y="20" width="180" height="90" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
        <text x="260" y="60" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="bold">GPU Die</text>
        <text x="260" y="78" textAnchor="middle" fill="#64748b" fontSize="10">256-bit memory bus</text>
        <text x="260" y="92" textAnchor="middle" fill="#64748b" fontSize="9">(8 chips × 32-bit each)</text>

        {/* GDDR chips left */}
        {[0, 1, 2, 3].map(i => (
          <g key={'L' + i}>
            <rect x={10} y={10 + i * 28} width={50} height={20} rx={3} fill="#451a03" stroke="#f59e0b" strokeWidth={1}/>
            <text x={35} y={23 + i * 28} textAnchor="middle" fill="#f59e0b" fontSize={8}>GDDR6</text>
            <line x1={60} y1={20 + i * 28} x2={170} y2={65} stroke="#f59e0b" strokeWidth={1} opacity={0.5}/>
          </g>
        ))}

        {/* GDDR chips right */}
        {[0, 1, 2, 3].map(i => (
          <g key={'R' + i}>
            <rect x={460} y={10 + i * 28} width={50} height={20} rx={3} fill="#451a03" stroke="#f59e0b" strokeWidth={1}/>
            <text x={485} y={23 + i * 28} textAnchor="middle" fill="#f59e0b" fontSize={8}>GDDR6</text>
            <line x1={460} y1={20 + i * 28} x2={350} y2={65} stroke="#f59e0b" strokeWidth={1} opacity={0.5}/>
          </g>
        ))}

        <text x="260" y="120" textAnchor="middle" fill="#64748b" fontSize="9">8 × 16 Gbit chips = 16 GB total | 512 GB/s @ 16 Gbps/pin</text>
      </svg>
    </div>
  )
}

export default function L09() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 09</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Modern DRAM</h1>
        <p className="text-dram-muted mt-2">DDR5, LPDDR5, GDDR6, HBM3 — the four memory families and when to use each</p>
      </div>

      <ComparisonTable />

      <h2>DDR5: What Changed and Why</h2>

      <h3>Two Subchannels Per DIMM</h3>
      <p>
        DDR4 has one 64-bit data bus per DIMM. DDR5 splits this into two independent 32-bit
        subchannels, each with its own command/address bus, DQS strobes, and DM signals.
        Why? Because a narrower bus can be scheduled more independently — the controller can
        send a write to subchannel A and a read to subchannel B at the same time. This nearly
        doubles effective bank parallelism without doubling the physical wire count.
      </p>

      <DDRBusDiagram />

      <h3>On-Die ECC (ODECC)</h3>
      <p>
        Every DDR5 chip contains an internal ECC circuit. Before writing data to the cell array,
        the chip computes a parity code and stores it alongside the data. When reading, it
        verifies the data and corrects single-bit errors internally before sending data to the
        controller. This is transparent to the controller — it just gets correct data.
      </p>
      <p>
        ODECC protects against die-internal faults (process defects, particle strikes) that
        would be invisible to DIMM-level ECC (which sits outside the chip). It does <em>not</em>
        replace DIMM ECC — server systems still use both. Consumer DDR5 systems with no DIMM
        ECC at least get ODECC protection.
      </p>

      <h3>Power Management IC (PMIC) on DIMM</h3>
      <p>
        DDR4 relies on the motherboard voltage regulator to supply Vdd to all chips. DDR5 moves
        a PMIC (power management IC) onto the DIMM module itself, which generates the three
        required rails from the 12 V motherboard supply: <strong>VDD = 1.1 V</strong> (core
        power), <strong>VDDQ = 1.1 V</strong> (I/O power), and <strong>VPP = 1.8 V</strong>
        (internal wordline charge-pump supply). This improves voltage accuracy across the module,
        especially at high loads where PCB trace resistance caused DDR4 to droop.
      </p>

      <h2>LPDDR5 / LPDDR5X: Mobile First</h2>
      <p>
        LPDDR (Low Power DDR) is physically integrated into mobile SoCs via PoP (Package-on-Package)
        or directly bonded to the SoC interposer. Unlike DIMMs, the LPDDR dies sit millimeters
        from the processor, allowing very short traces and lower signal swing.
      </p>
      <p>
        Key mobile-specific features:
      </p>
      <ul>
        <li><strong>Deep power-down modes</strong>: LPDDR5 can drop to Retention mode (VDDQ = 0 V,
            cells kept alive by a separate VDD1 supply at minimal current) or Self-Refresh mode
            (DRAM refreshes itself with its own oscillator, controller completely idle). Power
            drops from ~1 W active to under 1 mW in deep self-refresh.</li>
        <li><strong>Voltage scaling</strong>: Vdd varies from 1.05 V (performance) to 0.5 V
            (low-power refresh). The LPDDR protocol includes commands to change the supply
            voltage on the fly.</li>
        <li><strong>Link ECC</strong>: LPDDR5X adds a single-burst ECC mode that protects the
            short on-package bus from soft errors and crosstalk, with minimal area overhead.</li>
        <li><strong>LPDDR5X</strong> (extended) reaches 8533 MT/s on a 64-bit bus — ~85 GB/s —
            used in flagship smartphones (Apple A17/M-series, Snapdragon 8 Gen 3).</li>
      </ul>

      <h2>GDDR6 / GDDR6X: GPU Bandwidth</h2>
      <p>
        Graphics DDR is engineered for maximum bandwidth at moderate cost. A GPU pairs 8–12 GDDR6
        chips on a 256–384 bit bus. Each chip has a 32-bit wide bus, giving 256 bits total for
        8 chips. The 16 Gbit (2 GB) die capacity means 8 chips = 16 GB — typical for mid-to-high
        GPU configurations.
      </p>

      <GDDRDiagram />

      <h3>WCK and PAM4 in GDDR6</h3>
      <p>
        GDDR6 introduced the <strong>WCK</strong> (write clock) — a separate clock that runs at
        2× the data rate. While the CK (command clock) runs at the base frequency, WCK clocks
        the DQ data path at 2× for better signal integrity. Effectively, the data interface has
        its own faster strobe, decoupled from the command timing.
      </p>
      <p>
        <strong>GDDR6X</strong> (used in NVIDIA RTX 3090/4090) replaces NRZ (two-level)
        signaling with <strong>PAM4</strong> (four-level pulse amplitude modulation). PAM4
        encodes 2 bits per symbol, doubling data throughput at the same signal rate. The trade-off
        is a 9.5 dB SNR penalty — PAM4 eyes are 3× smaller than NRZ eyes, requiring sophisticated
        equalization. GDDR6X reaches 21 Gbps per pin vs GDDR6's 16 Gbps.
      </p>

      <h2>Choosing the Right DRAM</h2>
      <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dram-surface">
              <th className="text-left p-3 text-dram-muted font-semibold">If you need...</th>
              <th className="text-left p-3 text-dram-muted font-semibold">Use</th>
              <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">Why</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Large addressable memory (8–128 GB)', 'DDR5 DIMM', 'Largest capacity, standard socket, ECC options'],
              ['Battery-powered device', 'LPDDR5X', 'Power modes, PoP packaging, dynamic voltage scaling'],
              ['GPU rendering / AI inference', 'GDDR6 / GDDR6X', 'Widest bus at lowest cost per GB/s for medium capacities'],
              ['AI training / HPC (BW > capacity)', 'HBM3 / HBM3E', 'Highest bandwidth/watt, but expensive and fixed capacity'],
              ['Embedded / IoT (low power, tiny)', 'LPDDR4 / LPDDR5', 'Smallest packages, lowest standby power'],
            ].map(([need, use, why], i) => (
              <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                <td className="p-3 text-dram-text">{need}</td>
                <td className="p-3 font-bold text-dram-blue">{use}</td>
                <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Data Bus Inversion (DBI)</h2>
      <p>
        DDR4 and DDR5 both support DBI — a power reduction technique. When more than 4 out of 8
        bits in a byte would be driven LOW (which costs more power than HIGH in POD signaling),
        the transmitter instead inverts all 8 bits and sets a DBI flag. The receiver un-inverts
        on the fly. Result: the transmitter never drives more than 4 bits LOW per byte, cutting
        DQ switching power by up to 25% on typical workloads. DBI trades one extra control wire
        per byte lane for meaningful power savings.
      </p>

      <LessonNav lessonId={9} onComplete={() => markComplete(9)} />
    </div>
  )
}
