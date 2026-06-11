import { useState, useMemo } from 'react'

// Hamming(12,8): 8 data bits + 4 parity bits = 12-bit codeword
// Parity bits at positions 1,2,4,8 (1-indexed)
// Data bits at positions 3,5,6,7,9,10,11,12 (1-indexed)

const DATA_BITS = 8
const PARITY_BITS = 4
const TOTAL_BITS = 12  // 12 = 8 + 4

// Map bit positions (1-indexed) to data bit index or parity bit index
// pos: 1(p0), 2(p1), 3(d0), 4(p2), 5(d1), 6(d2), 7(d3), 8(p3), 9(d4), 10(d5), 11(d6), 12(d7)
const posToType = {
  1: { type: 'p', idx: 0 },
  2: { type: 'p', idx: 1 },
  3: { type: 'd', idx: 0 },
  4: { type: 'p', idx: 2 },
  5: { type: 'd', idx: 1 },
  6: { type: 'd', idx: 2 },
  7: { type: 'd', idx: 3 },
  8: { type: 'p', idx: 3 },
  9: { type: 'd', idx: 4 },
  10: { type: 'd', idx: 5 },
  11: { type: 'd', idx: 6 },
  12: { type: 'd', idx: 7 },
}

// Each parity bit covers positions where bit i of position is 1
// p0 (pos 1): covers positions 1,3,5,7,9,11
// p1 (pos 2): covers positions 2,3,6,7,10,11
// p2 (pos 4): covers positions 4,5,6,7,12
// p3 (pos 8): covers positions 8,9,10,11,12
const parityCovers = {
  0: [1,3,5,7,9,11],
  1: [2,3,6,7,10,11],
  2: [4,5,6,7,12],
  3: [8,9,10,11,12],
}

function buildCodeword(dataBits) {
  // dataBits: array of 8 bits
  const cw = new Array(TOTAL_BITS + 1).fill(0)  // 1-indexed, pos 0 unused
  // Fill data bits
  const dataPositions = [3,5,6,7,9,10,11,12]
  dataPositions.forEach((pos, i) => { cw[pos] = dataBits[i] })
  // Compute parity bits
  for (let p = 0; p < PARITY_BITS; p++) {
    const covered = parityCovers[p].filter((pos) => pos !== (1 << p))
    const xorVal = covered.reduce((acc, pos) => acc ^ cw[pos], 0)
    cw[1 << p] = xorVal
  }
  return cw
}

function computeSyndrome(cw) {
  const syndrome = []
  for (let p = 0; p < PARITY_BITS; p++) {
    const xorVal = parityCovers[p].reduce((acc, pos) => acc ^ cw[pos], 0)
    syndrome.push(xorVal)
  }
  return syndrome
}

function syndromeToErrorPos(syndrome) {
  // syndrome bits form a binary number giving the error position
  return syndrome.reduce((acc, bit, i) => acc + bit * (1 << i), 0)
}

const INITIAL_DATA = [1, 0, 1, 1, 0, 1, 0, 0]

