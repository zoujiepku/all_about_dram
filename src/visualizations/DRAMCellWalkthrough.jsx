import { useState } from 'react'

const VDD = 1.2
const HALF = 0.6
const Cs = 20    // fF — cell capacitor
const Cbl = 200  // fF — bitline capacitor

function veq(capV) {
  return (Cs * capV + Cbl * HALF) / (Cs + Cbl)
}

const VEQ_1 = veq(VDD)   // ≈ 0.6545V (stored '1' charge sharing equilibrium)
const VEQ_0 = veq(0)     // ≈ 0.5455V (stored '0' charge sharing equilibrium)

// ─── Step data ────────────────────────────────────────────────────────────────

function readSteps(stored) {
  const capInit = stored === 1 ? VDD : 0
  const vShared = stored === 1 ? VEQ_1 : VEQ_0
  const dV = Math.round(Math.abs(vShared - HALF) * 1000)

  return [
    {
      label: '① Precharge',
      wlHigh: false, eq: true,  sa: false, saOut: null,
      blV: HALF, capV: capInit, flow: null,
      heading: 'The bitline is charged to exactly Vdd/2 before every access',
      body: `A precharge / equalization circuit drives the bitline (BL) to Vdd/2 = ${HALF}V. The wordline (WL) is LOW, so the NMOS transistor is completely OFF. The storage capacitor is isolated from the outside world and sits quietly at ${capInit}V — its stored charge undisturbed.`,
      formula: `BL = Vdd/2 = ${HALF} V     Cap = ${capInit} V     WL = 0 V`,
      insight: 'Why Vdd/2? It gives equal headroom in both directions — a stored 1 raises BL above 0.6V, a stored 0 lowers it below 0.6V. Any other precharge level would favour one over the other.',
    },
    {
      label: '② Wordline rises',
      wlHigh: true, eq: false, sa: false, saOut: null,
      blV: HALF, capV: capInit, flow: null,
      heading: 'WL is boosted to Vpp ≈ 2.5V — transistor turns ON',
      body: `The memory controller issues an ACT (activate) command. The wordline driver boosts WL to Vpp ≈ 2.5V — well above Vdd. This is necessary because the NMOS transistor can only pass a voltage up to Vwl − Vth ≈ 2.5 − 0.5 = 2.0V; without this boost the transistor would cut off before fully charging the capacitor.\n\nAt this exact moment BL is still ${HALF}V and the storage node is still at ${capInit}V — charge has not moved yet. The cell plate (bottom plate of the capacitor, shown at the base of the diagram) remains fixed at Vdd/2 = 0.6V throughout everything. It is a DC bias, not a signal node. The two capacitor plates are therefore at ${capInit}V (top) and 0.6V (bottom) — ${(capInit - HALF).toFixed(1)}V across the capacitor.`,
      formula: `WL = Vpp ≈ 2.5 V     Transistor: OFF → ON\nStorage node (top plate) = ${capInit} V\nCell plate (bottom plate, fixed) = ${HALF} V\nBL = ${HALF} V  ← will be pulled toward ${capInit} V in next step`,
      insight: 'The cell plate and the precharged BL happen to both be at 0.6V here, but they are different nodes. The cell plate is a fixed reference; the BL is about to be disturbed by charge sharing with the storage node in the next step.',
    },
    {
      label: '③ Charge sharing',
      wlHigh: true, eq: false, sa: false, saOut: null,
      blV: vShared, capV: vShared,
      flow: stored === 1 ? 'up' : 'down',
      heading: `BL ${stored === 1 ? 'rises' : 'falls'} by only ΔV ≈ ${dV} mV`,
      body: `With the transistor conducting, the storage node (top plate of the capacitor, initially ${capInit}V) is now electrically connected to the bitline (initially ${HALF}V). Charge flows between these two nodes until they reach a common equilibrium voltage.\n\nThe cell plate (bottom plate, fixed at ${HALF}V) does not participate — it is held by a DC supply and never moves. Charge conservation on the two free nodes gives:\n\n  V_eq = (Cs × V_SN + Cbl × Vdd/2) / (Cs + Cbl)\n\nwhere V_SN = ${capInit}V is the storage node voltage (not the voltage across the capacitor). Both the storage node and the BL settle to ${vShared.toFixed(4)}V — only ${dV} mV away from Vdd/2.\n\nImportant: the voltage across the capacitor (top plate − bottom plate) was ${(capInit - HALF).toFixed(1)}V before charge sharing and is now only ${(vShared - HALF).toFixed(4)}V after. Most of the original charge was absorbed by the large Cbl (${Cbl} fF vs Cs ${Cs} fF).`,
      formula: `V_eq = (Cs × V_SN + Cbl × Vdd/2) / (Cs + Cbl)\n     = (${Cs} × ${capInit} + ${Cbl} × ${HALF}) / (${Cs + Cbl})\n     = ${vShared.toFixed(4)} V\n\nΔV from Vdd/2 = ${vShared.toFixed(4)} − ${HALF} = ${(vShared - HALF).toFixed(4)} V  ≈  ${dV} mV\n\nVoltage across cap: before = ${(capInit - HALF).toFixed(1)} V  →  after = ${(vShared - HALF).toFixed(4)} V`,
      insight: `${dV} mV is all the sense amplifier has to work with. V_SN in the formula is the storage node voltage (top plate), NOT the voltage across the cap. The cell plate (bottom plate) is a fixed ${HALF}V reference that cancels out of the charge-conservation algebra.`,
    },
    {
      label: '④ Sense amp fires',
      wlHigh: true, eq: false, sa: true, saOut: stored,
      blV: stored === 1 ? VDD : 0, capV: vShared, flow: null,
      heading: `SA detects BL ${stored === 1 ? '>' : '<'} Vdd/2 and amplifies to full rail`,
      body: `The sense amplifier compares BL (${vShared.toFixed(3)}V) against BLB (the complementary bitline, still at ${HALF}V). It detects a difference of ${dV} mV — that ${stored === 1 ? 'positive' : 'negative'} shift tells it the stored bit is ${stored}. A cross-coupled latch fires: within 1–2 nanoseconds it amplifies this tiny difference all the way to the power rails. BL → ${stored === 1 ? 'Vdd = 1.2V' : 'GND = 0V'}, BLB → ${stored === 1 ? 'GND = 0V' : 'Vdd = 1.2V'}.`,
      formula: `BL  → ${stored === 1 ? 'Vdd = 1.2 V' : 'GND = 0 V'}\nBLB → ${stored === 1 ? 'GND = 0 V' : 'Vdd = 1.2 V'}`,
      insight: 'The SA is a "winner-take-all" circuit. Whichever side has even 1 mV more wins and gets pulled to Vdd; the loser goes to GND. The stored bit is now reliably on the bitline.',
    },
    {
      label: '⑤ Restore',
      wlHigh: true, eq: false, sa: true, saOut: stored,
      blV: stored === 1 ? VDD : 0, capV: stored === 1 ? VDD : 0,
      flow: stored === 1 ? 'down' : null,
      heading: 'SA drives charge back into the capacitor — bit survives',
      body: `The wordline is still HIGH and BL is now at ${stored === 1 ? '1.2V' : '0V'}. With the transistor still open, current flows back through it and recharges the capacitor from its disturbed level (${vShared.toFixed(3)}V) to the full ${stored === 1 ? '1.2V' : '0V'}. This automatic write-back step is what makes the destructive read non-destructive in the final result. The cell's 64 ms retention clock restarts from a full charge.`,
      formula: `Cap → ${stored === 1 ? 'Vdd = 1.2 V' : 'GND = 0 V'}  (fully restored)\nRetention window restarted`,
      insight: 'Every read silently includes a write-back. This is why tRAS (row active strobe) must be long enough — it covers both the read and the restore before the wordline can close.',
    },
    {
      label: '⑥ Precharge again',
      wlHigh: false, eq: true, sa: false, saOut: null,
      blV: HALF, capV: stored === 1 ? VDD : 0, flow: null,
      heading: 'WL drops LOW — cell isolated, BL reset to Vdd/2',
      body: `The wordline falls to LOW (and then to nWL ≈ −0.5V during standby to suppress leakage). The transistor turns OFF, trapping the fully restored ${stored === 1 ? '1.2V' : '0V'} in the capacitor. The precharge circuit restores BL to Vdd/2 = 0.6V. The cell is ready for the next access — or will be quietly isolated for up to 64 ms before needing refresh.`,
      formula: `WL → nWL ≈ −0.5 V     Cap = ${stored === 1 ? '1.2' : '0'} V (isolated)     BL = 0.6 V`,
      insight: 'The negative wordline (nWL) during standby suppresses leakage through the NMOS transistor by ~10×, directly extending cell retention time.',
    },
  ]
}

