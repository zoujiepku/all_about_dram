import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import ODTViz from '../../visualizations/level2/ODTViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_11() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 11 · Cluster D: Signal Integrity &amp; I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">I/O Standards &amp; Termination</h1>
        <p className="text-dram-muted mt-2">SSTL-1.2 vs. POD-1.2, on-die termination, SSO noise, and impedance matching</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 9 (Modern DRAM) you saw
        that DDR5 operates at 1.1 V. The I/O standard defines exactly how signals are driven and
        terminated at that voltage — what levels mean '1' and '0', and how to prevent signal distortion.
      </div>

      <ODTViz />

      <h2>SSTL-1.2: Stub Series Terminated Logic</h2>
      <p>
        DDR3 uses SSTL-1.5 and DDR4 uses <strong>SSTL-1.2</strong> for the command/address bus. Key
        characteristics:
      </p>
      <ul>
        <li><strong>Vddq = 1.2 V</strong> supply for I/O circuits</li>
        <li>Output driver: push-pull CMOS. When driving '1', PMOS pulls DQ to Vddq; when driving '0', NMOS pulls to GND</li>
        <li>Nominal output impedance: ~34 Ω (to limit current when the driver slews)</li>
        <li>Termination: on-die Rtt connected to Vddq/2 (pseudo-differential)</li>
        <li>Valid '1': V_DQ &gt; V_IH = 0.6 × Vddq; Valid '0': V_DQ &lt; V_IL = 0.4 × Vddq</li>
      </ul>

      <h2>POD-1.2: Pseudo Open Drain</h2>
      <p>
        DDR4 DQ/DQS and DDR5 use <strong>POD-1.2</strong> for the data bus. The key difference from SSTL:
      </p>
      <ul>
        <li>Output driver: <strong>open drain only</strong> — only the pull-down NMOS is present; pull-up is provided entirely by the on-die termination resistor (Rtt) connected to Vddq</li>
        <li>Driving '1': output tri-states; Rtt pulls DQ to Vddq passively</li>
        <li>Driving '0': NMOS pulls DQ to GND against Rtt</li>
        <li>This eliminates the PMOS driver, reducing simultaneous switching output (SSO) noise from the pull-up network</li>
      </ul>
      <p>
        The power reduction is significant: POD dissipates power only when driving a '0' (one-sided
        termination); SSTL dissipates power on both '0' and '1' transitions via the DC termination path.
      </p>

      <h2>On-Die Termination (ODT) Timing</h2>
      <p>
        ODT must be enabled on the receiving DRAM(s) during writes and disabled during reads (to avoid
        loading the DQ bus). The JEDEC specification defines:
      </p>
      <ul>
        <li><strong>tAON/tAOF:</strong> ODT enable/disable latency from the ODT command to when Rtt is effective</li>
        <li><strong>Dynamic ODT (dODT):</strong> DDR3/4/5 allow ODT to switch automatically based on write commands without explicit ODT commands, using smaller values during write recovery to reduce bus loading</li>
      </ul>

      <h2>Simultaneous Switching Output (SSO) Noise</h2>
      <p>
        When multiple DQ bits switch simultaneously (a full 64-bit bus transition), the collective
        di/dt through package inductance creates a voltage spike on the Vddq and VSS supply rails.
        This is <strong>SSO noise</strong>, also called simultaneous switching noise (SSN) or delta-I noise.
      </p>
      <p>
        For DDR5 at 6400 MT/s with 64 simultaneous output drivers, SSO noise can reach 100–200 mV.
        Mitigations include:
      </p>
      <ul>
        <li>Distributed on-package decoupling capacitors to absorb di/dt</li>
        <li>Multiple Vddq/VSS balls to reduce package inductance</li>
        <li>Controlled output slew rates (trading edge speed for lower SSO)</li>
        <li>POD output standard (half the SSO vs. push-pull for '1'→'0' transitions)</li>
      </ul>

      <h2>Power Plane Resonance</h2>
      <p>
        The PCB power and ground planes form a parallel plate capacitor with an inductance between them,
        creating an LC resonance. At resonant frequencies (typically 300 MHz–3 GHz depending on board
        dimensions), the plane impedance peaks, amplifying SSO noise. PCB designers add decoupling
        capacitors to shift resonances away from the operating frequency range and damp the peaks.
      </p>

      <LessonNav lessonId={11} onComplete={() => markComplete(11)} lessons={lessonsL2} />
    </div>
  )
}
