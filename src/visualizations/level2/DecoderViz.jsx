import { useState } from 'react'

const NUM_ROWS = 8  // 3-bit address

export default function DecoderViz() {
  const [addrBits, setAddrBits] = useState([0, 0, 0])
  const [step, setStep] = useState(0)  // 0=input, 1=predecode, 2=decode, 3=wordline

  const addr = addrBits[2] * 4 + addrBits[1] * 2 + addrBits[0]

  // Predecoder: split A[2:1] (4 lines) and A[0] (2 lines)
  // A[2:1] → 4 one-hot lines: {A2A1, A2~A1, ~A2A1, ~A2~A1}
  const preDec21 = [
    addrBits[2] === 1 && addrBits[1] === 1,  // A2&A1
    addrBits[2] === 1 && addrBits[1] === 0,  // A2&~A1
    addrBits[2] === 0 && addrBits[1] === 1,  // ~A2&A1
    addrBits[2] === 0 && addrBits[1] === 0,  // ~A2&~A1
  ]
  const preDec0 = [addrBits[0] === 1, addrBits[0] === 0]

  const toggleBit = (i) => {
    const next = [...addrBits]
    next[i] ^= 1
    setAddrBits(next)
    setStep(0)
  }

  const stepLabels = ['Address input', 'Predecode', 'NAND decode', 'Wordline active']
  const maxStep = 3

  const advance = () => setStep((s) => Math.min(s + 1, maxStep))
  const reset = () => setStep(0)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-5">
        Row Decoder — Predecode → NAND decode → Wordline
      </h3>

      {/* Step indicator */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {stepLabels.map((lbl, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`text-xs px-2 py-0.5 rounded font-mono ${
              i === step ? 'bg-dram-blue text-white'
              : i < step ? 'bg-dram-green/20 text-dram-green'
              : 'bg-dram-bg text-dram-muted'
            }`}>{lbl}</div>
            {i < stepLabels.length - 1 && <span className="text-dram-muted">→</span>}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Address input */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Address bits</div>
          <div className="flex gap-3">
            {[2, 1, 0].map((i) => (
              <button
                key={i}
                onClick={() => toggleBit(i)}
                className={`w-12 h-12 rounded-lg font-bold font-mono text-lg border-2 transition-colors ${
                  addrBits[i] === 1
                    ? 'bg-dram-blue/20 border-dram-blue text-dram-blue'
                    : 'bg-dram-bg border-dram-border text-dram-muted hover:border-dram-muted'
                }`}
              >
                {addrBits[i]}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono space-y-0.5">
            <div className="text-dram-muted">A[2] A[1] A[0]</div>
            <div className="text-dram-blue font-bold">Row {addr} selected</div>
          </div>

          {/* Predecode lines */}
          {step >= 1 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-dram-muted uppercase mb-1">Predecode lines</div>
              {['A2·A1', 'A2·Ā1', 'Ā2·A1', 'Ā2·Ā1'].map((lbl, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono ${
                  preDec21[i] ? 'bg-amber-900/30 text-amber-300 border border-amber-700/40'
                  : 'text-dram-muted'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${preDec21[i] ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  {lbl}: {preDec21[i] ? '1' : '0'}
                </div>
              ))}
              {['A0', 'Ā0'].map((lbl, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono ${
                  preDec0[i] ? 'bg-amber-900/30 text-amber-300 border border-amber-700/40'
                  : 'text-dram-muted'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${preDec0[i] ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  {lbl}: {preDec0[i] ? '1' : '0'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NAND gate array / wordlines */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
            {step >= 2 ? 'NAND decode gates → Wordlines' : 'Wordlines (8 rows)'}
          </div>
          <div className="space-y-1">
            {Array.from({ length: NUM_ROWS }, (_, row) => {
              const isSelected = row === addr
              const rowBits = [
                (row >> 2) & 1,  // A2
                (row >> 1) & 1,  // A1
                row & 1,          // A0
              ]
              // Which predecode lines this NAND gate uses
              const pd21idx = rowBits[0] * 2 + rowBits[1]  // maps to preDec21 index
              const pd0idx = 1 - rowBits[2]  // 0→Ā0(idx=1), 1→A0(idx=0) - actually:
              // preDec21[0]=A2A1 → row[2]=1,row[1]=1 → pd21=0b11=3... let me redo
              // Actually: preDec21[0] = A2&A1 → active when A2=1,A1=1
              // Row's A2=rowBits[0], A1=rowBits[1]
              // pd21 index for row: if A2=1,A1=1 → idx=0; A2=1,A1=0 → idx=1; A2=0,A1=1 → idx=2; A2=0,A1=0 → idx=3
              const a2 = rowBits[0], a1 = rowBits[1], a0 = rowBits[2]
              const myPd21 = a2 * 2 + a1  // 0-3; matches [A2A1, A2~A1, ~A2A1, ~A2~A1] is not trivial
              // simpler: my pd21 active index
              // preDec21[0] = a2==1 && a1==1
              // preDec21[1] = a2==1 && a1==0
              // preDec21[2] = a2==0 && a1==1
              // preDec21[3] = a2==0 && a1==0
              // for this row, which pd21 is active?
              const myPd21Idx = (1 - a2) * 2 + (1 - a1)  // 00→3, 01→2, 10→1, 11→0
              const myPd0Idx = a0 === 1 ? 0 : 1  // A0=1→preDec0[0], A0=0→preDec0[1]
              const predecodeMatch = step >= 1 && preDec21[myPd21Idx] && preDec0[myPd0Idx]

              return (
                <div key={row} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                  isSelected && step >= 3
                    ? 'bg-green-900/30 border border-green-700/40'
                    : isSelected && step >= 2
                    ? 'bg-amber-900/20 border border-amber-700/30'
                    : 'bg-dram-bg border border-transparent'
                }`}>
                  {/* NAND gate visual */}
                  {step >= 2 && (
                    <div className={`w-8 h-5 rounded-r-full border flex items-center justify-center text-xs font-mono ${
                      isSelected ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-600'
                    }`}>
                      ⊼
                    </div>
                  )}
                  <span className="font-mono text-dram-muted w-5">{row}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-dram-border">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      isSelected && step >= 3
                        ? 'bg-dram-green w-full'
                        : isSelected && step >= 2
                        ? 'bg-dram-amber w-3/4'
                        : 'w-0'
                    }`} />
                  </div>
                  <span className={`font-mono w-12 text-right ${
                    isSelected && step >= 3 ? 'text-dram-green font-bold' : 'text-dram-muted'
                  }`}>
                    {isSelected && step >= 3 ? 'ACTIVE' : `R${row}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-5">
        <button onClick={advance} disabled={step >= maxStep}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dram-blue/10 border border-dram-blue/40
            text-dram-blue hover:bg-dram-blue/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next step →
        </button>
        <button onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-dram-border text-dram-muted
            hover:text-dram-text hover:border-dram-muted transition-colors">
          Reset
        </button>
        <div className="text-xs text-dram-muted self-center font-mono">
          NAND gate for row {addr}: inputs = (A2̄={addrBits[2] ? '' : '̄'}{addrBits[2]}, A1̄={addrBits[1]}, A0̄={addrBits[0]})
        </div>
      </div>
    </div>
  )
}
