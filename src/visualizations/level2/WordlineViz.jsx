import { useState } from 'react'

export default function WordlineViz() {
  const [vpp, setVpp] = useState(2.5)
  const [nwl, setNwl] = useState(false)
  const vdd = 1.2
  const vth = 0.45  // NMOS threshold
  const vthBody = 0.65  // with body effect (substrate boosted)
  const vNwl = nwl ? -0.5 : 0  // negative wordline during standby

  // Vgs = Vwl - Vcell.  To fully transfer Vdd into cell: need Vwl - Vdd >= Vth
  // So Vwl >= Vdd + Vth (with body effect)
  const minVpp = vdd + vthBody
  const vcellWrite = Math.min(vdd, Math.max(0, vpp - vthBody))  // cell voltage after write
  const writeOk = vpp >= minVpp

  // Leakage current ∝ exp((Vgs - Vth) / nVt), Vgs = 0 - vNwl during standby
  // With nWL = -0.5V: Vgs = 0 - (-0.5) = 0.5V → but Vth also increases due to body effect
  // Simplified: leakage reduction factor
  const leakageRatio = nwl
    ? Math.exp(-(0.5) / 0.026).toFixed(0)  // massive reduction
    : 1

  const retentionFactor = nwl ? '10×' : '1×'

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        Wordline Driver — Vpp vs. Cell Threshold
      </h3>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SVG */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox="0 0 240 230" style={{ maxWidth: 240 }}>
            {/* Title */}
            <text x="120" y="14" textAnchor="middle" fill="#64748b" fontSize="9">NMOS access transistor</text>

            {/* Wordline (gate) */}
            <line x1="10" y1="60" x2="80" y2="60" stroke="#f59e0b" strokeWidth="2" />
            <text x="5" y="63" textAnchor="end" fill="#f59e0b" fontSize="9">WL</text>
            <text x="45" y="55" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
              {vpp.toFixed(1)}V
            </text>

            {/* Transistor body */}
            <rect x="80" y="40" width="50" height="40" rx="4"
              fill={writeOk ? '#16a34a20' : '#dc262620'}
              stroke={writeOk ? '#22c55e' : '#ef4444'}
              strokeWidth="1.5" />
            <text x="105" y="56" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">M</text>
            <text x="105" y="70" textAnchor="middle" fill="#64748b" fontSize="8">NMOS</text>

            {/* Gate line to transistor */}
            <line x1="80" y1="60" x2="80" y2="60" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Bitline (drain) */}
            <line x1="105" y1="40" x2="105" y2="20" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="105" y="16" textAnchor="middle" fill="#3b82f6" fontSize="9">BL (Vdd/2)</text>

            {/* Cell capacitor (source) */}
            <line x1="105" y1="80" x2="105" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="90" y1="100" x2="120" y2="100" stroke={writeOk ? '#22c55e' : '#ef4444'} strokeWidth="2" />
            <line x1="90" y1="106" x2="120" y2="106" stroke="#475569" strokeWidth="2" />
            <line x1="105" y1="106" x2="105" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="105" y="132" textAnchor="middle" fill="#64748b" fontSize="8">Cs</text>
            <text x="105" y="143" textAnchor="middle" fill={writeOk ? '#22c55e' : '#ef4444'} fontSize="9" fontWeight="bold">
              {vcellWrite.toFixed(2)}V
            </text>

            {/* Substrate/body */}
            <line x1="130" y1="60" x2="155" y2="60" stroke="#94a3b8" strokeWidth="1" />
            <line x1="155" y1="50" x2="155" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="165" y="63" fill="#64748b" fontSize="8">Body</text>
            {nwl && (
              <>
                <text x="165" y="73" fill="#a855f7" fontSize="8">(boosted)</text>
              </>
            )}

            {/* Vth bar */}
            <text x="20" y="165" fill="#94a3b8" fontSize="9">Voltage requirement:</text>
            <rect x="20" y="172" width="200" height="16" rx="2" fill="#1e293b" />
            {/* Vth marker */}
            <rect x="20" y="172" width={Math.min(200, (minVpp / 4.0) * 200)} height="16" rx="2"
              fill="#dc262640" />
            <line x1={20 + (minVpp / 4.0) * 200} y1="168" x2={20 + (minVpp / 4.0) * 200} y2="192"
              stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Vpp bar */}
            <rect x="20" y="172" width={Math.min(200, (vpp / 4.0) * 200)} height="16" rx="2"
              fill={writeOk ? '#22c55e60' : '#f59e0b60'} />
            <text x="120" y="184" textAnchor="middle" fill="white" fontSize="9">
              Vpp = {vpp.toFixed(1)}V {writeOk ? `≥ ${minVpp.toFixed(2)}V ✓` : `< ${minVpp.toFixed(2)}V ✗`}
            </text>
            <text x="20" y="200" fill="#64748b" fontSize="8">0V</text>
            <text x="220" y="200" textAnchor="end" fill="#64748b" fontSize="8">4V</text>

            {/* nWL effect */}
            {nwl && (
              <g>
                <rect x="20" y="208" width="200" height="14" rx="2"
                  fill="#a855f720" stroke="#a855f7" strokeWidth="1" />
                <text x="120" y="219" textAnchor="middle" fill="#a855f7" fontSize="9">
                  nWL = {vNwl}V → leakage ↓ ~{retentionFactor}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5">
          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              Wordline voltage Vpp: <span className="text-dram-amber font-mono">{vpp.toFixed(1)} V</span>
            </label>
            <input type="range" min="0.5" max="4.0" step="0.1"
              value={vpp} onChange={(e) => setVpp(Number(e.target.value))}
              className="w-full accent-amber-400" />
            <div className="flex justify-between text-xs text-dram-muted mt-0.5">
              <span>0.5V</span>
              <span className="text-red-400">Min: {minVpp.toFixed(2)}V</span>
              <span>4.0V</span>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-sm border ${
            writeOk
              ? 'bg-green-900/20 border-green-700/40 text-green-300'
              : 'bg-red-900/20 border-red-700/40 text-red-300'
          }`}>
            {writeOk ? (
              <>
                <strong className="text-green-400">Full write:</strong> Vpp ({vpp.toFixed(1)}V) ≥ Vdd + Vth_body
                ({vdd} + {vthBody} = {minVpp.toFixed(2)}V). Cell charges to {vcellWrite.toFixed(2)}V ≈ Vdd. ✓
              </>
            ) : (
              <>
                <strong className="text-red-400">Incomplete write:</strong> Vpp ({vpp.toFixed(1)}V) &lt; Vdd + Vth_body
                ({minVpp.toFixed(2)}V). NMOS cuts off at Vcell = {vcellWrite.toFixed(2)}V — cell undervoltage degrades
                retention and sense margin.
              </>
            )}
          </div>

          <div className="border border-dram-border rounded-lg p-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setNwl(!nwl)}
                className={`w-10 h-5 rounded-full relative transition-colors ${nwl ? 'bg-purple-600' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${nwl ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-dram-text">Negative wordline (nWL = −0.5V)</span>
            </label>
            <p className="text-xs text-dram-muted">
              During standby, driving the wordline below GND (nWL) increases NMOS Vth via body effect,
              reducing subthreshold leakage and extending cell retention time by ~10×.
            </p>
          </div>

          <div className="rounded-lg p-4 bg-dram-bg text-xs font-mono space-y-1">
            <div className="text-dram-blue">// Boosting requirement</div>
            <div>Vth (flat band) = {vth}V</div>
            <div>Vth (with body effect) ≈ {vthBody}V</div>
            <div>Required Vpp ≥ Vdd + Vth_body = {minVpp.toFixed(2)}V</div>
            <div>Typical Vpp = 2.5–3.0V (charge pump generated)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
