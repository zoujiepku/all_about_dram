import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

// English lessons – Level 1
import L01 from './lessons/01_MemoryHierarchy'
import L02 from './lessons/02_SemiconductorBasics'
import L03 from './lessons/03_DRAMCell'
import L04 from './lessons/04_DRAMArray'
import L05 from './lessons/05_ReadOperation'
import L06 from './lessons/06_WriteRefresh'
import L07 from './lessons/07_TimingParams'
import L08 from './lessons/08_Evolution'
import L09 from './lessons/09_ModernDRAM'
import L10 from './lessons/10_HBM3D'
import L11 from './lessons/11_EmergingTech'

// English lessons – Level 2
import L2_01 from './lessons/level2/L2_01_SenseAmp'
import L2_02 from './lessons/level2/L2_02_WordlineDrivers'
import L2_03 from './lessons/level2/L2_03_DecoderDesign'
import L2_04 from './lessons/level2/L2_04_MemoryController'
import L2_05 from './lessons/level2/L2_05_RanksDIMMs'
import L2_06 from './lessons/level2/L2_06_BankParallelism'
import L2_07 from './lessons/level2/L2_07_RowHammer'
import L2_08 from './lessons/level2/L2_08_ECC'
import L2_09 from './lessons/level2/L2_09_Retention'
import L2_10 from './lessons/level2/L2_10_SignalIntegrity'
import L2_11 from './lessons/level2/L2_11_IOStandards'
import L2_12 from './lessons/level2/L2_12_PAM4'

// Chinese lessons – Level 1
import ZhL01 from './lessons/zh/01_MemoryHierarchy'
import ZhL02 from './lessons/zh/02_SemiconductorBasics'
import ZhL03 from './lessons/zh/03_DRAMCell'
import ZhL04 from './lessons/zh/04_DRAMArray'
import ZhL05 from './lessons/zh/05_ReadOperation'
import ZhL06 from './lessons/zh/06_WriteRefresh'
import ZhL07 from './lessons/zh/07_TimingParams'
import ZhL08 from './lessons/zh/08_Evolution'
import ZhL09 from './lessons/zh/09_ModernDRAM'
import ZhL10 from './lessons/zh/10_HBM3D'
import ZhL11 from './lessons/zh/11_EmergingTech'

// Chinese lessons – Level 2
import ZhL2_01 from './lessons/zh/level2/L2_01_SenseAmp'
import ZhL2_02 from './lessons/zh/level2/L2_02_WordlineDrivers'
import ZhL2_03 from './lessons/zh/level2/L2_03_DecoderDesign'
import ZhL2_04 from './lessons/zh/level2/L2_04_MemoryController'
import ZhL2_05 from './lessons/zh/level2/L2_05_RanksDIMMs'
import ZhL2_06 from './lessons/zh/level2/L2_06_BankParallelism'
import ZhL2_07 from './lessons/zh/level2/L2_07_RowHammer'
import ZhL2_08 from './lessons/zh/level2/L2_08_ECC'
import ZhL2_09 from './lessons/zh/level2/L2_09_Retention'
import ZhL2_10 from './lessons/zh/level2/L2_10_SignalIntegrity'
import ZhL2_11 from './lessons/zh/level2/L2_11_IOStandards'
import ZhL2_12 from './lessons/zh/level2/L2_12_PAM4'

const STORAGE_KEY_L1 = 'dram-tutorial-completed'
const STORAGE_KEY_L2 = 'dram-tutorial-l2-completed'

function makeCompletedState(key) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

