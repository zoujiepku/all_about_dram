import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import EyeDiagramViz from '../../../visualizations/level2/EyeDiagramViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_12() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 12 模块 · 模块组 D：信号完整性与 I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">PAM4 与均衡技术</h1>
        <p className="text-dram-muted mt-2">NRZ 与 PAM4 编码对比、信噪比代价、CTLE/DFE 均衡，以及眼图分析</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在模块 9（现代 DRAM）中，你了解到 GDDR6 使用 PAM4 编码。本模块解析其背后的基本信号理论：PAM4 如何实现每符号 2 位的传输、其噪声容限代价，以及 CTLE 和 DFE 均衡如何恢复损失的裕量。
      </div>

      <EyeDiagramViz />

      <h2>NRZ 与 PAM4 对比</h2>
      <p>
        传统 DDR 采用 <strong>NRZ（Non-Return-to-Zero，不归零）</strong>编码：每个符号为高电平（位 1）或低电平（位 0）。为在不提高时钟频率的前提下使吞吐量翻倍，GDDR6 和 SerDes 接口采用 <strong>PAM4（四电平脉冲幅度调制）</strong>：
      </p>
      <ul>
        <li>4 个电压电平：L0（00）、L1（01）、L2（10）、L3（11）</li>
        <li>每个符号传输 2 位：log₂(4) = 2 位/符号</li>
        <li>符号率与 NRZ 相同 → 数据吞吐量提升 2 倍</li>
        <li>GDDR6 WCK 时钟以 2 倍数据速率运行（WCK:CK = 4:1 域边界）</li>
      </ul>

      <h2>信噪比代价</h2>
      <p>
        PAM4 的代价是噪声裕量大幅降低。NRZ 的眼图高度覆盖完整信号摆幅（V_swing）。PAM4 在相同摆幅内均匀分布 4 个电平：
      </p>
      <ul>
        <li>3 个眼图中每个的高度 = V_swing / 3</li>
        <li>仅为 NRZ 眼高的 1/3</li>
        <li>换算为分贝：20 log₁₀(1/3) ≈ −9.5 dB 信噪比代价</li>
      </ul>
      <p>
        在相同误码率（BER）目标下，PAM4 要求信道信噪比<strong>比 NRZ 高约 9.5 dB</strong>。这也是为何 PAM4 只在配备精密均衡器的场合才可行，且仅用于短距离传输（片上封装或短 PCB 走线，例如 GDDR6 封装）。
      </p>

      <h2>信道损耗与码间干扰</h2>
      <p>
        PCB 走线和封装互连在多 GHz 频率下表现为低通滤波器：由于趋肤效应（电流集中于导体表面），信号损耗大致按 √f 增长。这会造成<strong>码间干扰（ISI）</strong>：一个符号的能量扩散到相邻符号中，使眼图在时间轴方向"闭合"。
      </p>
      <p>
        在 16 Gbaud（GDDR6 数据速率）下，2 英寸 PCB 走线引入约 6–10 dB 插入损耗。若不加均衡，眼图将几乎完全闭合。
      </p>

      <h2>CTLE：连续时间线性均衡器</h2>
      <p>
        CTLE 是接收端的模拟高通滤波器，用于补偿信道的频率衰减特性。信道对高频信号的衰减越大，CTLE 对其的增益提升越大，从而恢复信号中高低频分量的幅度关系。
      </p>
      <p>
        CTLE 的频率响应由峰值频率和增益决定，属于固定特性。针对特定信道，最优 CTLE 参数在初始化训练阶段确定。单抽头 CTLE 可提供一阶补偿（约 6 dB/倍频程的衰减补偿）。
      </p>

      <h2>DFE：判决反馈均衡器</h2>
      <p>
        CTLE 是线性滤波器，在增强信号高频分量的同时也放大了高频噪声。DFE 则以非线性方式消除 ISI，且不放大噪声：
      </p>
      <ol>
        <li>对当前符号做出硬判决（确定其属于 4 个电平中的哪一个）</li>
        <li>利用判决结果计算该符号对<em>下一个</em>符号产生的 ISI 预测值</li>
        <li>在对下一个采样做出判决之前，将预测的 ISI 从采样值中减去</li>
      </ol>
      <p>
        DFE 基于历史判决结果运算——在 BER 较低时这些结果几乎无误——因此能在不放大噪声的前提下消除 ISI。其局限性在于：DFE 是因果系统，无法消除<em>未来</em>符号带来的 ISI（预游 ISI 须由 CTLE 或发送端 FFE 处理）。
      </p>

      <h2>抖动分量</h2>
      <p>
        总抖动（Tj）决定眼图在时间轴方向的开口缩减量：
      </p>
      <p>
        <code>Tj = Dj + n·σRj（BER = 10⁻¹²时）</code>
      </p>
      <ul>
        <li><strong>Dj（确定性抖动）：</strong>有界且可复现，来源包括 ISI、占空比失真、电源调制。以峰峰值衡量。</li>
        <li><strong>Rj（随机抖动）：</strong>由热噪声和闪烁噪声引起的无界高斯分布，以标准差 σ 表征。BER = 10⁻¹² 时，n = 14。</li>
      </ul>
      <p>
        对于 16 Gbaud 的 GDDR6（每位 62.5 ps），Tj 预算通常为 0.2–0.3 UI（12–19 ps），大致分配为 0.1 UI Dj + 0.1–0.15 UI Rj。
      </p>

      {/* 完成卡片 */}
      <div className="mt-8 rounded-xl p-6 bg-gradient-to-br from-dram-blue/10 to-dram-green/10 border border-dram-blue/30 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <h3 className="text-xl font-bold text-dram-text mb-2">Level 2 全部完成！</h3>
        <p className="text-dram-muted text-sm">
          你已学完全部四个进阶单元：电路设计、系统架构、可靠性与安全性，以及信号完整性。至此，你已从晶体管级到系统级，对 DRAM 的工作原理建立了工程深度的理解。
        </p>
      </div>

      <LessonNav lessonId={12} onComplete={() => markComplete(12)} lessons={lessonsL2Zh} />
    </div>
  )
}