export default function ECCSim({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const [dataBits, setDataBits] = useState(INITIAL_DATA)
  const [errorPos, setErrorPos] = useState(null)  // 1-indexed position of injected error

  const codeword = useMemo(() => buildCodeword(dataBits), [dataBits])
  const receivedCW = useMemo(() => {
    if (errorPos === null) return codeword
    const rcw = [...codeword]
    rcw[errorPos] = 1 - rcw[errorPos]
    return rcw
  }, [codeword, errorPos])

  const syndrome = useMemo(() => computeSyndrome(receivedCW), [receivedCW])
  const detectedPos = useMemo(() => syndromeToErrorPos(syndrome), [syndrome])
  const hasError = detectedPos > 0 && detectedPos <= TOTAL_BITS
  const correctedCW = useMemo(() => {
    if (!hasError) return receivedCW
    const ccw = [...receivedCW]
    ccw[detectedPos] = 1 - ccw[detectedPos]
    return ccw
  }, [receivedCW, hasError, detectedPos])

  const toggleData = (i) => {
    const nd = [...dataBits]
    nd[i] ^= 1
    setDataBits(nd)
    setErrorPos(null)
  }

  const injectError = (pos) => {
    setErrorPos(pos === errorPos ? null : pos)
  }

  const positions = Array.from({ length: TOTAL_BITS }, (_, i) => i + 1)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        {isZh ? 'Hamming(12,8) ECC — 注入位错误并观察校验子检测' : 'Hamming(12,8) ECC — Inject a bit error and watch syndrome detection'}
      </h3>

      <div className="flex flex-col gap-6">
        {/* Data input */}
        <div>
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">{isZh ? '数据位（点击切换）' : 'Data bits (toggle to change)'}</div>
          <div className="flex gap-1.5 flex-wrap">
            {dataBits.map((b, i) => (
              <button key={i} onClick={() => toggleData(i)}
                className={`w-9 h-9 rounded font-mono font-bold text-sm border-2 transition-colors ${
                  b === 1
                    ? 'bg-dram-blue/20 border-dram-blue text-dram-blue'
                    : 'bg-dram-bg border-dram-border text-dram-muted hover:border-dram-muted'
                }`}>
                {b}
              </button>
            ))}
            <div className="self-center text-xs text-dram-muted ml-1">d[7:0]</div>
          </div>
        </div>

        {/* Codeword display */}
        <div>
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">
            {isZh ? '12 位码字（点击任意位注入错误）' : '12-bit codeword (click any bit to inject error)'}
          </div>
          <div className="flex gap-1 flex-wrap">
            {positions.map((pos) => {
              const info = posToType[pos]
              const isParityBit = info.type === 'p'
              const isError = pos === errorPos
              const isDetected = hasError && pos === detectedPos
              const origVal = codeword[pos]
              const recvVal = receivedCW[pos]

              return (
                <div key={pos} className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-dram-muted font-mono">{pos}</span>
                  <button
                    onClick={() => injectError(pos)}
                    className={`w-8 h-8 rounded font-mono font-bold text-sm border-2 transition-colors ${
                      isError || isDetected
                        ? 'bg-red-700/40 border-red-500 text-red-300'
                        : isParityBit
                        ? 'bg-purple-900/20 border-purple-700/50 text-purple-300 hover:border-purple-500'
                        : 'bg-dram-blue/10 border-dram-blue/40 text-dram-blue hover:border-dram-blue'
                    }`}>
                    {recvVal}
                  </button>
                  <span className={`text-xs font-mono ${isParityBit ? 'text-purple-400' : 'text-dram-blue/70'}`}>
                    {isParityBit ? `P${info.idx}` : `D${info.idx}`}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-1 flex gap-4 text-xs">
            <span className="text-dram-blue">■ {isZh ? '数据位' : 'data bit'}</span>
            <span className="text-purple-400">■ {isZh ? '奇偶校验位' : 'parity bit'}</span>
            {errorPos && <span className="text-red-400">■ {isZh ? `注入错误：位置 ${errorPos}` : `injected error at position ${errorPos}`}</span>}
          </div>
        </div>

        {/* Syndrome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">{isZh ? '校验子计算' : 'Syndrome computation'}</div>
            <div className="space-y-1.5">
              {syndrome.map((bit, p) => (
                <div key={p} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-mono ${
                  bit === 1 ? 'bg-red-900/20 border border-red-700/30 text-red-300' : 'bg-dram-bg text-dram-muted'
                }`}>
                  <span className="text-purple-400">P{p}</span>
                  <span className="text-dram-muted">{isZh ? '覆盖：' : 'covers: '}{parityCovers[p].join(',')}</span>
                  <span className={`ml-auto font-bold ${bit === 1 ? 'text-red-400' : 'text-dram-green'}`}>
                    S{p} = {bit}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 rounded bg-dram-border/20 text-xs font-mono">
                <span className="text-dram-text">{isZh ? '校验子 S[3:0]' : 'Syndrome S[3:0]'}</span>
                <span className={`font-bold ${hasError ? 'text-red-400' : 'text-dram-green'}`}>
                  {syndrome.reverse().join('')}b = {isZh ? '位置 ' : 'pos '}{detectedPos} {detectedPos === 0 ? (isZh ? '（无错误）' : '(no error)') : ''}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-dram-muted uppercase mb-2">{isZh ? '结果' : 'Result'}</div>
            {!errorPos ? (
              <div className="rounded-lg p-4 bg-green-900/20 border border-green-700/40 text-sm text-green-300">
                {isZh ? '未注入错误。校验子 = 0000。数据有效。' : 'No error injected. Syndrome = 0000. Data is valid.'}
              </div>
            ) : hasError ? (
              <div className="rounded-lg p-4 bg-amber-900/20 border border-amber-700/40 text-sm text-amber-300 space-y-2">
                <div><strong>{isZh ? '检测到错误' : 'Error detected'}</strong>{isZh ? `，位置 ${detectedPos}。` : ` at bit position ${detectedPos}.`}</div>
                <div className="text-xs">{isZh ? `翻转位 ${detectedPos}：${receivedCW[detectedPos]} → ${correctedCW[detectedPos]}` : `Flip bit ${detectedPos}: ${receivedCW[detectedPos]} → ${correctedCW[detectedPos]}`}</div>
                <div className="text-xs text-dram-green">✓ {isZh ? '单比特错误已纠正（SECDED）' : 'Single-bit error corrected (SECDED)'}</div>
              </div>
            ) : (
              <div className="rounded-lg p-4 bg-red-900/20 border border-red-700/40 text-sm text-red-300">
                {isZh ? '检测到双比特错误（校验子 ≠ 0 但位置超出范围）。无法纠正。' : 'Double-bit error detected (syndrome ≠ 0 but position out of range). Cannot correct.'}
              </div>
            )}

            <div className="mt-3 rounded-lg p-3 bg-dram-bg text-xs text-dram-muted space-y-1">
              <div className="font-semibold text-dram-text">{isZh ? 'SECDED 公式' : 'SECDED formula'}</div>
              <div>{isZh ? 'n 位数据需要 r 个奇偶校验位，满足 2^r ≥ n + r + 1' : 'n data bits needs r parity bits where 2^r ≥ n + r + 1'}</div>
              <div>{isZh ? '64 位数据 → 需要 r=7 个校验位 + 1 个整体奇偶位 = 8 个奇偶校验位' : '64 data bits → need r=7 checks + 1 overall parity = 8 parity bits'}</div>
              <div className="text-dram-blue">→ {isZh ? '72 位 DIMM 总线 = 64+8 ECC' : '72-bit DIMM bus = 64+8 ECC'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