function writeSteps(bit) {
  const targetV = bit === 1 ? VDD : 0
  return [
    {
      label: '① Precharge',
      wlHigh: false, eq: true, sa: false, saOut: null,
      blV: HALF, capV: HALF, flow: null,
      heading: 'Same starting state as a read',
      body: 'Write starts identically to a read: BL precharged to 0.6V, wordline LOW. The prior cell state does not matter — the write driver will overpower it regardless.',
      formula: `BL = 0.6 V     WL = 0 V`,
      insight: 'Writing always starts with precharge to ensure a known, clean bitline starting voltage.',
    },
    {
      label: '② WL HIGH + write driver forces BL',
      wlHigh: true, eq: false, sa: false, saOut: null,
      blV: targetV, capV: HALF, flow: null,
      heading: `BL is actively driven to ${bit === 1 ? 'Vdd = 1.2V' : 'GND = 0V'} by the write driver`,
      body: `The wordline rises to Vpp ≈ 2.5V (transistor ON). Unlike a read — where BL is released to float and sense the tiny ΔV — the write driver now actively forces BL to ${bit === 1 ? 'Vdd = 1.2V' : 'GND = 0V'}. The write driver has a much stronger current capability than the tiny capacitor, so it easily overpowers any existing charge.`,
      formula: `WL = Vpp ≈ 2.5 V     BL = ${targetV} V  (forced by write driver)`,
      insight: 'The key difference from a read: BL is driven, not floating. No sense amplifier is needed. The write driver IS the "new data".',
    },
    {
      label: '③ Capacitor charges/discharges',
      wlHigh: true, eq: false, sa: false, saOut: null,
      blV: targetV, capV: targetV * 0.6 + HALF * 0.4,
      flow: bit === 1 ? 'down' : 'up',
      heading: `Current flows ${bit === 1 ? 'into' : 'out of'} the capacitor — wait tWR = 15 ns`,
      body: `Current flows ${bit === 1 ? 'from BL (1.2V), through the transistor, into the capacitor' : 'out of the capacitor, through the transistor, to BL (0V / GND)'}. The controller waits tWR ≈ 15 ns (Write Recovery time) before issuing a precharge. This gives the capacitor time to reach its target voltage. Note: because Vwl − Vth ≈ 2.0V > Vdd = 1.2V, the transistor does NOT cut off — a full 1.2V can be written.`,
      formula: `tWR = 15 ns (DDR4-3200)\nCap charging toward ${targetV} V`,
      insight: 'tWR is why you cannot immediately precharge after a write. The bank stays "busy" for tWR while the capacitor charges.',
    },
    {
      label: '④ WL LOW — write complete',
      wlHigh: false, eq: true, sa: false, saOut: null,
      blV: HALF, capV: targetV, flow: null,
      heading: `Capacitor isolated at ${targetV}V — logic ${bit} stored`,
      body: `After tWR, WL drops to LOW (then to nWL ≈ −0.5V). The transistor turns OFF, locking the new charge in the capacitor. The write driver releases the bitline and the precharge circuit restores BL to 0.6V. The cell now stores logic ${bit} with a fresh 64 ms retention window.`,
      formula: `WL → nWL ≈ −0.5 V     Cap = ${targetV} V  (logic ${bit})     BL = 0.6 V`,
      insight: 'Writing is simpler than reading — no sense amplifier, no restore step. Just drive BL to the target, wait tWR, close the row.',
    },
  ]
}

