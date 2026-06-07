import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import RankDiagram from '../../visualizations/level2/RankDiagram'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_05() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 05 · Cluster B: System Architecture</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Ranks, DIMMs &amp; Channels</h1>
        <p className="text-dram-muted mt-2">72-bit bus structure, rank multiplexing, tRTRS, and dual-channel interleaving</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 9 (Modern DRAM) you saw
        that DDR5 has two 32-bit subchannels and that DIMMs use 72-bit buses. Here we unpack the electrical
        and timing details: how multiple chips and ranks share the bus, and what prevents them from colliding.
      </div>

      <RankDiagram />

      <h2>DIMM Bus Structure: 72 = 64 + 8</h2>
      <p>
        A standard UDIMM (unbuffered DIMM) presents a <strong>72-bit bus</strong> to the memory controller:
        64 data bits + 8 ECC bits. Each DRAM chip on the DIMM contributes a fixed number of data pins:
      </p>
      <ul>
        <li><strong>×8 chips</strong> (most common): 9 chips per side × 8 data pins = 72 bits</li>
        <li><strong>×4 chips</strong> (ECC servers): 18 chips per side × 4 data pins = 72 bits; allows Chipkill</li>
        <li><strong>×16 chips</strong> (low-cost SODIMMs): fewer chips, no ECC</li>
      </ul>
      <p>
        DDR5 splits the 64-bit channel into <strong>two independent 32-bit subchannels</strong> (each with
        its own CMD/CA bus), doubling command bandwidth and allowing finer-grained bank scheduling.
      </p>

      <h2>Ranks: Multiplexing Capacity on One Channel</h2>
      <p>
        A <strong>rank</strong> is a group of DRAM chips that respond to the same chip-select (CS) signal
        and together provide the full 72-bit bus width. A dual-rank DIMM has two ranks sharing the same
        address and data pins but with separate CS# lines.
      </p>
      <p>
        At any moment only one rank drives the DQ bus. Switching between ranks requires the outgoing rank
        to tri-state its DQ drivers before the incoming rank asserts. This guard time is called
        <strong> tRTRS (rank-to-rank switching time)</strong> — typically 1–2 clock cycles (≈7.5 ns at
        DDR4-3200).
      </p>
      <p>
        tRTRS is why dual-rank DIMMs have slightly lower sustained bandwidth than single-rank: the controller
        must insert dead cycles when alternating between ranks.
      </p>

      <h2>Dual and Quad-Channel Interleaving</h2>
      <p>
        Modern platforms support multiple independent memory channels. A dual-channel controller has two
        separate 72-bit buses each attached to their own DIMMs, effectively doubling bandwidth:
      </p>
      <ul>
        <li>DDR4-3200 single channel: 3200 × 8 bytes = 25.6 GB/s</li>
        <li>DDR4-3200 dual channel: 51.2 GB/s</li>
        <li>DDR5-6400 dual channel: 102.4 GB/s</li>
      </ul>
      <p>
        The OS and memory controller interleave cache lines across channels at a granularity of 64 or 128
        bytes, so sequential accesses alternate between channels and benefit from both simultaneously.
      </p>

      <h2>NUMA Effects</h2>
      <p>
        In multi-socket server systems, each CPU socket has its own memory channels. Accessing memory
        attached to a remote socket crosses the inter-socket interconnect (e.g., UPI or Infinity Fabric),
        adding 30–80 ns of latency and reducing bandwidth. This <strong>Non-Uniform Memory Access (NUMA)</strong>
        topology requires OS and application awareness to co-locate threads with their data.
      </p>

      <div className="rounded-lg p-4 bg-dram-bg text-xs font-mono space-y-1 mt-4">
        <div className="text-dram-blue">// Rank switching timing</div>
        <div>tRTRS  = rank-to-rank switch = ~7.5 ns (1–2 ck)</div>
        <div>tODTL  = ODT latency (ODT switches with rank switch)</div>
        <div>tCCD_L = CAS-to-CAS within same bank group = 5 ck (DDR4)</div>
        <div>tCCD_S = CAS-to-CAS different bank group = 4 ck (DDR4)</div>
      </div>

      <LessonNav lessonId={5} onComplete={() => markComplete(5)} lessons={lessonsL2} />
    </div>
  )
}
