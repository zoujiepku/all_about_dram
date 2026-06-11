import { useState, useMemo } from 'react'

const SYMBOLS = 200  // number of symbol traces to draw
const LEVELS_NRZ = 2
const LEVELS_PAM4 = 4

function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildEyeTraces({ modulation, noiseRms, ctleGain, dfeEnabled, numTraces = 120 }) {
  const levels = modulation === 'pam4' ? LEVELS_PAM4 : LEVELS_NRZ
  const rand = seededRand(42)
  const traces = []

  // Jitter model: Dj = 0.05 UI, Rj = noiseRms * 0.5 UI
  const Dj = 0.05
  const Rj = noiseRms * 0.4
  const voltNoise = noiseRms * (modulation === 'pam4' ? 0.3 : 0.5)
  // CTLE effect: boosts high-frequency, reduces amplitude loss simulation
  const ctleComp = Math.min(1, ctleGain / 3)
  // DFE: cancels ISI from previous symbol
  const dfeComp = dfeEnabled ? 0.7 : 0

  for (let i = 0; i < numTraces; i++) {
    // Random transition
    const fromLevel = Math.floor(rand() * levels)
    const toLevel = Math.floor(rand() * levels)
    const fromV = fromLevel / (levels - 1)
    const toV = toLevel / (levels - 1)

    // Jitter
    const jitter = Dj * (rand() > 0.5 ? 1 : -1) + Rj * (rand() - 0.5) * 2 * Math.sqrt(2 * Math.log(1 / (rand() + 0.001)))
    // Noise
    const noiseFrom = voltNoise * (rand() - 0.5) * 2
    const noiseTo = voltNoise * (rand() - 0.5) * 2
    // ISI from previous symbol (simplified)
    const isi = (1 - ctleComp) * 0.1 * (rand() - 0.5) * (1 - dfeComp)

    traces.push({ fromV: fromV + noiseFrom + isi, toV: toV + noiseTo + isi, jitter })
  }
  return { traces, levels }
}