export default function App() {
  const [completedL1, setCompletedL1] = useState(() => makeCompletedState(STORAGE_KEY_L1))
  const [completedL2, setCompletedL2] = useState(() => makeCompletedState(STORAGE_KEY_L2))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_L1, JSON.stringify([...completedL1]))
  }, [completedL1])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_L2, JSON.stringify([...completedL2]))
  }, [completedL2])

  const markCompleteL1 = (id) => setCompletedL1((prev) => new Set([...prev, id]))
  const markCompleteL2 = (id) => setCompletedL2((prev) => new Set([...prev, id]))

  return (
    <BrowserRouter>
      <Routes>
        {/* ── English Level 1 ── */}
        <Route path="/" element={<Layout level={1} lang="en" completed={completedL1} markComplete={markCompleteL1} />}>
          <Route index element={<Navigate to="/lesson/1" replace />} />
          <Route path="lesson/1" element={<L01 />} />
          <Route path="lesson/2" element={<L02 />} />
          <Route path="lesson/3" element={<L03 />} />
          <Route path="lesson/4" element={<L04 />} />
          <Route path="lesson/5" element={<L05 />} />
          <Route path="lesson/6" element={<L06 />} />
          <Route path="lesson/7" element={<L07 />} />
          <Route path="lesson/8" element={<L08 />} />
          <Route path="lesson/9" element={<L09 />} />
          <Route path="lesson/10" element={<L10 />} />
          <Route path="lesson/11" element={<L11 />} />
        </Route>

        {/* ── English Level 2 ── */}
        <Route path="/level2" element={<Layout level={2} lang="en" completed={completedL2} markComplete={markCompleteL2} />}>
          <Route index element={<Navigate to="/level2/lesson/1" replace />} />
          <Route path="lesson/1" element={<L2_01 />} />
          <Route path="lesson/2" element={<L2_02 />} />
          <Route path="lesson/3" element={<L2_03 />} />
          <Route path="lesson/4" element={<L2_04 />} />
          <Route path="lesson/5" element={<L2_05 />} />
          <Route path="lesson/6" element={<L2_06 />} />
          <Route path="lesson/7" element={<L2_07 />} />
          <Route path="lesson/8" element={<L2_08 />} />
          <Route path="lesson/9" element={<L2_09 />} />
          <Route path="lesson/10" element={<L2_10 />} />
          <Route path="lesson/11" element={<L2_11 />} />
          <Route path="lesson/12" element={<L2_12 />} />
        </Route>

        {/* ── Chinese Level 1 ── */}
        <Route path="/zh" element={<Layout level={1} lang="zh" completed={completedL1} markComplete={markCompleteL1} />}>
          <Route index element={<Navigate to="/zh/lesson/1" replace />} />
          <Route path="lesson/1" element={<ZhL01 />} />
          <Route path="lesson/2" element={<ZhL02 />} />
          <Route path="lesson/3" element={<ZhL03 />} />
          <Route path="lesson/4" element={<ZhL04 />} />
          <Route path="lesson/5" element={<ZhL05 />} />
          <Route path="lesson/6" element={<ZhL06 />} />
          <Route path="lesson/7" element={<ZhL07 />} />
          <Route path="lesson/8" element={<ZhL08 />} />
          <Route path="lesson/9" element={<ZhL09 />} />
          <Route path="lesson/10" element={<ZhL10 />} />
          <Route path="lesson/11" element={<ZhL11 />} />
        </Route>

        {/* ── Chinese Level 2 ── */}
        <Route path="/zh/level2" element={<Layout level={2} lang="zh" completed={completedL2} markComplete={markCompleteL2} />}>
          <Route index element={<Navigate to="/zh/level2/lesson/1" replace />} />
          <Route path="lesson/1" element={<ZhL2_01 />} />
          <Route path="lesson/2" element={<ZhL2_02 />} />
          <Route path="lesson/3" element={<ZhL2_03 />} />
          <Route path="lesson/4" element={<ZhL2_04 />} />
          <Route path="lesson/5" element={<ZhL2_05 />} />
          <Route path="lesson/6" element={<ZhL2_06 />} />
          <Route path="lesson/7" element={<ZhL2_07 />} />
          <Route path="lesson/8" element={<ZhL2_08 />} />
          <Route path="lesson/9" element={<ZhL2_09 />} />
          <Route path="lesson/10" element={<ZhL2_10 />} />
          <Route path="lesson/11" element={<ZhL2_11 />} />
          <Route path="lesson/12" element={<ZhL2_12 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
