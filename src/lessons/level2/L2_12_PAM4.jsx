import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import EyeDiagramViz from '../../visualizations/level2/EyeDiagramViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_12() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 12 · Cluster D: Signal Integrity &amp; I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">PAM4 &amp; Equalization</h1>
        <p className="text-dram-muted mt-2">NRZ vs. PAM4 encoding, SNR penalty, CTLE/DFE equalization, and eye diagram analysis</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 9 (Modern DRAM) you saw
        that GDDR6 uses PAM4 encoding. Here we explain the fundamental signal theory: why PAM4 provides
        2× bits per symbol, what it costs in noise immunity, and how CTLE and DFE equalization recover the
        lost margin.
      </div>

      <EyeDiagramViz />

      <h2>NRZ vs. PAM4</h2>
      <p>
        Traditional DDR uses <strong>NRZ (Non-Return-to-Zero)</strong> encoding: each symbol is either
        high (bit 1) or low (bit 0). To double throughput without doubling the clock frequency, GDDR6
        and SerDes interfaces use <strong>PAM4 (Pulse Amplitude Modulation with 4 levels)</strong>:
      </p>
      <ul>
        <li>4 voltage levels: L0 (00), L1 (01), L2 (10), L3 (11)</li>
        <li>Each symbol transmits 2 bits: 1 log₂(4) = 2 bits/symbol</li>
        <li>Same symbol rate as NRZ → 2× data throughput</li>
        <li>GDDR6 WCK clock runs at 2× data rate (WCK:CK = 4:1 domain boundary)</li>
      </ul>

      <h2>The SNR Penalty</h2>
      <p>
        The cost of PAM4 is a significantly reduced noise margin. In NRZ, the eye height spans the full
        signal swing (V_swing). In PAM4 with 4 levels equally spaced over the same swing:
      </p>
      <ul>
        <li>Each of the 3 eyes has height = V_swing / 3</li>
        <li>This is 1/3 of NRZ's eye height</li>
        <li>In dB: 20 log₁₀(1/3) ≈ −9.5 dB SNR penalty</li>
      </ul>
      <p>
        For the same bit error rate (BER), PAM4 requires <strong>~9.5 dB better channel SNR</strong>
        than NRZ. This is why PAM4 is only viable with sophisticated equalization and is used at shorter
        distances (on-package or short PCB runs, e.g., GDDR6 packages).
      </p>

      <h2>Channel Loss and Inter-Symbol Interference</h2>
      <p>
        PCB traces and package interconnects behave as low-pass filters at multi-GHz frequencies: signal
        loss increases roughly as √f due to the skin effect (current concentrates near the conductor
        surface). This causes <strong>inter-symbol interference (ISI)</strong>: energy from a symbol
        smears into the adjacent symbols, "closing" the eye horizontally.
      </p>
      <p>
        At 16 Gbaud (GDDR6 data rate), a 2-inch PCB trace introduces ~6–10 dB of insertion loss.
        Without equalization, the eye would be nearly closed.
      </p>

      <h2>CTLE: Continuous Time Linear Equalizer</h2>
      <p>
        CTLE is an analog high-pass filter at the receiver that inverts the channel's frequency roll-off.
        Where the channel attenuates high frequencies, CTLE boosts them, restoring the amplitude
        relationship between high and low frequency components of the signal.
      </p>
      <p>
        CTLE has a fixed frequency response determined by a peaking frequency and gain. For a given channel,
        the optimal CTLE setting is determined during initialization training. A single CTLE tap provides
        first-order compensation (~6 dB/octave roll-off).
      </p>

      <h2>DFE: Decision Feedback Equalizer</h2>
      <p>
        CTLE is a linear filter — it boosts high-frequency noise along with the signal. DFE removes ISI
        non-linearly and without noise amplification:
      </p>
      <ol>
        <li>Make a hard decision on the current symbol (decide which of the 4 levels it is)</li>
        <li>Use the decided symbol to compute the ISI it would inject into the <em>next</em> symbol</li>
        <li>Subtract that predicted ISI from the next sample before making the next decision</li>
      </ol>
      <p>
        DFE operates on past decisions — which are essentially error-free if the BER is low — so it removes
        ISI without amplifying noise. The trade-off: DFE is causal and cannot remove ISI from
        <em>future</em> symbols (pre-cursor ISI must be handled by CTLE or FFE at the transmitter).
      </p>

      <h2>Jitter Components</h2>
      <p>
        Total jitter (Tj) determines how much the eye opening shrinks in the time domain:
      </p>
      <p>
        <code>Tj = Dj + n·σRj (at BER = 10⁻¹²)</code>
      </p>
      <ul>
        <li><strong>Dj (Deterministic Jitter):</strong> Bounded, reproducible: ISI, duty-cycle distortion, power supply modulation. Measured as peak-to-peak value.</li>
        <li><strong>Rj (Random Jitter):</strong> Unbounded Gaussian distribution from thermal noise and flicker noise. Characterized by σ (standard deviation). At BER=10⁻¹², n = 14.</li>
      </ul>
      <p>
        For GDDR6 at 16 Gbaud (62.5 ps per bit), Tj budget is typically 0.2–0.3 UI (12–19 ps) total,
        split roughly 0.1 UI Dj + 0.1–0.15 UI Rj.
      </p>

      {/* Completion card */}
      <div className="mt-8 rounded-xl p-6 bg-gradient-to-br from-dram-blue/10 to-dram-green/10 border border-dram-blue/30 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <h3 className="text-xl font-bold text-dram-text mb-2">Level 2 Complete!</h3>
        <p className="text-dram-muted text-sm">
          You've covered all four advanced clusters: circuit design, system architecture,
          reliability &amp; security, and signal integrity. You now have engineering-depth
          understanding of how DRAM works from transistor to system.
        </p>
      </div>

      <LessonNav lessonId={12} onComplete={() => markComplete(12)} lessons={lessonsL2} />
    </div>
  )
}
