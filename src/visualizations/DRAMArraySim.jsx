import { useState, useCallback } from 'react'

const ROWS = 8
const COLS = 8

const STATES = {
  IDLE: 'idle',
  PRECHARGE: 'precharge',
  ROW_ACTIVE: 'row_active',
  COL_SELECT: 'col_select',
  DATA_VALID: 'data_valid',
  RESTORE: 'restore',
}

const STATE_INFO = {
  [STATES.IDLE]: { label: 'IDLE', color: '#475569', desc: 'All bit lines precharged to Vdd/2. Bank is idle.' },
  [STATES.PRECHARGE]: { label: 'PRECHARGE', color: '#3b82f6', desc: 'Bit lines driven to Vdd/2. Sense amps disconnected.' },
  [STATES.ROW_ACTIVE]: { label: 'ROW ACTIVE (RAS)', color: '#f59e0b', desc: 'Wordline raises. Selected row\'s cells discharge onto bit lines. Sense amps detect tiny ΔV and amplify.' },
  [STATES.COL_SELECT]: { label: 'COL SELECT (CAS)', color: '#a855f7', desc: 'Column address sent. Column decoder connects selected bit line to I/O pins.' },
  [STATES.DATA_VALID]: { label: 'DATA VALID', color: '#22c55e', desc: 'Data appears on DQ pins. Controller reads the value.' },
  [STATES.RESTORE]: { label: 'RESTORE', color: '#06b6d4', desc: 'Sense amps restore full charge to the cells (destructive read recovery). Wordline closes.' },
}

function initGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() > 0.5 ? 1 : 0)
  )
}