export default function EyeDiagramViz({ lang = 'en' }) {
  const [modulation, setModulation] = useState('pam4')
  const [noiseRms, setNoiseRms] = useState(0.3)
  const [ctleGain, setCtleGain] = useState(0)
  const [dfeEnabled, setDfeEnabled] = useState(false)

  const isZh = lang === 'zh'

  const { traces, levels } = useMemo(
    () => buildEyeTraces({ modulation, noiseRms, ctleGain, dfeEnabled }),
    [modulation, noiseRms, ctleGain, dfeEnabled]
  )

  const svgW = 280
  const svgH = 200
  const pad = 20
  const plotW = svgW - pad * 2
  const plotH = svgH - pad * 2

  const levelColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']

  // SNR penalty: PAM4 has 9.5 dB worse SNR than NRZ for same eye
  const snrPenalty = modulation === 'pam4' ? 9.5 : 0

  // Effective noise after equalization
  const effNoise = noiseRms * (1 - Math.min(0.7, ctleGain / 3) * 0.5) * (dfeEnabled ? 0.6 : 1)
  const eyeHeight = Math.max(0, (1 / (levels - 1)) - effNoise * 2)
  const eyeOpen = eyeHeight / (1 / (levels - 1))

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? 'PAM4 眼图 — 噪声与均衡' : 'PAM4 Eye Diagram — Noise & Equalization'}
      </h3>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Eye diagram SVG */}
        <div className="flex-shrink-0">
          <svg width="100%" height="auto" viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: svgW }}>
            <rect width={svgW} height={svgH} fill="#050d1a" rx="6" />
            {/* Voltage level grid lines */}
            {Array.from({ length: levels }, (_, i) => {
              const y = pad + plotH - (i / (levels - 1)) * plotH
              return (
                <g key={i}>
                  <line x1={pad} y1={y} x2={svgW - pad} y2={y}
                    stroke={levelColors[i] + '30'} strokeWidth="0.5" />
                  <text x={svgW - pad + 3} y={y + 1} fill={levelColors[i] + '80'} fontSize="7"
                    dominantBaseline="middle">
                    {isZh ? `电平${i}` : `L${i}`}
                  </text>
                </g>
              )
            })}
            {/* Center timing line */}
            <line x1={svgW / 2} y1={pad} x2={svgW / 2} y2={svgH - pad}
              stroke="#ffffff10" strokeWidth="0.5" />

            {/* Eye traces */}
            {traces.map((tr, idx) => {
              const t0 = 0.5 + tr.jitter
              const x0 = pad
              const x1 = pad + t0 * plotW
              const x2 = pad + (1 - t0) * plotW + pad
              const x3 = svgW - pad
              const yFrom = pad + plotH - tr.fromV * plotH
              const yTo = pad + plotH - tr.toV * plotH
              const fromLevelIdx = Math.round(tr.fromV * (levels - 1))
              const color = levelColors[Math.min(levels - 1, Math.max(0, fromLevelIdx))]
              return (
                <path key={idx}
                  d={`M ${x0},${yFrom} C ${x1},${yFrom} ${x1},${yTo} ${x3},${yTo}`}
                  fill="none" stroke={color} strokeWidth="0.6" opacity="0.4" />
              )
            })}

            {/* Eye opening boxes for PAM4 */}
            {modulation === 'pam4' && Array.from({ length: levels - 1 }, (_, i) => {
              const centerV = (i + 0.5) / (levels - 1)
              const halfH = eyeHeight / 2 * plotH
              const cy = pad + plotH - centerV * plotH
              const eyeW = 0.6 * plotW
              return halfH > 2 && (
                <rect key={i}
                  x={pad + (plotW - eyeW) / 2}
                  y={cy - halfH}
                  width={eyeW}
                  height={halfH * 2}
                  fill="none" stroke={levelColors[i] + '80'} strokeWidth="1" strokeDasharray="3 2" />
              )
            })}

            {/* NRZ single eye box */}
            {modulation === 'nrz' && (() => {
              const halfH = eyeHeight / 2 * plotH
              const cy = pad + plotH / 2
              const eyeW = 0.6 * plotW
              return halfH > 2 && (
                <rect x={pad + (plotW - eyeW) / 2} y={cy - halfH}
                  width={eyeW} height={halfH * 2}
                  fill="none" stroke="#22c55e80" strokeWidth="1.5" strokeDasharray="4 2" />
              )
            })()}

            {/* Stats overlay */}
            <text x={pad} y={pad - 6} fill="#475569" fontSize="8">
              {modulation === 'pam4'
                ? (isZh ? 'PAM4（保留）（3 个眼图）' : 'PAM4 (3 eyes)')
                : (isZh ? 'NRZ（保留）（1 个眼图）' : 'NRZ (1 eye)')}
            </text>
            <text x={svgW - pad} y={pad - 6} textAnchor="end"
              fill={eyeOpen > 0.5 ? '#22c55e' : eyeOpen > 0.2 ? '#f59e0b' : '#ef4444'} fontSize="8">
              {isZh ? `眼开度: ${(eyeOpen * 100).toFixed(0)}%` : `Eye: ${(eyeOpen * 100).toFixed(0)}%`}
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
              {isZh ? '调制方式' : 'Modulation'}
            </div>
            <div className="flex gap-2">
              {isZh ? [
                ['nrz', 'NRZ（保留）（2 电平）'],
                ['pam4', 'PAM4（保留）（4 电平）'],
              ] : [
                ['nrz', 'NRZ (2-level)'],
                ['pam4', 'PAM4 (4-level)'],
              ].map(([v, lbl]) => (
                <button key={v} onClick={() => setModulation(v)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    modulation === v ? 'bg-dram-blue/20 border-dram-blue text-dram-blue' : 'border-dram-border text-dram-muted'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              {isZh ? (
                <>噪声 (σ)：<span className="text-dram-amber font-mono">{noiseRms.toFixed(2)} UI</span></>
              ) : (
                <>Noise (σ): <span className="text-dram-amber font-mono">{noiseRms.toFixed(2)} UI</span></>
              )}
            </label>
            <input type="range" min="0.0" max="0.8" step="0.05"
              value={noiseRms} onChange={(e) => setNoiseRms(Number(e.target.value))}
              className="w-full accent-amber-400" />
          </div>

          <div>
            <label className="text-sm font-medium text-dram-text block mb-1">
              {isZh ? (
                <>CTLE 增益：<span className="text-dram-amber font-mono">{ctleGain.toFixed(1)} dB</span>
                <span className="text-xs text-dram-muted ml-1">（高通均衡）</span></>
              ) : (
                <>CTLE gain: <span className="text-dram-amber font-mono">{ctleGain.toFixed(1)} dB</span>
                <span className="text-xs text-dram-muted ml-1">(high-pass EQ)</span></>
              )}
            </label>
            <input type="range" min="0" max="6" step="0.5"
              value={ctleGain} onChange={(e) => setCtleGain(Number(e.target.value))}
              className="w-full accent-blue-400" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-dram-text">
            <div onClick={() => setDfeEnabled(!dfeEnabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${dfeEnabled ? 'bg-dram-green' : 'bg-slate-600'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${dfeEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            {isZh ? 'DFE（判决反馈均衡器）' : 'DFE (decision feedback equalizer)'}
          </label>

          <div className="rounded-lg p-3 bg-dram-bg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-dram-muted">{isZh ? '眼开度' : 'Eye opening'}</span>
              <span className={`font-mono font-bold ${eyeOpen > 0.5 ? 'text-dram-green' : eyeOpen > 0.2 ? 'text-amber-400' : 'text-red-400'}`}>
                {(eyeOpen * 100).toFixed(0)}%
              </span>
            </div>
            {modulation === 'pam4' && (
              <div className="flex justify-between">
                <span className="text-dram-muted">{isZh ? 'PAM4（保留）相对 NRZ（保留）信噪比代价' : 'PAM4 SNR penalty vs NRZ'}</span>
                <span className="font-mono text-amber-400">−{snrPenalty} dB</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-dram-muted">{isZh ? '均衡状态' : 'Equalization active'}</span>
              <span className={`font-mono ${(ctleGain > 0 || dfeEnabled) ? 'text-dram-green' : 'text-dram-muted'}`}>
                {ctleGain > 0 ? `CTLE(${ctleGain}dB)` : ''}{ctleGain > 0 && dfeEnabled ? '+' : ''}{dfeEnabled ? 'DFE' : ''}{!ctleGain && !dfeEnabled ? (isZh ? '无' : 'none') : ''}
              </span>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-dram-bg text-xs text-dram-muted">
            {isZh ? (
              <><strong className="text-dram-text">PAM4（保留）在 GDDR6/HBM4 中：</strong>每个符号携带 2 位
              （00=L0, 01=L1, 10=L2, 11=L3），但眼图高度仅为 NRZ（保留）的 1/3，需要约 9.5 dB 更好的信噪比。
              CTLE 补偿频率相关的信道损耗；DFE 利用已判决位作为反馈消除历史符号的码间干扰（ISI）。</>
            ) : (
              <><strong className="text-dram-text">PAM4 in GDDR6/HBM4:</strong> Each symbol carries 2 bits
              (00=L0, 01=L1, 10=L2, 11=L3) but eye height is only 1/3 of NRZ, requiring ~9.5 dB better SNR.
              CTLE compensates for frequency-dependent channel loss; DFE removes ISI from past symbols using
              previously decided bits as feedback.</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
