import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import DecoderViz from '../../visualizations/level2/DecoderViz'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_03() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 03 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Row &amp; Column Decoder Design</h1>
        <p className="text-dram-muted mt-2">NAND-based row decoding, address predecoding, and column pass-gate multiplexers</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 5 (Read Operation) you
        saw RAS (Row Address Strobe) selecting a row and CAS (Column Address Strobe) selecting a column.
        The decoder is the circuit that converts the n-bit address into a single active wordline or bitline.
      </div>

      <DecoderViz />

      <h2>NAND-Based Row Decoder</h2>
      <p>
        A DRAM with 2^n rows needs n address bits to select one of 2^n wordlines. The simplest approach is
        a <strong>full decoder</strong>: one NAND gate per wordline, with each gate's inputs tied to specific
        address bits or their complements. The gate fires (output LOW, which then inverts to HIGH via a
        wordline driver) only when all its inputs match the encoded row number.
      </p>
      <p>
        For 8192 rows (2^13), this means 8192 NAND gates each with 13 inputs. But 13-input NAND gates are
        very slow (high fan-in → long transistor stacks). The solution is <strong>predecoding</strong>.
      </p>

      <h2>Address Predecoding</h2>
      <p>
        Predecoding splits the n-bit address into two or three groups, decodes each group independently,
        and then combines the results with a final NAND:
      </p>
      <ul>
        <li>Split 13 bits into groups of 5+4+4 → generate 32 + 16 + 16 = 64 predecode lines</li>
        <li>Each final wordline NAND has only 3 inputs (one from each predecode group)</li>
        <li>This replaces one 13-input NAND with three 5/4-input decoders + one 3-input NAND</li>
      </ul>
      <p>
        The timing benefit is significant: a 3-input NAND is roughly 3× faster than a 13-input NAND in the
        same technology node. The area overhead from predecode buffers is modest compared to the speed gain.
      </p>

      <div className="rounded-lg p-4 bg-dram-bg border border-dram-border text-xs font-mono my-4 space-y-1">
        <div className="text-dram-blue">// Predecode example for 8 rows (3-bit address)</div>
        <div>A[2:1] → 4 lines: A2·A1, A2·Ā1, Ā2·A1, Ā2·Ā1</div>
        <div>A[0]   → 2 lines: A0, Ā0</div>
        <div>Row k  → NAND(predecode_21[k&gt;&gt;1], predecode_0[k&amp;1])</div>
      </div>

      <h2>Column Decoder: Pass-Gate Multiplexer</h2>
      <p>
        After row activation, all 8192+ columns in the open row drive the sense amplifiers. The column
        address selects one or more sense amp outputs via a <strong>column pass-gate array</strong>:
      </p>
      <ul>
        <li>A column decoder converts the column address to a one-hot select signal</li>
        <li>Each column's sense amp output goes through an NMOS pass transistor</li>
        <li>Only the selected pass transistor is turned on, routing data to the I/O latch</li>
        <li>DDR5's 16n prefetch means 16 column addresses are decoded simultaneously for 16 bits per chip</li>
      </ul>

      <h2>Hot-Carrier Stress and Decoder Reliability</h2>
      <p>
        The wordline driver experiences the highest voltages in the DRAM (Vpp ≈ 2.5–3 V at sub-Vdd
        processes). This creates <strong>hot-carrier injection (HCI)</strong> stress at the drain of the
        wordline driver NMOS, gradually shifting its threshold voltage over billions of write cycles.
      </p>
      <p>
        Reliability engineers use <strong>NBTI (Negative Bias Temperature Instability)</strong> and HCI
        models to guarantee 10-year lifetime at rated voltage and temperature. Key mitigations: limit
        Vpp magnitude, use longer channel PMOS in the driver, and apply reliability screens during test.
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-2 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>Decoder type</div><div>Trade-off</div>
        </div>
        {[
          ['NAND decoder', 'Faster switching, less area, negative logic (inverted output needs driver)'],
          ['NOR decoder', 'Positive logic output, but slower (PMOS stack → higher impedance)'],
          ['Predecoded NAND', 'Best area × speed: 3-input NAND vs. 13-input, at cost of predecode buffers'],
        ].map(([type, tradeoff]) => (
          <div key={type} className="grid grid-cols-2 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{type}</div>
            <div className="text-dram-muted">{tradeoff}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={3} onComplete={() => markComplete(3)} lessons={lessonsL2} />
    </div>
  )
}
