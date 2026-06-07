import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="/" element={<Layout level={1} completed={completedL1} markComplete={markCompleteL1} />}>
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

        <Route path="/level2" element={<Layout level={2} completed={completedL2} markComplete={markCompleteL2} />}>
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
      </Routes>
    </BrowserRouter>
  )
}
