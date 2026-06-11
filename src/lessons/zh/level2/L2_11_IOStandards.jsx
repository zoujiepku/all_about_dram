import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import ODTViz from '../../../visualizations/level2/ODTViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_11() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 模块 11 · D 单元：信号完整性与 I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">I/O 标准与终端匹配</h1>
        <p className="text-dram-muted mt-2">SSTL-1.2 与 POD-1.2 对比、片上终端（ODT）、SSO 噪声与阻抗匹配</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在模块 9（现代 DRAM）中，你了解到 DDR5 工作在 1.1 V。I/O 标准精确定义了在该电压下信号的驱动与终端方式——哪种电平代表"1"和"0"，以及如何防止信号畸变。
      </div>

      <ODTViz />

      <h2>SSTL-1.2：截线串联终端逻辑</h2>
      <p>
        DDR3 使用 SSTL-1.5，DDR4 命令/地址总线使用 <strong>SSTL-1.2</strong>。主要特性如下：
      </p>
      <ul>
        <li><strong>Vddq = 1.2 V</strong>：I/O 电路供电电压</li>
        <li>输出驱动：推挽 CMOS。驱动"1"时，PMOS 将 DQ 上拉至 Vddq；驱动"0"时，NMOS 将 DQ 下拉至 GND</li>
        <li>标称输出阻抗：约 34 Ω（限制驱动器切换时的电流）</li>
        <li>终端：片上 Rtt 连接至 Vddq/2（伪差分方式）</li>
        <li>有效"1"：V_DQ &gt; V_IH = 0.6 × Vddq；有效"0"：V_DQ &lt; V_IL = 0.4 × Vddq</li>
      </ul>

      <h2>POD-1.2：伪开漏</h2>
      <p>
        DDR4 DQ/DQS 及 DDR5 数据总线使用 <strong>POD-1.2</strong>。与 SSTL 的核心区别如下：
      </p>
      <ul>
        <li>输出驱动：<strong>仅下拉开漏</strong>——只保留下拉 NMOS，上拉完全由连接至 Vddq 的片上终端电阻（Rtt）提供</li>
        <li>驱动"1"：输出三态，Rtt 被动将 DQ 上拉至 Vddq</li>
        <li>驱动"0"：NMOS 将 DQ 下拉至 GND，克服 Rtt 的上拉</li>
        <li>省去 PMOS 驱动器，降低了上拉网络产生的同步开关输出（SSO）噪声</li>
      </ul>
      <p>
        功耗降低效果显著：POD 仅在驱动"0"时耗电（单端终端），而 SSTL 在"0"和"1"切换时均通过直流终端路径耗电。
      </p>

      <h2>片上终端（ODT）时序</h2>
      <p>
        写操作期间，ODT 必须在接收端 DRAM 上启用；读操作期间必须禁用（避免对 DQ 总线造成负载）。JEDEC 规范定义了以下参数：
      </p>
      <ul>
        <li><strong>tAON/tAOF：</strong>ODT 使能/禁用延迟，从 ODT 命令到 Rtt 生效之间的时间</li>
        <li><strong>动态 ODT（dODT）：</strong>DDR3/4/5 支持 ODT 根据写命令自动切换，无需显式 ODT 命令；写恢复期间使用更小的阻抗值以降低总线负载</li>
      </ul>

      <h2>同步开关输出（SSO）噪声</h2>
      <p>
        当多个 DQ 位同时切换（完整 64 位总线翻转）时，封装电感上的集体 di/dt 在 Vddq 和 VSS 电源轨上产生电压尖峰。这就是 <strong>SSO 噪声</strong>，也称同步开关噪声（SSN）或 delta-I 噪声。
      </p>
      <p>
        DDR5 在 6400 MT/s、64 路同时输出驱动器工作时，SSO 噪声可达 100–200 mV。常用抑制措施包括：
      </p>
      <ul>
        <li>分布式片上封装去耦电容以吸收 di/dt</li>
        <li>增加 Vddq/VSS 球以降低封装电感</li>
        <li>受控输出边沿速率（以牺牲边沿速度换取更低的 SSO）</li>
        <li>POD 输出标准（与推挽相比，"1"→"0"翻转时 SSO 减半）</li>
      </ul>

      <h2>电源平面谐振</h2>
      <p>
        PCB 电源层与地层构成平行板电容器，两者之间存在电感，形成 LC 谐振。在谐振频率（通常为 300 MHz–3 GHz，取决于板尺寸）处，平面阻抗出现峰值，放大 SSO 噪声。PCB 设计工程师通过添加去耦电容来将谐振点移至工作频率范围之外，并对峰值进行阻尼抑制。
      </p>

      <LessonNav lessonId={11} onComplete={() => markComplete(11)} lessons={lessonsL2Zh} />
    </div>
  )
}
