import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import WordlineViz from '../../../visualizations/level2/WordlineViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_02() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 02 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">字线与位线驱动器</h1>
        <p className="text-dram-muted mt-2">电荷泵升压、位线预充电、负字线电压以及存储单元干扰</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">与 Level 1 的联系：</strong>在第 3 模块（DRAM 存储单元）和第 5 模块（读操作）中，字线被简单处理为高/低两态信号。本节探讨为什么字线必须摆幅<em>高于</em> Vdd，以及为什么在待机状态下必须摆幅<em>低于</em> GND。
      </div>

      <WordlineViz lang="zh" />

      <h2>为何需要 Vpp &gt; Vdd</h2>
      <p>
        存储单元访问晶体管是 NMOS 器件。要将存储电容完全充电至 Vdd（写入"1"），栅极电压必须超过 Vdd + Vth：
      </p>
      <p>
        <code>V_WL ≥ V_dd + V_th(body)</code>
      </p>
      <p>
        当 Vdd = 1.2 V、NMOS 阈值电压约为 0.5 V（含体效应）时，字线电压至少需达到 1.7 V。实际设计中采用
        <strong>Vpp = 2.5–3.0 V</strong> 以提供裕量并应对工艺偏差。Vpp 由片上<strong>电荷泵（升压电路）</strong>生成，将 Vdd 升至所需电压。
      </p>
      <p>
        在 20 nm 以下工艺节点，NMOS 阈值电压降至约 0.3 V，所需 Vpp 随之降低，但短沟道效应和 DIBL（漏致势垒降低）带来了新的设计约束。
      </p>

      <h2>位线预充电与均衡</h2>
      <p>
        每次访问前，位线对（BL 和 BLB）必须被驱动至 Vdd/2。这由一个由三个 NMOS 晶体管组成的
        <strong>预充电/均衡电路</strong>完成：
      </p>
      <ul>
        <li>一个 NMOS 将 BL 连接至 Vdd/2</li>
        <li>一个 NMOS 将 BLB 连接至 Vdd/2</li>
        <li>一个 NMOS 将 BL 直接连接至 BLB（均衡）</li>
      </ul>
      <p>
        均衡晶体管至关重要：无论前一周期留下何种残余电压差，它都能强制使 BL = BLB，消除可能导致误判的残余噪声。
      </p>

      <h2>负字线电压（nWL）</h2>
      <p>
        待机状态下（字线静止），理想情况是 V_GS = −∞ 以彻底截止 NMOS 晶体管并消除亚阈值泄漏。在实际中，现代 DRAM 在待机时施加
        <strong>负字线电压 nWL ≈ −0.5 V 至 −0.7 V</strong>。
      </p>
      <p>
        其效果为：当 V_G = −0.5 V、V_S ≈ 0 V 时，V_GS = −0.5 V（栅极低于源极 0.5 V），NMOS 进入更深的截止区，体效应使等效阈值电压提高，亚阈值泄漏电流降低约 10 倍。这直接延长了存储单元的数据保持时间——对于在 85°C 下满足 JEDEC 规定的 64 ms 刷新间隔至关重要。
      </p>

      <h2>半选期间的存储单元干扰</h2>
      <p>
        在阵列中，每一行共享一条字线，每一列共享一条位线。当行 A 被激活时，行 A 中所有存储单元均被读取/恢复。但列电路只选择其中一个存储单元——其余存储单元会经历<strong>读干扰</strong>：其电荷被部分共享后再恢复。
      </p>
      <p>
        单次访问的干扰量虽小，但会累积叠加。对于未处于激活行的存储单元（半选状态），字线保持低电平，位线可能因耦合而轻微抖动——这称为<strong>位线干扰</strong>。负字线电压通过将未选中的字线牢固关断来抑制此问题。
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>信号</div><div>有效电平</div><div>待机电平</div>
        </div>
        {[
          ['Wordline (WL)', 'Vpp = 2.5–3.0 V', 'nWL = −0.5 to −0.7 V'],
          ['Bitline (BL/BLB)', 'Vdd（逻辑 1）或 GND（逻辑 0）', 'Vdd/2（预充电）'],
          ['SA enable (SAP)', 'GND（锁存器触发）', 'Vdd/2（浮空）'],
          ['SA enable (SAN)', 'Vdd（锁存器触发）', 'Vdd/2（浮空）'],
        ].map(([sig, act, std]) => (
          <div key={sig} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-text font-mono">{sig}</div>
            <div className="text-dram-green">{act}</div>
            <div className="text-dram-muted">{std}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={2} onComplete={() => markComplete(2)} lessons={lessonsL2Zh} />
    </div>
  )
}