export default function DRAMArraySim({ mode = 'read' }) {
  const [grid, setGrid] = useState(initGrid)
  const [simState, setSimState] = useState(STATES.IDLE)
  const [activeRow, setActiveRow] = useState(null)
  const [activeCol, setActiveCol] = useState(null)
  const [speed, setSpeed] = useState(600)
  const [log, setLog] = useState(['Click a cell to begin a read or write operation.'])
  const [writeVal, setWriteVal] = useState(1)
  const [opMode, setOpMode] = useState('read')
  const [running, setRunning] = useState(false)
  const [refreshRow, setRefreshRow] = useState(null)

  const addLog = (msg) => setLog((l) => [msg, ...l].slice(0, 6))

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  const runRead = useCallback(async (row, col) => {
    if (running) return
    setRunning(true)
    addLog(`READ [${row},${col}] — value=${grid[row][col]}`)

    setSimState(STATES.PRECHARGE)
    setActiveRow(null); setActiveCol(null)
    addLog('PRECHARGE: bit lines → Vdd/2')
    await delay(speed)

    setSimState(STATES.ROW_ACTIVE)
    setActiveRow(row)
    addLog(`RAS: row ${row} wordline raised`)
    await delay(speed)

    setSimState(STATES.COL_SELECT)
    setActiveCol(col)
    addLog(`CAS: column ${col} selected`)
    await delay(speed)

    setSimState(STATES.DATA_VALID)
    addLog(`DATA: output = ${grid[row][col]}`)
    await delay(speed)

    setSimState(STATES.RESTORE)
    addLog('RESTORE: sense amps recharge cells')
    await delay(speed)

    setSimState(STATES.IDLE)
    setActiveRow(null); setActiveCol(null)
    setRunning(false)
  }, [grid, running, speed])

  const runWrite = useCallback(async (row, col) => {
    if (running) return
    setRunning(true)
    addLog(`WRITE [${row},${col}] ← ${writeVal}`)

    setSimState(STATES.PRECHARGE)
    setActiveRow(null); setActiveCol(null)
    addLog('PRECHARGE: bit lines → Vdd/2')
    await delay(speed)

    setSimState(STATES.ROW_ACTIVE)
    setActiveRow(row)
    addLog(`RAS: row ${row} wordline raised`)
    await delay(speed)

    setSimState(STATES.COL_SELECT)
    setActiveCol(col)
    addLog(`CAS + write driver: driving bit line to ${writeVal === 1 ? 'Vdd' : 'GND'}`)
    await delay(speed)

    setSimState(STATES.DATA_VALID)
    const newGrid = grid.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? writeVal : c))
    )
    setGrid(newGrid)
    addLog(`WRITE complete: cell[${row}][${col}] = ${writeVal}`)
    await delay(speed)

    setSimState(STATES.RESTORE)
    await delay(speed / 2)

    setSimState(STATES.IDLE)
    setActiveRow(null); setActiveCol(null)
    setRunning(false)
  }, [grid, running, speed, writeVal])

  const handleCellClick = (row, col) => {
    if (running) return
    if (opMode === 'read') runRead(row, col)
    else runWrite(row, col)
  }

  const runRefreshAll = async () => {
    if (running) return
    setRunning(true)
    addLog('REFRESH: cycling all rows…')
    for (let r = 0; r < ROWS; r++) {
      setRefreshRow(r)
      await delay(speed / 3)
    }
    setRefreshRow(null)
    addLog('REFRESH complete — all rows restored')
    setRunning(false)
  }

  const stateInfo = STATE_INFO[simState]

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DRAM Array Simulator — {ROWS}×{COLS} bank
      </h3>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex rounded-lg overflow-hidden border border-dram-border">
          <button
            onClick={() => setOpMode('read')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              opMode === 'read' ? 'bg-dram-blue text-white' : 'text-dram-muted hover:text-dram-text'
            }`}
          >
            Read
          </button>
          <button
            onClick={() => setOpMode('write')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              opMode === 'write' ? 'bg-dram-amber text-dram-bg' : 'text-dram-muted hover:text-dram-text'
            }`}
          >
            Write
          </button>
        </div>
        {opMode === 'write' && (
          <div className="flex rounded-lg overflow-hidden border border-dram-border">
            <button
              onClick={() => setWriteVal(1)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                writeVal === 1 ? 'bg-dram-green text-dram-bg' : 'text-dram-muted'
              }`}
            >
              Write 1
            </button>
            <button
              onClick={() => setWriteVal(0)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                writeVal === 0 ? 'bg-red-500 text-white' : 'text-dram-muted'
              }`}
            >
              Write 0
            </button>
          </div>
        )}
        <button
          onClick={runRefreshAll}
          disabled={running}
          className="px-4 py-1.5 rounded-lg bg-purple-900/30 text-purple-400 text-sm
                     border border-purple-700/40 hover:bg-purple-900/50 disabled:opacity-40 transition-colors"
        >
          Refresh All
        </button>
        <div className="flex items-center gap-2 ml-auto text-xs text-dram-muted">
          <span>Speed</span>
          <input type="range" min="200" max="1200" step="100" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 accent-blue-400"
          />
        </div>
      </div>

      {/* State indicator */}
      <div
        className="rounded-lg px-4 py-2.5 mb-4 border text-sm transition-all duration-300"
        style={{
          borderColor: stateInfo.color + '55',
          backgroundColor: stateInfo.color + '12',
          color: stateInfo.color,
        }}
      >
        <span className="font-bold font-mono mr-2">{stateInfo.label}</span>
        <span className="text-dram-muted">{stateInfo.desc}</span>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Array grid — horizontally scrollable on small screens */}
        <div className="flex-shrink-0 overflow-x-auto pb-1">
          {/* Column decoder header */}
          <div className="flex mb-1 ml-8" style={{ minWidth: 'max-content' }}>
            {Array.from({ length: COLS }, (_, c) => (
              <div
                key={c}
                className="w-8 h-5 flex items-center justify-center text-xs font-mono transition-colors"
                style={{
                  color: activeCol === c ? '#a855f7' : '#475569',
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {Array.from({ length: ROWS }, (_, r) => (
            <div key={r} className="flex items-center mb-1" style={{ minWidth: 'max-content' }}>
              {/* Row decoder label */}
              <div
                className="w-7 h-8 flex items-center justify-center text-xs font-mono transition-colors mr-1"
                style={{
                  color: activeRow === r || refreshRow === r ? '#f59e0b' : '#475569',
                }}
              >
                {r}
              </div>

              {/* Wordline + cells */}
              <div className="flex items-center gap-0">
                {Array.from({ length: COLS }, (_, c) => {
                  const isRowActive = activeRow === r || refreshRow === r
                  const isColActive = activeCol === c
                  const isTarget = isRowActive && isColActive
                  const val = grid[r][c]

                  return (
                    <button
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      disabled={running}
                      title={`Cell [${r},${c}] = ${val}`}
                      className={`
                        w-8 h-8 rounded text-xs font-bold font-mono border transition-all duration-200
                        disabled:cursor-default
                        ${isTarget
                          ? 'scale-110 z-10'
                          : 'hover:scale-105'}
                      `}
                      style={{
                        backgroundColor: isTarget
                          ? (simState === STATES.DATA_VALID ? (val ? '#166534' : '#7f1d1d') : '#1e3a5f')
                          : isRowActive
                          ? '#2d2a0f'
                          : isColActive
                          ? '#1a1040'
                          : val ? '#14532d' : '#1c1917',
                        borderColor: isTarget
                          ? stateInfo.color
                          : isRowActive
                          ? '#f59e0b44'
                          : isColActive
                          ? '#a855f744'
                          : val ? '#166534' : '#292524',
                        color: isTarget
                          ? stateInfo.color
                          : isRowActive || isColActive
                          ? '#94a3b8'
                          : val ? '#22c55e' : '#64748b',
                        boxShadow: isTarget ? `0 0 8px ${stateInfo.color}66` : 'none',
                      }}
                    >
                      {val}
                    </button>
                  )
                })}

                {/* Sense amp indicator */}
                <div
                  className="w-5 h-8 ml-1 rounded flex items-center justify-center text-xs transition-all duration-200"
                  style={{
                    backgroundColor: activeRow === r || refreshRow === r ? '#f59e0b22' : '#1e293b',
                    color: activeRow === r || refreshRow === r ? '#f59e0b' : '#334155',
                  }}
                  title="Sense amplifier"
                >
                  ⚡
                </div>
              </div>
            </div>
          ))}

          <div className="text-xs text-dram-muted mt-2 ml-8">
            ← Row addr ↕ — Col addr → &nbsp;⚡ = Sense Amp
          </div>
        </div>

        {/* Log */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-dram-muted uppercase mb-2">Event Log</div>
          <div className="bg-dram-bg rounded-lg p-3 font-mono text-xs space-y-1 min-h-32">
            {log.map((entry, i) => (
              <div key={i} className={i === 0 ? 'text-dram-text' : 'text-dram-muted/60'}>
                {i === 0 ? '▶ ' : '  '}{entry}
              </div>
            ))}
          </div>
          <p className="text-xs text-dram-muted mt-3">
            {opMode === 'read'
              ? 'Click any cell to perform a full RAS → CAS → Data read sequence.'
              : `Click any cell to write a ${writeVal} into it.`}
          </p>
        </div>
      </div>
    </div>
  )
}