function refreshSteps() {
  return [
    {
      label: '① REF command issued',
      wlHigh: false, eq: true, sa: false, saOut: null,
      blV: HALF, capV: 0.72, flow: null,
      heading: 'Controller sends a refresh command every 7.8 µs',
      body: `Every 7.8 µs the memory controller issues an AUTO REFRESH (REF) command. The DRAM has an internal row counter that selects the next row — the controller does NOT supply an address. The target cell has been leaking since its last refresh. Its charge has partially dropped (shown here as ~72%) but is still above the 50% threshold needed for correct detection.`,
      formula: `tREFI = 64 ms ÷ 8192 rows = 7.8 µs\nRow counter: row N → row N+1`,
      insight: '8192 rows × 7.8 µs = 63.9 ms ≈ 64 ms. The DRAM handles the scheduling internally; the controller only needs to fire REF every tREFI.',
    },
    {
      label: '② Row activated — same as a read',
      wlHigh: true, eq: false, sa: false, saOut: null,
      blV: HALF + 0.026, capV: 0.72, flow: 'up',
      heading: 'WL HIGH — charge sharing with the partially leaked cell',
      body: `The DRAM activates the selected row internally. WL goes HIGH, the transistor opens, and charge shares between the weakened capacitor and BL. The ΔV is smaller than for a fresh cell (because the capacitor has partially discharged), but as long as charge is above 50%, the sense amplifier can still distinguish a 1 from a 0.`,
      formula: `ΔV_refresh = Cs/(Cs+Cbl) × (0.72 − 0.6) ≈ 11 mV\n(compared to 55 mV for a fresh cell)`,
      insight: 'The 64 ms spec is set so that even the worst-case cells — smallest capacitor, highest leakage temperature — still produce a detectable ΔV at end of the window.',
    },
    {
      label: '③ Sense amp detects and restores',
      wlHigh: true, eq: false, sa: true, saOut: 1,
      blV: VDD, capV: VDD, flow: 'down',
      heading: 'SA fires → cap restored to full 1.2V — retention window restarted',
      body: `The sense amplifier detects the positive ΔV (BL slightly above 0.6V) and correctly identifies a stored '1'. It drives BL to 1.2V. With WL still HIGH, this full 1.2V flows back through the transistor and recharges the capacitor from its depleted 72% all the way to 100%. The cell's 64 ms retention timer resets to zero.`,
      formula: `Cap: 0.72 V → 1.2 V  (fully refreshed)\nRetention window restarted`,
      insight: 'Refresh is not just "extending" the data — it actively restores the capacitor to full charge. A cell at 72% becomes 100% after a refresh cycle.',
    },
    {
      label: '④ Row closed — counter advances',
      wlHigh: false, eq: true, sa: false, saOut: null,
      blV: HALF, capV: VDD, flow: null,
      heading: 'WL LOW, BL precharges — next row queued',
      body: `WL drops LOW (→ nWL). BL precharges to 0.6V. The internal counter increments to the next row. In 7.8 µs, another REF command will refresh that row. After all 8192 rows complete (~64 ms), the counter wraps back to row 0 and the cycle repeats indefinitely while the DRAM is powered.`,
      formula: `Refresh overhead ≈ tRFC / tREFI = 50 ns / 7800 ns ≈ 0.6% per bank\nDDR5 per-bank refresh (pBR) staggers rows to keep other banks accessible`,
      insight: 'Refresh bandwidth overhead is typically 2–4% total (all banks combined). For AI workloads with large matrices, even this small overhead matters.',
    },
  ]
}

