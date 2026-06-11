import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import FlyByViz from '../../../visualizations/level2/FlyByViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_10() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 模块 10 · D 单元：信号完整性与 I/O</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DDR 信号完整性</h1>
        <p className="text-dram-muted mt-2">Fly-by 拓扑、写均衡、读 DQS 对齐、ZQ 校准与串扰</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在模块 8（DRAM 演进）中，你了解到 DDR3 为支持更高速度引入了 fly-by 拓扑。本模块解析该拓扑至关重要的原因：信号反射、各 DIMM 的传播延迟差异，以及用于纠正这些问题的校准协议。
      </div>

      <FlyByViz />

      <h2>Fly-By 拓扑</h2>
      <p>
        在 DDR4 和 DDR5 中，所有信号（CK、CMD/CA、DQ、DQS）均在一条<strong>菊花链总线</strong>上传输，依次经过每个 DIMM 插槽。核心设计原则是：主信号线为受控阻抗传输线（典型 Z₀ = 50 Ω），每个 DIMM 通过短截线（stub）接入。
      </p>
      <p>
        短截线（&lt;0.5 英寸）仅在总线阻抗上产生微小不连续，反射信号在引起波形畸变前就被片上终端（ODT）吸收。长截线则会在连接点产生显著反射，形成谐振腔，限制最高工作频率。
      </p>
      <p>
        T 形拓扑（DDR2/DDR3 某些平台采用）在中点分支信号，对称几何结构保证了到每个 DIMM 的等长路径，但 T 形结点产生较大反射，将带宽限制在约 533 MT/s 以内，这也解释了为何 DDR3 在 1866 MT/s 以上速度时转向 fly-by 拓扑。
      </p>

      <h2>写均衡（Write Leveling）</h2>
      <p>
        在 fly-by 拓扑中，时钟信号（CK）和数据选通信号（DQS）都沿菊花链传输。由于走同一路径，时钟到达每个 DIMM 的延迟逐渐增大（DIMM 4 接收到的 CK 比 DIMM 1 晚约 3–4 ns）。若 DQS 由控制器内部时钟直接生成，则与远端 DIMM 所见的延迟 CK 存在相位偏差。
      </p>
      <p>
        <strong>写均衡</strong>（JEDEC DDR3 及以上版本）：每个 rank 独立通过采样训练模式来调整 DQS 输出相位。DRAM 反馈 DQS 边沿是否早于或晚于 CK 边沿，控制器逐步调整每 rank 的 DQS 延迟直至对齐。
      </p>

      <h2>读 DQS 对齐</h2>
      <p>
        读操作期间，DRAM 驱动的 DQS 以每个数据位的中心为基准（中心对齐 DQS）。控制器须根据往返传播延迟对 DQS 采集窗口进行延迟补偿。<strong>DQS 门训练</strong>序列用于定位 DQS 前导码，并对齐采集窗口。
      </p>
      <p>
        DDR5 以寄存器式 DQS 方案取代门控 DQS，更严格地定义了 DQ 与 DQS 的关系，从而简化了读训练流程。
      </p>

      <h2>ZQ 校准</h2>
      <p>
        DDR SDRAM 芯片的输出驱动阻抗（Rout）和片上终端阻抗（Rtt）须与 PCB 走线阻抗（约 50 Ω）匹配，以减少反射。然而，两者会随温度和电压发生漂移。<strong>ZQ 校准</strong>利用外部精密电阻（ZQCS 引脚，典型值 240 Ω）作为基准，定期重新校准内部驱动阻抗，校准时长为 tZQCS = 64 ns（短校准）或 tZQCL = 320 ns（长校准）。
      </p>

      <h2>串扰与保护间距</h2>
      <p>
        DDR 总线在多层 PCB 上以密集走线高速传输。相邻信号线构成耦合传输线：<strong>主动线（aggressor）</strong>切换时，通过容性（前向）和感性（后向）耦合在平行的<strong>受害线（victim）</strong>上感应出电压尖峰。
      </p>
      <p>
        在 DDR5-6400（3.2 GHz）下，串扰感应噪声可达 30–50 mV——相对于约 120 mV 的电压摆幅而言不容忽视。PCB 设计工程师通过<strong>保护间距</strong>加以应对：在关键信号对之间增加额外间距，并采用差分布线（CK+/CK−、DQS+/DQS−）以抵消共模噪声。
      </p>

      <LessonNav lessonId={10} onComplete={() => markComplete(10)} lessons={lessonsL2Zh} />
    </div>
  )
}
