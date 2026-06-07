import { useOutletContext } from 'react-router-dom'
import LessonNav from '../components/LessonNav'
import MOSFETViz from '../visualizations/MOSFETViz'

function CapacitorViz() {
  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        Capacitor — charge storage
      </h3>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <svg width="180" height="120" viewBox="0 0 180 120">
          <rect x="30" y="20" width="120" height="14" rx="2" fill="#3b82f6" opacity="0.8"/>
          <text x="90" y="31" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+ + + + + +</text>
          <rect x="30" y="37" width="120" height="20" rx="1" fill="#fde68a" opacity="0.5"/>
          <text x="90" y="50" textAnchor="middle" fill="#78350f" fontSize="9">dielectric (insulator)</text>
          <rect x="30" y="60" width="120" height="14" rx="2" fill="#3b82f6" opacity="0.8"/>
          <text x="90" y="71" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">– – – – – –</text>
          <text x="90" y="100" textAnchor="middle" fill="#f59e0b" fontSize="13" fontFamily="monospace" fontWeight="bold">C = k × A / d</text>
          <text x="90" y="113" textAnchor="middle" fill="#64748b" fontSize="9">k=dielectric constant, A=area, d=spacing</text>
        </svg>
        <div className="text-sm text-dram-muted space-y-2 flex-1">
          <p>A capacitor stores charge between two conductive plates separated by a dielectric.</p>
          <p>Capacitance <code>C</code> increases with: larger plate area, thinner dielectric, higher dielectric constant k.</p>
          <p>In DRAM, the capacitor is built as a tall vertical cylinder to maximize surface area within a tiny footprint — today's capacitors are <strong>40–100× taller than their diameter</strong> (aspect ratio 40–100:1).</p>
        </div>
      </div>
    </div>
  )
}

function LeakageDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        NMOS Leakage — what drains the capacitor
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: 'Subthreshold Leakage',
            color: '#ef4444',
            magnitude: 'pA–nA',
            dominant: true,
            desc: 'Current flows from drain to source even when V_GS < V_th. Grows exponentially with temperature. The dominant retention-limiting mechanism at sub-65 nm nodes.',
            formula: 'I_sub ∝ exp(V_GS / nV_T)',
          },
          {
            name: 'Gate Oxide Tunneling',
            color: '#f59e0b',
            magnitude: 'fA–pA',
            dominant: false,
            desc: 'Electrons quantum-mechanically tunnel through the gate oxide into the channel. Significant only below ~2 nm oxide thickness. DRAM uses thicker oxides to suppress this.',
            formula: 'I_tunnel ∝ exp(−α × t_ox)',
          },
          {
            name: 'p-n Junction Leakage',
            color: '#3b82f6',
            magnitude: 'fA–pA',
            dominant: false,
            desc: 'The storage node forms a reverse-biased junction with the p-type substrate. Thermally generated electron-hole pairs cause a small reverse saturation current.',
            formula: 'I_j = I_0(e^{qV/kT} - 1)',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono" style={{ color: item.color }}>{item.magnitude}</span>
              {item.dominant && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: item.color + '22', color: item.color }}>Dominant</span>}
            </div>
            <p className="text-xs text-dram-muted mb-2">{item.desc}</p>
            <div className="text-xs font-mono text-dram-muted bg-dram-bg rounded px-2 py-1">{item.formula}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CapacitorEvolution() {
  const nodes = [
    { node: '180 nm (2001)', structure: 'Stacked cap', material: 'Si₃N₄/SiO₂', k: 7, height: '~800 nm', cs: '~25 fF' },
    { node: '90 nm (2005)', structure: 'Crown cap', material: 'Al₂O₃', k: 9, height: '~1200 nm', cs: '~22 fF' },
    { node: '40 nm (2012)', structure: 'Cylinder cap', material: 'HfO₂/ZrO₂', k: 20, height: '~1800 nm', cs: '~18 fF' },
    { node: '16 nm (2019)', structure: 'Tall cylinder', material: 'ZrO₂/Al₂O₃/ZrO₂', k: 40, height: '~3500 nm', cs: '~12–16 fF' },
    { node: '10 nm (2024)', structure: 'Very tall cylinder', material: 'ZAZ/TiN', k: '>45', height: '~4500 nm', cs: '~10–14 fF' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">Node</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Structure</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Dielectric</th>
            <th className="text-left p-3 text-dram-muted font-semibold">k value</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Cap height</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Cs</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((n, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono text-dram-amber">{n.node}</td>
              <td className="p-3 text-dram-muted">{n.structure}</td>
              <td className="p-3 font-mono text-dram-blue">{n.material}</td>
              <td className="p-3 font-mono text-dram-green">{n.k}</td>
              <td className="p-3 font-mono text-dram-muted">{n.height}</td>
              <td className="p-3 font-mono text-dram-text font-bold">{n.cs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MOSFETExplainer() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        NMOS Operation — three regions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            name: 'Cutoff (OFF)',
            cond: 'V_GS < V_th',
            color: '#64748b',
            desc: 'No channel forms. Only tiny leakage current flows. The cell capacitor is isolated from the bitline.',
            use: 'Wordline LOW → cell isolated',
          },
          {
            name: 'Saturation',
            cond: 'V_GS > V_th, V_DS > V_GS − V_th',
            color: '#f59e0b',
            desc: 'Channel is pinched off at drain. Current is controlled only by V_GS. Acts as a current source.',
            use: 'Early in WL rise — transitional',
          },
          {
            name: 'Linear (ON)',
            cond: 'V_GS > V_th, V_DS < V_GS − V_th',
            color: '#22c55e',
            desc: 'Full channel from source to drain. Resistance drops as V_GS increases. Cell connects to bitline.',
            use: 'Wordline fully HIGH → read/write',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="text-xs font-mono text-dram-muted mb-2">{item.cond}</div>
            <p className="text-xs text-dram-muted mb-2">{item.desc}</p>
            <div className="text-xs bg-dram-bg rounded px-2 py-1 font-mono" style={{ color: item.color }}>{item.use}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        The wordline voltage must be boosted to Vpp ≈ 2.5–3 V (wordline boosting) to ensure the
        transistor operates fully in the linear region during both read and write. At Vdd = 1.2 V,
        V_GS = 1.2 V and V_th ≈ 0.5 V, so V_GS − V_th = 0.7 V. Writing a '1' to the cap brings
        V_cap → Vdd = 1.2 V, which means V_DS → 0 — only possible if V_GS (the wordline) is
        above Vdd + V_th ≈ 1.7 V. Hence Vpp is needed.
      </p>
    </div>
  )
}

export default function L02() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 02</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Semiconductor Basics</h1>
        <p className="text-dram-muted mt-2">The transistors and capacitors that make DRAM possible — and why their properties define DRAM behavior</p>
      </div>

      <h2>Binary Storage in Silicon</h2>
      <p>
        Digital systems store information as <strong>bits</strong> — values that are either 0 or 1.
        In DRAM, a bit is represented as the presence or absence of electric charge on a capacitor.
        A capacitor charged to approximately Vdd (1.2 V in DDR5) represents logic <strong>1</strong>;
        near 0 V represents logic <strong>0</strong>. The exact threshold is Vdd/2 (0.6 V) — if the
        capacitor is above this, it's a 1; below, it's a 0.
      </p>

      <h2>The MOSFET: A Voltage-Controlled Switch</h2>
      <p>
        The transistor in each DRAM cell is an <strong>NMOS MOSFET</strong> (N-type Metal-Oxide-Semiconductor
        Field-Effect Transistor). It has three terminals:
      </p>
      <ul>
        <li><strong>Gate</strong>: the control input — connected to the wordline. Voltage here controls whether the transistor is on or off.</li>
        <li><strong>Source</strong>: connected to the bitline. When the transistor is on, charge flows between source and drain.</li>
        <li><strong>Drain</strong>: connected to the storage capacitor. The capacitor stores charge on this node.</li>
      </ul>
      <p>
        The key parameter is <strong>V_th</strong> (threshold voltage): the gate voltage above which
        the transistor turns on. Typical V_th for DRAM access transistors ≈ 0.5–0.7 V. When the gate
        voltage is below V_th, the transistor is off and the capacitor is isolated. When gate exceeds
        V_th, a conducting channel forms between source and drain.
      </p>

      <MOSFETViz />

      <h2>The Three Operating Regions</h2>
      <MOSFETExplainer />

      <h2>The Body Effect: Why Wordline Boosting Is Needed</h2>
      <p>
        The threshold voltage V_th is not constant — it <strong>increases</strong> as the transistor's
        source voltage rises. This is the <strong>body effect</strong>:
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>V_th(V_SB) = V_th0 + γ × (√(2φ_F + V_SB) − √(2φ_F))</div>
        <div className="text-dram-muted mt-2">V_th0 ≈ 0.5V, γ ≈ 0.5V^0.5, φ_F ≈ 0.35V for typical DRAM NMOS</div>
        <div className="text-dram-muted mt-1">When writing '1': source voltage → Vdd = 1.2V → V_th rises to ~0.7–0.8V</div>
      </div>
      <p>
        When the capacitor charges toward Vdd = 1.2 V during a write, the source terminal (at the
        cap) rises. The body effect raises V_th, causing the transistor to partially turn off before
        the capacitor fully charges. To prevent this, the wordline is boosted to Vpp ≈ 2.5–3 V,
        ensuring V_GS remains well above V_th throughout the entire write cycle.
      </p>
      <p>
        Conversely, during standby (WL = 0), DRAM uses a <strong>negative wordline</strong>
        (nWL ≈ −0.5 V). The negative gate voltage increases V_GS backward, suppressing subthreshold
        leakage and extending retention by roughly 10×.
      </p>

      <h2>The Capacitor: Charge Storage</h2>
      <p>
        The DRAM capacitor must hold enough charge that the sense amplifier can reliably detect
        it after charge-sharing with the bitline. The required minimum charge is about 10–20 fC
        (femtocoulombs). Since Q = C × V and V ≈ 0.6 V (half of Vdd), we need C ≥ 17–33 fF.
      </p>
      <p>
        <code>C = k × ε₀ × A / d</code> — capacitance increases with dielectric constant k,
        plate area A, and decreasing plate separation d.
      </p>

      <CapacitorViz />

      <h2>How DRAM Capacitors Have Evolved</h2>
      <p>
        As process nodes shrink, the cell footprint shrinks — but the required charge does not.
        Engineers fight this with two tools: <strong>high-k dielectrics</strong> (replacing SiO₂ at
        k=3.9 with ZrO₂-based stacks at k=40–50) and <strong>taller cylinders</strong> (increasing
        plate area by going vertical rather than horizontal):
      </p>

      <CapacitorEvolution />

      <p>
        At 10 nm nodes, the cylindrical capacitor stands ~4.5 µm tall on a cell footprint of
        ~40 nm × 40 nm — an aspect ratio of over 100:1. Manufacturing these structures requires
        atomic-layer deposition (ALD) of conformal dielectric films that coat the inside of the
        cylinder uniformly, and titanium nitride (TiN) electrodes deposited via ALD to fill
        the narrow cylinder without voids.
      </p>

      <h2>Leakage: The Enemy of Retention</h2>
      <p>
        The transistor must hold charge on the capacitor for 64 ms between refreshes. But no
        transistor is a perfect switch — three leakage mechanisms drain the capacitor continuously:
      </p>

      <LeakageDiagram />

      <p>
        Subthreshold leakage is the limiting factor. It follows an exponential relationship with
        both V_GS and temperature. At room temperature, combined leakage is approximately
        <strong>100–200 fA</strong> (femtoamperes) per cell — calibrated to drain the 20 fF
        capacitor from Vdd to Vdd/2 in ~64 ms: Q = C × ΔV = 20 fF × 0.6 V = 12 fC;
        t = 12 fC ÷ 180 fA ≈ 67 ms. At 85°C, leakage grows 8–16× (Arrhenius), cutting
        retention to 4–8 ms.
      </p>

      <h2>Putting It Together: 1T1C</h2>
      <p>
        One NMOS transistor (the access transistor) + one capacitor (the storage capacitor) =
        a complete DRAM bit cell. The transistor gate connects to the wordline, controlling access.
        The transistor source connects to the bitline, carrying data in/out. The transistor drain
        connects to the capacitor bottom plate; the top plate is tied to Vdd/2 as a reference.
      </p>
      <p>
        Every DRAM property we study — destructive reads (charge sharing), periodic refresh (leakage),
        wordline boosting (body effect), timing constraints (RC settling, SA resolution time) —
        traces directly back to the physics of this one transistor and one capacitor.
      </p>

      <LessonNav lessonId={2} onComplete={() => markComplete(2)} />
    </div>
  )
}
