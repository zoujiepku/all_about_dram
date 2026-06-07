import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import FlyByViz from '../../visualizations/level2/FlyByViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_10() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 10 · Cluster D: Signal Integrity &amp; I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DDR Signal Integrity</h1>
        <p className="text-dram-muted mt-2">Fly-by topology, write leveling, read DQS alignment, ZQ calibration, and crosstalk</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 8 (DRAM Evolution) you
        saw that DDR3 introduced fly-by topology for higher speeds. Here we understand why the topology
        matters: signal reflections, per-DIMM propagation delays, and the calibration protocols that
        correct them.
      </div>

      <FlyByViz />

      <h2>The Fly-By Topology</h2>
      <p>
        In DDR4 and DDR5, all signals (CK, CMD/CA, DQ, DQS) travel on a <strong>daisy-chain bus</strong>
        that passes through each DIMM slot in sequence. The key design principle is that the main signal
        line is a controlled-impedance transmission line (typically Z₀ = 50 Ω), and each DIMM connects
        via a short stub.
      </p>
      <p>
        Short stubs (&lt;0.5 inch) create only a small discontinuity in the bus impedance, and the
        resulting reflection is absorbed by on-die termination (ODT) before it can cause signal
        distortion. Long stubs create significant reflections at the junction, effectively creating a
        resonant cavity that limits maximum frequency.
      </p>
      <p>
        T-topology (used in DDR2/DDR3 on some platforms) splits the signal at a midpoint. The symmetric
        geometry ensures equal path lengths to each DIMM, but the T-junction creates a large reflection
        that limits bandwidth to ~533 MT/s, explaining why DDR3 moved to fly-by for speeds above 1866 MT/s.
      </p>

      <h2>Write Leveling</h2>
      <p>
        In fly-by topology, the clock signal (CK) and the data strobe (DQS) both travel the daisy chain.
        However, because they travel the same path, the clock arrives at each DIMM with a progressively
        larger delay (DIMM 4 sees CK ~3–4 ns later than DIMM 1). If DQS is generated from the
        controller's internal clock, it will be out of phase with the delayed CK seen by distant DIMMs.
      </p>
      <p>
        <strong>Write leveling</strong> (JEDEC DDR3+): Each rank individually adjusts its DQS output
        phase by sampling a training pattern. The DRAM feeds back whether the DQS edge is before or after
        the CK edge, and the controller adjusts a per-rank DQS delay until they align.
      </p>

      <h2>Read DQS Alignment</h2>
      <p>
        During reads, the DRAM drives DQS centered in the middle of each data bit (center-aligned DQS).
        The controller must delay its DQS capture to account for the round-trip propagation delay. A
        <strong>DQS gate training</strong> sequence finds the DQS preamble and aligns the capture window.
      </p>
      <p>
        DDR5 replaces gated DQS with a registered DQS scheme where the DQ-to-DQS relationship is
        more tightly defined, simplifying read training.
      </p>

      <h2>ZQ Calibration</h2>
      <p>
        The output driver impedance (Rout) and on-die termination (Rtt) of DDR SDRAM chips must match
        the PCB trace impedance (~50 Ω) to minimize reflections. However, they drift with temperature
        and voltage. <strong>ZQ calibration</strong> uses an external precision resistor (ZQCS pin,
        typically 240 Ω) as a reference to periodically re-calibrate the internal driver impedances,
        running for tZQCS = 64 ns (short) or tZQCL = 320 ns (long).
      </p>

      <h2>Crosstalk and Guard Bands</h2>
      <p>
        DDR buses run at high speeds with narrow trace spacing on multilayer PCBs. Adjacent signal lines
        act as coupled transmission lines: switching on an <strong>aggressor</strong> trace induces a
        voltage spike on a parallel <strong>victim</strong> trace through capacitive (forward) and
        inductive (backward) coupling.
      </p>
      <p>
        At DDR5-6400 (3.2 GHz), crosstalk-induced noise can be 30–50 mV — significant compared to the
        ~120 mV voltage swing. PCB designers apply <strong>guard bands</strong>: extra spacing between
        critical signal pairs, routing differential signals (CK+/CK−, DQS+/DQS−) to cancel common-mode
        noise.
      </p>

      <LessonNav lessonId={10} onComplete={() => markComplete(10)} lessons={lessonsL2} />
    </div>
  )
}