// ─── Cell SVG ─────────────────────────────────────────────────────────────────

function CellDiagram({ wlHigh, eq, sa, saOut, blV, capV, flow, isZh = false }) {
  const wlColor      = wlHigh ? '#f59e0b' : '#475569'
  const wlTextColor  = wlHigh ? '#f59e0b' : '#64748b'
  const mosOn        = wlHigh
  const mosFill      = mosOn ? '#f59e0b15' : '#1e293b'
  const mosStroke    = mosOn ? '#f59e0b' : '#475569'
  const saStroke     = sa ? '#22c55e' : '#475569'
  const saFill       = sa ? '#22c55e15' : '#1e293b'
  const eqStroke     = eq ? '#3b82f6' : '#475569'
  const eqFill       = eq ? '#3b82f615' : '#1e293b'
  const capFillFrac  = Math.max(0, Math.min(1, capV / VDD))
  const capFillColor = capV > HALF ? '#22c55e' : '#ef4444'
  const blHigh       = blV > HALF + 0.04
  const blLow        = blV < HALF - 0.04
  const blColor      = blHigh ? '#22c55e' : blLow ? '#ef4444' : '#3b82f6'

  // SVG layout constants
  const BLX = 95    // x of bitline
  const CAP_TOP = 162
  const CAP_H   = 80
  const CAP_W   = 100
  const CAP_X   = BLX - CAP_W / 2  // 45
  const TXN_Y   = 95   // transistor top
  const TXN_H   = 42
  const WIRE_Y1 = TXN_Y + TXN_H  // transistor bottom = 137
  const WIRE_Y2 = CAP_TOP - 4     // just above cap top plate = 158

  return (
    <svg viewBox="0 0 240 295" width="100%" height="auto" style={{ maxWidth: 240 }}>
      {/* ── Sense amplifier box ── */}
      <rect x="115" y="8" width="120" height="50" rx="4"
        fill={saFill} stroke={saStroke} strokeWidth="1.5" />
      <text x="175" y="29" textAnchor="middle" fill={sa ? '#22c55e' : '#94a3b8'} fontSize="10" fontWeight="bold">
        {isZh ? '灵敏放大器 (SA)' : 'Sense Amp (SA)'}
      </text>
      <text x="175" y="44" textAnchor="middle" fill={sa ? '#22c55e' : '#64748b'} fontSize="9">
        {sa
          ? (saOut === 1
              ? (isZh ? '判决 → 1 (Vdd)' : 'resolved → 1 (Vdd)')
              : (isZh ? '判决 → 0 (GND)' : 'resolved → 0 (GND)'))
          : (isZh ? '未激活' : 'inactive')}
      </text>
      {/* SA to BL connection */}
      <line x1={BLX} y1="33" x2="115" y2="33" stroke={saStroke} strokeWidth="1.5" strokeDasharray={sa ? '0' : '4 3'} />

      {/* ── Precharge / EQ box ── */}
      <rect x="10" y="24" width="72" height="28" rx="3"
        fill={eqFill} stroke={eqStroke} strokeWidth="1.5" />
      <text x="46" y="35" textAnchor="middle" fill={eq ? '#93c5fd' : '#64748b'} fontSize="8.5" fontWeight="bold">{isZh ? '预充电' : 'Precharge'}</text>
      <text x="46" y="46" textAnchor="middle" fill={eq ? '#93c5fd' : '#64748b'} fontSize="8">{isZh ? '均衡电路' : 'EQ circuit'}</text>
      {/* EQ to BL */}
      <line x1="82" y1="38" x2={BLX} y2="38" stroke={eqStroke} strokeWidth="1.5" strokeDasharray={eq ? '0' : '4 3'} />

      {/* ── Bitline (vertical wire) ── */}
      <line x1={BLX} y1="8" x2={BLX} y2={TXN_Y}
        stroke={blColor} strokeWidth="2.5" />

      {/* BL voltage label */}
      <text x={BLX + 6} y="75" fill={blColor} fontSize="10" fontWeight="bold">
        BL: {blV.toFixed(3)}V
      </text>
      <circle cx={BLX} cy="70" r="3" fill={blColor} />

      {/* ── Wordline ── */}
      <line x1="10" y1="116" x2="240" y2="116" stroke={wlColor} strokeWidth="2" />
      <text x="12" y="113" fill={wlTextColor} fontSize="9" fontWeight="bold">
        WL = {wlHigh ? 'Vpp ≈ 2.5V' : '0V (LOW)'}
      </text>

      {/* ── NMOS transistor ── */}
      <rect x={BLX - 25} y={TXN_Y} width="50" height={TXN_H} rx="4"
        fill={mosFill} stroke={mosStroke} strokeWidth="2" />
      <text x={BLX} y={TXN_Y + 17} textAnchor="middle"
        fill={mosOn ? '#f59e0b' : '#94a3b8'} fontSize="10" fontWeight="bold">
        NMOS
      </text>
      <text x={BLX} y={TXN_Y + 30} textAnchor="middle"
        fill={mosOn ? '#fbbf24' : '#64748b'} fontSize="9">
        {mosOn ? (isZh ? '导通中' : 'ON — conducting') : (isZh ? '截止 — 隔离' : 'OFF — isolated')}
      </text>

      {/* WL gate connection (small horizontal line into transistor body) */}
      <line x1="10" y1="116" x2={BLX - 25} y2="116" stroke={wlColor} strokeWidth="2" />
      <circle cx={BLX - 25} cy="116" r="3" fill={wlColor} />

      {/* ── Wire transistor → cap ── */}
      <line x1={BLX} y1={WIRE_Y1} x2={BLX} y2={WIRE_Y2}
        stroke={mosOn ? '#94a3b8' : '#475569'} strokeWidth="2" />

      {/* ── Charge flow arrow ── */}
      {flow && (() => {
        const midY = (WIRE_Y1 + WIRE_Y2) / 2
        const arrowColor = '#22c55e'
        if (flow === 'down') {
          // Arrow pointing downward (BL → cap)
          return (
            <g>
              <line x1={BLX + 12} y1={WIRE_Y1 + 4} x2={BLX + 12} y2={WIRE_Y2 - 4}
                stroke={arrowColor} strokeWidth="2" />
              <polygon points={`${BLX + 7},${WIRE_Y2 - 8} ${BLX + 12},${WIRE_Y2} ${BLX + 17},${WIRE_Y2 - 8}`}
                fill={arrowColor} />
              <text x={BLX + 22} y={midY + 4} fill={arrowColor} fontSize="8">{isZh ? '→ 电容' : '→ cap'}</text>
            </g>
          )
        } else {
          // Arrow pointing upward (cap → BL)
          return (
            <g>
              <line x1={BLX + 12} y1={WIRE_Y2 - 4} x2={BLX + 12} y2={WIRE_Y1 + 4}
                stroke={arrowColor} strokeWidth="2" />
              <polygon points={`${BLX + 7},${WIRE_Y1 + 8} ${BLX + 12},${WIRE_Y1} ${BLX + 17},${WIRE_Y1 + 8}`}
                fill={arrowColor} />
              <text x={BLX + 22} y={midY + 4} fill={arrowColor} fontSize="8">{isZh ? '→ 位线' : '→ BL'}</text>
            </g>
          )
        }
      })()}

      {/* ── Capacitor ── */}
      {/* Top plate */}
      <rect x={CAP_X} y={CAP_TOP - 4} width={CAP_W} height="8" rx="2"
        fill="#334155" stroke="#64748b" strokeWidth="1.5" />
      {/* Fill area */}
      <rect x={CAP_X} y={CAP_TOP + 4} width={CAP_W} height={CAP_H - 4} fill="#0f172a" />
      {/* Charge fill */}
      <rect x={CAP_X} y={CAP_TOP + 4 + (CAP_H - 4) * (1 - capFillFrac)}
        width={CAP_W} height={(CAP_H - 4) * capFillFrac}
        fill={capFillColor} opacity="0.75" />
      {/* Outline */}
      <rect x={CAP_X} y={CAP_TOP + 4} width={CAP_W} height={CAP_H - 4}
        fill="none" stroke="#475569" strokeWidth="1" />
      {/* Bottom plate */}
      <rect x={CAP_X} y={CAP_TOP + CAP_H} width={CAP_W} height="8" rx="2"
        fill="#334155" stroke="#64748b" strokeWidth="1.5" />

      {/* Cap charge % and voltage */}
      <text x={BLX} y={CAP_TOP + 4 + (CAP_H - 4) / 2 + 5} textAnchor="middle"
        fill={capFillColor} fontSize="13" fontWeight="bold">
        {Math.round(capFillFrac * 100)}%
      </text>
      <text x={BLX + CAP_W / 2 + 8} y={CAP_TOP + 40} fill={capFillColor} fontSize="9" fontWeight="bold">
        Cap:
      </text>
      <text x={BLX + CAP_W / 2 + 8} y={CAP_TOP + 52} fill={capFillColor} fontSize="9" fontWeight="bold">
        {capV.toFixed(3)}V
      </text>

      {/* Cap label */}
      <text x={BLX} y={CAP_TOP + CAP_H + 22} textAnchor="middle" fill="#64748b" fontSize="9">
        {isZh ? '存储电容（Cs ≈ 20 fF）' : 'Storage capacitor (Cs ≈ 20 fF)'}
      </text>

      {/* ── Reference plate wire ── */}
      <line x1={BLX} y1={CAP_TOP + CAP_H + 8} x2={BLX} y2={CAP_TOP + CAP_H + 38}
        stroke="#475569" strokeWidth="2" />
      {/* Cell plate voltage reference — Vdd/2, not GND */}
      <line x1={BLX - 24} y1={CAP_TOP + CAP_H + 46} x2={BLX + 24} y2={CAP_TOP + CAP_H + 46}
        stroke="#f59e0b" strokeWidth="2" />
      <text x={BLX} y={CAP_TOP + CAP_H + 58} textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
        Vdd/2 = 0.6 V
      </text>
      <text x={BLX} y={CAP_TOP + CAP_H + 69} textAnchor="middle" fill="#64748b" fontSize="8">
        {isZh ? '（存储极板参考电位）' : '(cell plate reference)'}
      </text>
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DRAMCellWalkthrough({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [op, setOp]           = useState('read')
  const [stored, setStored]   = useState(1)
  const [writeBit, setWriteBit] = useState(1)
  const [stepIdx, setStepIdx] = useState(0)

  const steps =
    op === 'read'    ? readSteps(stored)  :
    op === 'write'   ? writeSteps(writeBit) :
                       refreshSteps()

  const step = steps[Math.min(stepIdx, steps.length - 1)]
  const total = steps.length

  const setOp2 = (o) => { setOp(o); setStepIdx(0) }
  const setStored2 = (v) => { setStored(v); setStepIdx(0) }
  const setWriteBit2 = (v) => { setWriteBit(v); setStepIdx(0) }

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? '1T1C 存储单元 — 分步详解' : '1T1C Cell — Step-by-Step Walkthrough'}
      </h3>

      {/* Operation selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(isZh
          ? [['read', '读取'], ['write', '写入'], ['refresh', '刷新']]
          : [['read', 'Read'], ['write', 'Write'], ['refresh', 'Refresh']]
        ).map(([v, lbl]) => (
          <button key={v} onClick={() => setOp2(v)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              op === v ? 'bg-dram-blue text-white border-dram-blue' : 'border-dram-border text-dram-muted hover:border-dram-muted'
            }`}>
            {lbl}
          </button>
        ))}

        {op === 'read' && (
          <>
            <span className="text-dram-muted self-center text-xs mx-1">{isZh ? '存储值：' : 'stored:'}</span>
            {[1, 0].map((b) => (
              <button key={b} onClick={() => setStored2(b)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                  stored === b
                    ? b === 1 ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/30 border-red-600 text-red-400'
                    : 'border-dram-border text-dram-muted'
                }`}>
                '{b}'
              </button>
            ))}
          </>
        )}

        {op === 'write' && (
          <>
            <span className="text-dram-muted self-center text-xs mx-1">{isZh ? '写入值：' : 'writing:'}</span>
            {[1, 0].map((b) => (
              <button key={b} onClick={() => setWriteBit2(b)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                  writeBit === b
                    ? b === 1 ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/30 border-red-600 text-red-400'
                    : 'border-dram-border text-dram-muted'
                }`}>
                '{b}'
              </button>
            ))}
          </>
        )}
      </div>

      {/* Step progress bar */}
      <div className="flex gap-1 mb-4">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStepIdx(i)}
            className={`flex-1 text-xs py-1 rounded transition-colors truncate px-1 ${
              i === stepIdx
                ? 'bg-dram-blue text-white font-semibold'
                : i < stepIdx
                ? 'bg-dram-green/20 text-dram-green text-opacity-70'
                : 'bg-dram-bg text-dram-muted'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Diagram */}
        <div className="flex-shrink-0 w-full lg:w-auto" style={{ maxWidth: 240 }}>
          <CellDiagram
            wlHigh={step.wlHigh} eq={step.eq} sa={step.sa}
            saOut={step.saOut} blV={step.blV} capV={step.capV} flow={step.flow}
            isZh={isZh}
          />
        </div>

        {/* Description */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-base font-bold text-dram-text leading-snug">{step.heading}</h4>
          </div>

          <p className="text-sm text-dram-muted leading-relaxed whitespace-pre-line">{step.body}</p>

          {/* Formula box */}
          <div className="rounded-lg p-3 bg-dram-bg border border-dram-border font-mono text-xs text-dram-text whitespace-pre-line leading-relaxed">
            {step.formula}
          </div>

          {/* Key insight */}
          <div className="rounded-lg p-3 bg-amber-900/10 border border-amber-700/30 text-xs text-amber-300">
            <span className="font-semibold text-amber-400">{isZh ? '关键要点：' : 'Key insight: '}</span>{step.insight}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-dram-border text-dram-muted
                hover:text-dram-text hover:border-dram-muted disabled:opacity-30 transition-colors">
              {isZh ? '← 上一步' : '← Prev'}
            </button>
            <span className="text-xs text-dram-muted font-mono">
              {stepIdx + 1} / {total}
            </span>
            <button onClick={() => setStepIdx((i) => Math.min(total - 1, i + 1))}
              disabled={stepIdx === total - 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-dram-blue/10 border border-dram-blue/40
                text-dram-blue hover:bg-dram-blue/20 disabled:opacity-30 transition-colors">
              {isZh ? '下一步 →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
