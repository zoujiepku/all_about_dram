import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import RankDiagram from '../../../visualizations/level2/RankDiagram'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_05() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 05 模块 · 模块组 B：系统架构</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Rank、DIMM 与通道</h1>
        <p className="text-dram-muted mt-2">72 位总线结构、Rank 复用、tRTRS 时序，以及双通道交织</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在第 9 模块（现代 DRAM）中，你已经了解到
        DDR5 拥有两条 32 位子通道，以及 DIMM 使用 72 位总线。本节将深入讲解其电气与时序细节：
        多颗芯片和多个 Rank 如何共享总线，以及如何防止它们之间的冲突。
      </div>

      <RankDiagram />

      <h2>DIMM 总线结构：72 = 64 + 8</h2>
      <p>
        标准 UDIMM（无缓冲 DIMM）向内存控制器提供一条 <strong>72 位总线</strong>：
        64 位数据位 + 8 位 ECC 校验位。DIMM 上每颗 DRAM 芯片贡献固定数量的数据引脚：
      </p>
      <ul>
        <li><strong>×8 芯片</strong>（最常见）：每面 9 颗芯片 × 8 位数据引脚 = 72 位</li>
        <li><strong>×4 芯片</strong>（ECC 服务器）：每面 18 颗芯片 × 4 位数据引脚 = 72 位；支持 Chipkill</li>
        <li><strong>×16 芯片</strong>（低成本 SODIMM）：芯片数量更少，不支持 ECC</li>
      </ul>
      <p>
        DDR5 将 64 位通道拆分为<strong>两条独立的 32 位子通道</strong>（各自拥有独立的 CMD/CA 总线），
        从而将命令带宽翻倍，并支持更细粒度的 Bank 调度。
      </p>

      <h2>Rank：在单一通道上扩展容量</h2>
      <p>
        <strong>Rank</strong> 是一组响应同一片选（CS）信号的 DRAM 芯片的集合，这些芯片共同提供完整的
        72 位总线宽度。双 Rank DIMM 拥有两个 Rank，它们共享相同的地址和数据引脚，但各自拥有独立的 CS# 线。
      </p>
      <p>
        在任意时刻，只有一个 Rank 可以驱动 DQ 总线。在 Rank 切换时，正在使用总线的 Rank 必须先将
        其 DQ 驱动器置为高阻态（tri-state），然后新的 Rank 才能驱动总线。这个保护时间称为
        <strong> tRTRS（Rank 间切换时间）</strong>——通常为 1–2 个时钟周期（DDR4-3200 下约 7.5 ns）。
      </p>
      <p>
        tRTRS 正是双 Rank DIMM 持续带宽略低于单 Rank 的原因：在两个 Rank 交替工作时，
        控制器必须插入空闲周期。
      </p>

      <h2>双通道与四通道交织</h2>
      <p>
        现代平台支持多条独立的内存通道。双通道控制器拥有两条各自独立的 72 位总线，
        分别连接各自的 DIMM，实际上将带宽翻倍：
      </p>
      <ul>
        <li>DDR4-3200 单通道：3200 × 8 字节 = 25.6 GB/s</li>
        <li>DDR4-3200 双通道：51.2 GB/s</li>
        <li>DDR5-6400 双通道：102.4 GB/s</li>
      </ul>
      <p>
        操作系统和内存控制器以 64 或 128 字节的粒度将缓存行交织分布在各通道之间，
        使顺序访问交替命中不同通道，同时受益于两条通道的带宽。
      </p>

      <h2>NUMA 效应</h2>
      <p>
        在多路服务器系统中，每个 CPU 插槽拥有各自的内存通道。访问连接到远端插槽的内存时，
        需要跨越插槽间互联（例如 UPI 或 Infinity Fabric），会额外增加 30–80 ns 的延迟并降低带宽。
        这种<strong>非一致性内存访问（NUMA）</strong>拓扑要求操作系统和应用程序具备 NUMA 感知能力，
        以将线程与其数据尽量放置在同一 NUMA 节点上。
      </p>

      <div className="rounded-lg p-4 bg-dram-bg text-xs font-mono space-y-1 mt-4">
        <div className="text-dram-blue">// Rank 切换时序参数</div>
        <div>tRTRS  = rank-to-rank switch = ~7.5 ns (1–2 ck)</div>
        <div>tODTL  = ODT latency (ODT switches with rank switch)</div>
        <div>tCCD_L = CAS-to-CAS within same bank group = 5 ck (DDR4)</div>
        <div>tCCD_S = CAS-to-CAS different bank group = 4 ck (DDR4)</div>
      </div>

      <LessonNav lessonId={5} onComplete={() => markComplete(5)} lessons={lessonsL2Zh} />
    </div>
  )
}
