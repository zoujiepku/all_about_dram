import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import ECCSim from '../../visualizations/level2/ECCSim'
import { lessonsL2 } from '../../data/lessonsL2'

export default function L2_08() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 08 · Cluster C: Reliability &amp; Security</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">ECC Architectures</h1>
        <p className="text-dram-muted mt-2">SECDED Hamming codes, parity matrix, Chipkill, on-die ECC in DDR5</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 connection:</strong> In Module 9 (Modern DRAM) you saw
        that DDR5 includes on-die ECC. Here we build the Hamming code from scratch: how many parity bits
        are needed, how the syndrome localizes an error, and why Chipkill needs ×4 devices.
      </div>

      <ECCSim />

      <h2>Why 8 Parity Bits for 64 Data Bits?</h2>
      <p>
        To build a <strong>SECDED (Single Error Correct, Double Error Detect)</strong> code for n data bits,
        we need r parity bits satisfying:
      </p>
      <p>
        <code>2^r ≥ n + r + 1</code>
      </p>
      <p>
        For n = 64: with r = 7, we get 2^7 = 128 ≥ 64 + 7 + 1 = 72 ✓. But SECDED also needs one
        overall parity bit to detect (not correct) double-bit errors, giving r = 7 + 1 = <strong>8 parity
        bits</strong>. Hence the 72-bit DIMM bus (64 data + 8 ECC).
      </p>

      <h2>Hamming Code Construction</h2>
      <p>
        Parity bits are placed at power-of-2 bit positions (1, 2, 4, 8, 16, 32, 64). Each parity bit P_i
        checks all bit positions whose binary representation has bit i set:
      </p>
      <ul>
        <li>P_0 (position 1) covers positions 1, 3, 5, 7, 9, 11, … (bit 0 of position = 1)</li>
        <li>P_1 (position 2) covers positions 2, 3, 6, 7, 10, 11, … (bit 1 of position = 1)</li>
        <li>P_2 (position 4) covers positions 4–7, 12–15, 20–23, … (bit 2 of position = 1)</li>
        <li>… and so on</li>
      </ul>
      <p>
        Each P_i is set so that the XOR of all bits it covers (including P_i itself) is zero.
        On receipt, re-computing all parity checks produces a <strong>syndrome</strong>. The syndrome
        bits form a binary number that directly gives the position of the erroneous bit.
      </p>
      <p>
        Example: syndrome = 0b0001011 = 11 decimal → bit 11 is in error → flip it.
      </p>

      <h2>Chipkill: Tolerating a Full Chip Failure</h2>
      <p>
        Standard SECDED corrects one bit per 72-bit word. But if an entire DRAM chip fails (e.g., due to
        a power surge or stuck line), all 8 bits from that chip in the word are simultaneously wrong.
        SECDED cannot correct 8 simultaneous errors.
      </p>
      <p>
        <strong>Chipkill</strong> uses <strong>×4-wide DRAM chips</strong> (4 data pins per chip) instead
        of ×8. With 18 chips × 4 bits = 72 bits, any single chip failure only corrupts 4 bits in the
        word. A stronger ECC code (typically a Reed-Solomon or extended Hamming over 4-bit symbols) can
        detect and correct an entire chip failure.
      </p>
      <p>
        Chipkill is standard in server DIMMs (RDIMMs, LRDIMMs) and mandatory for large-scale data center
        deployments. Consumer DIMMs typically use standard SECDED (×8 chips), which cannot survive a full
        chip failure.
      </p>

      <h2>On-Die ECC in DDR5</h2>
      <p>
        DDR5 mandates on-die ECC (ODECC): each DRAM chip internally uses a SECDED code on its 128-bit
        internal data path. This corrects errors before data reaches the chip's I/O pins, protecting against
        manufacturing-related cell defects and soft errors within the die.
      </p>
      <p>
        ODECC is transparent to the memory controller and operates in addition to (not instead of)
        DIMM-level ECC. The combination provides two independent error-correction layers.
      </p>

      <h2>Memory Scrubbing</h2>
      <p>
        Even with ECC, uncorrected errors accumulate as cells slowly lose charge or cosmic-ray events
        create soft errors. <strong>Memory scrubbing</strong> is a background process that periodically
        reads every memory location, corrects any single-bit errors, and re-writes the corrected data.
        JEDEC recommends scrubbing every <strong>24–72 hours</strong> in server environments. The scrub
        bandwidth overhead is typically &lt;0.1%.
      </p>

      <LessonNav lessonId={8} onComplete={() => markComplete(8)} lessons={lessonsL2} />
    </div>
  )
}
