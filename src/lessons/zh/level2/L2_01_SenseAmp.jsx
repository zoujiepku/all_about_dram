import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import SenseAmpSim from '../../../visualizations/level2/SenseAmpSim'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_01() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 01 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">灵敏放大器设计</h1>
        <p className="text-dram-muted mt-2">交叉耦合反相器锁存、电荷共享 ΔV 以及噪声裕量</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">与 Level 1 的联系：</strong>在第 4 模块（阵列组织）中，你学到了灵敏放大器（SA）用于检测存储单元连接到位线后留下的微小电压摆幅。本节深入 SA 内部：它使用多少个晶体管、如何保证可靠性，以及如何量化噪声裕量。
      </div>

      <SenseAmpSim />

      <h2>电荷共享问题</h2>
      <p>
        DRAM 存储单元将电荷存储在电容 Cs ≈ 10–30 fF 上。位线具有寄生电容
        Cbl ≈ 100–400 fF，通常是存储电容的 10–20 倍。当字线打开访问晶体管时，
        电荷在 Cs 和 Cbl 之间重新分配，直至达到平衡：
      </p>
      <p>
        <code>V_BL = (Cs × V_cell + Cbl × Vdd/2) / (Cs + Cbl)</code>
      </p>
      <p>
        位线预充电至 Vdd/2，因此信号摆幅为：
      </p>
      <p>
        <code>ΔV = V_BL − Vdd/2 = Cs / (Cs + Cbl) × (V_cell − Vdd/2)</code>
      </p>
      <p>
        对于完全充电的存储单元（V_cell = Vdd）和典型参数（Cs = 20 fF、Cbl = 200 fF、Vdd = 1.2 V）：
      </p>
      <p>
        <code>ΔV = (20 / 220) × 0.6 V ≈ 55 mV</code>
      </p>
      <p>
        这 55 mV 必须从噪声中可靠地放大到完整的 Vdd/GND 电平——这正是灵敏放大器的任务。
      </p>

      <h2>交叉耦合锁存器</h2>
      <p>
        DRAM 灵敏放大器是一个<strong>交叉耦合反相器锁存器</strong>——两个 CMOS 反相器的输入和输出互相交换：
      </p>
      <ul>
        <li>M3（PMOS）+ M1（NMOS）构成反相器 1：输入 = BLB，输出 = BL</li>
        <li>M4（PMOS）+ M2（NMOS）构成反相器 2：输入 = BL，输出 = BLB</li>
      </ul>
      <p>
        锁存器由两个使能信号激活：<strong>SAP</strong>（SA P 型使能）将 PMOS 源极连接到 Vdd，
        <strong>SAN</strong>（SA N 型使能）将 NMOS 源极连接到 GND。SA 触发前，两个使能信号均处于 Vdd/2——锁存器处于"浮空"状态，位线停留在电荷共享平衡电位。
      </p>
      <p>
        SAP/SAN 同时触发时，两个反相器的电源均接通。电压略高的一侧（BL = Vdd/2 + ΔV）通过正反馈向 Vdd 拉升；电压较低的一侧（BLB = Vdd/2）被拉向 GND。锁存器在 1–2 ns 内完成判决。
      </p>

      <h2>噪声裕量与失调</h2>
      <p>
        最小可检测 ΔV 并非零——M1/M2 和 M3/M4 之间的晶体管失配会产生等效输入失调电压
        V_os ≈ 5–20 mV。若 ΔV &lt; V_os，锁存器可能向错误方向判决，导致读出比特翻转。
      </p>
      <p>
        <strong>自动调零失调消除：</strong>现代 DRAM 在 BLB 侧接入一个"哑元"存储单元，其存储电荷精确为半 Vdd，从而提供干净的参考电压。更先进的技术在每次灵敏周期前对锁存失调进行采样并消除（自动调零），使 ΔV 最小可至 20–30 mV 仍能正常工作。
      </p>

      <h2>SA 触发时序</h2>
      <ol>
        <li>预充电：通过均衡晶体管将 BL 和 BLB 均驱动至 Vdd/2</li>
        <li>关闭均衡：BL 和 BLB 浮空</li>
        <li>字线上升：存储单元连接到 BL，发生电荷共享（ΔV ≈ 55 mV）</li>
        <li>SA 使能（SAP 下降、SAN 上升）：锁存器触发并再生，BL → Vdd，BLB → 0</li>
        <li>列选通：将目标比特读出到数据总线</li>
        <li>恢复：BL 保持在 Vdd，字线保持高电平——存储电容重新充电至 Vdd</li>
        <li>预充电：字线下降，均衡电路将 BL = BLB = Vdd/2 恢复，为下次访问做准备</li>
      </ol>

      <div className="rounded-lg p-4 bg-dram-bg border border-dram-border text-xs font-mono space-y-1 my-4">
        <div className="text-dram-blue">// 灵敏放大器时序预算</div>
        <div>tRCD = 16 ns  // 字线到 SA 触发（等待电荷共享稳定）</div>
        <div>tCL  = 16 ns  // SA 触发到 DQ 引脚数据有效</div>
        <div>tWR  = 15 ns  // 写恢复（预充电前存储单元需重新充电）</div>
      </div>

      <LessonNav lessonId={1} onComplete={() => markComplete(1)} lessons={lessonsL2Zh} />
    </div>
  )
}
