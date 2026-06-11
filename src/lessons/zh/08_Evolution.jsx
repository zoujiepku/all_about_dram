import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import EvolutionTimelineViz from '../../visualizations/EvolutionTimelineViz'
import { lessonsZh } from '../../data/lessons.zh'

function GenerationTable() {
  const gens = [
    { gen: 'FPM DRAM', year: '1987', voltage: '5V', speed: '20–50 MT/s', prefetch: '1n', bw: '~0.2 GB/s', key: '首创页模式——保持行不变，递增 CAS' },
    { gen: 'EDO DRAM', year: '1994', voltage: '5V', speed: '40–66 MT/s', prefetch: '1n', bw: '~0.4 GB/s', key: '输出锁存——CAS 流水线，带宽提升约 40%' },
    { gen: 'SDRAM', year: '1996', voltage: '3.3V', speed: '66–133 MT/s', prefetch: '1n', bw: '~1 GB/s', key: '引入同步时钟——突发模式、命令队列' },
    { gen: 'DDR', year: '2000', voltage: '2.5V', speed: '200–400 MT/s', prefetch: '2n', bw: '~3.2 GB/s', key: '时钟双沿传输——2n 预取缓冲区' },
    { gen: 'DDR2', year: '2003', voltage: '1.8V', speed: '400–1066 MT/s', prefetch: '4n', bw: '~8.5 GB/s', key: '4n 预取、片上终端（ODT）、更低电压、更快 I/O' },
    { gen: 'DDR3', year: '2007', voltage: '1.5V', speed: '800–2133 MT/s', prefetch: '8n', bw: '~17 GB/s', key: '8n 预取、飞越拓扑（菊花链）、XMP 超频' },
    { gen: 'DDR4', year: '2014', voltage: '1.2V', speed: '1600–3200 MT/s', prefetch: '8n', bw: '~25 GB/s', key: 'Bank Group、POD 信号标准、逐引脚校准' },
    { gen: 'DDR5', year: '2021', voltage: '1.1V', speed: '4800–8400 MT/s', prefetch: '16n', bw: '~67 GB/s', key: '2 个子通道、片上 ECC、模组集成 PMIC、按 Bank 刷新' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">代次</th>
            <th className="text-left p-3 text-dram-muted font-semibold">年份</th>
            <th className="text-left p-3 text-dram-muted font-semibold">电压</th>
            <th className="text-left p-3 text-dram-muted font-semibold">速率</th>
            <th className="text-left p-3 text-dram-muted font-semibold">预取</th>
            <th className="text-left p-3 text-dram-muted font-semibold">峰值带宽</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">核心创新</th>
          </tr>
        </thead>
        <tbody>
          {gens.map((g, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-bold text-dram-blue">{g.gen}</td>
              <td className="p-3 text-dram-muted">{g.year}</td>
              <td className="p-3 font-mono text-dram-green">{g.voltage}</td>
              <td className="p-3 font-mono text-dram-amber">{g.speed}</td>
              <td className="p-3 font-mono text-dram-muted">{g.prefetch}</td>
              <td className="p-3 font-mono text-dram-text">{g.bw}</td>
              <td className="p-3 text-dram-muted hidden md:table-cell">{g.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PrefetchDiagram() {
  const gens = [
    { label: 'SDRAM\n1n', n: 1, color: '#64748b' },
    { label: 'DDR\n2n', n: 2, color: '#3b82f6' },
    { label: 'DDR2\n4n', n: 4, color: '#22c55e' },
    { label: 'DDR3/4\n8n', n: 8, color: '#f59e0b' },
    { label: 'DDR5\n16n', n: 16, color: '#a855f7' },
  ]
  const maxN = 16
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        预取缓冲区宽度——带宽扩展的核心引擎
      </h3>
      <div className="flex flex-col gap-3">
        {gens.map((g) => (
          <div key={g.label} className="flex items-center gap-3">
            <div className="text-xs font-mono text-dram-muted w-20 text-right whitespace-pre-line leading-tight">{g.label}</div>
            <div className="flex-1 h-6 rounded bg-dram-bg overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${(g.n / maxN) * 100}%`, backgroundColor: g.color + '55', borderRight: `2px solid ${g.color}` }}
              />
            </div>
            <div className="text-xs font-mono w-16" style={{ color: g.color }}>×{g.n} 个单元</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        每一代在一个内部阵列周期内读取更多存储单元，并以更快的速度通过外部总线发送。
        存储阵列时钟保持较低频率（功耗与发热更低）；只有 I/O 总线加速。DDR5 每阵列
        周期读取 16 个存储单元，同时 I/O 总线运行速度是阵列的 16 倍——即使在
        6400 MT/s 下，阵列本身只需运行在 300–400 MHz。
      </p>
    </div>
  )
}

function DDR4BankGroupDiagram() {
  const groups = [
    { id: 'BG0', banks: ['B0', 'B1', 'B2', 'B3'], color: '#3b82f6' },
    { id: 'BG1', banks: ['B4', 'B5', 'B6', 'B7'], color: '#22c55e' },
    { id: 'BG2', banks: ['B8', 'B9', 'B10', 'B11'], color: '#f59e0b' },
    { id: 'BG3', banks: ['B12', 'B13', 'B14', 'B15'], color: '#a855f7' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DDR4 Bank Group——4 组 × 4 个 Bank = 16 个 Bank
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {groups.map((g) => (
          <div key={g.id} className="rounded-lg p-3 text-center" style={{ border: `1px solid ${g.color}44`, backgroundColor: g.color + '0d' }}>
            <div className="text-xs font-bold mb-2" style={{ color: g.color }}>{g.id}</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {g.banks.map((b) => (
                <div key={b} className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: g.color + '22', color: g.color }}>{b}</div>
              ))}
            </div>
            <div className="text-xs text-dram-muted mt-2">共享 IO 路径</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-dram-muted">
        <div className="bg-dram-bg rounded p-2">
          <span className="text-dram-green font-bold">tCCD_S = 4 周期</span>——跨 Bank Group 的 CAS 到 CAS
        </div>
        <div className="bg-dram-bg rounded p-2">
          <span className="text-dram-amber font-bold">tCCD_L = 5 周期</span>——同 Bank Group 内的 CAS 到 CAS
        </div>
      </div>
      <p className="text-xs text-dram-muted mt-2">
        Bank Group 共享内部数据路径。先读 BG0 再迅速读 BG1 使用两条独立路径（tCCD_S）。
        连续两次读 BG0 则复用同一路径，需要更长的稳定时间（tCCD_L）。理想的控制器
        应在四个 Bank Group 之间交替调度请求。
      </p>
    </div>
  )
}

export default function L08() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 08</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DRAM 发展历程</h1>
        <p className="text-dram-muted mt-2">从 FPM DRAM（1987 年）到 DDR5（2021 年）——每一代如何从相同的存储单元中榨取更多带宽</p>
      </div>

      <EvolutionTimelineViz />

      <h2>每一代究竟改变了什么</h2>
      <p>
        核心的 <strong>1T1C 存储单元在 40 年间几乎没有变化</strong>。存储电容仍约为
        20 fF，保持时间仍约为 64 ms，灵敏放大器仍需判决 55 mV 的差分信号。真正发生
        巨变的是存储阵列与外部世界之间的<em>接口</em>。每一代都引入了新技术，从相同
        的底层物理特性中提取更多带宽。
      </p>

      <h2>各代次详细参考</h2>
      <GenerationTable />

      <h2>预取缓冲区：带宽扩展引擎</h2>
      <p>
        DDR 带宽扩展背后的核心机制是<strong>预取缓冲区</strong>。每一代 DDR 不再
        每个时钟周期只从阵列读取一位，而是同时读取多位（Nn 预取），然后将其序列化
        到外部总线上。
      </p>

      <PrefetchDiagram />

      <p>
        内部阵列时钟以参考频率运行（例如 200 MHz）。DDR 在时钟双沿传输数据，因此
        200 MHz 时钟在 1n 预取总线上产生 400 MT/s。采用 8n 预取（DDR3/4）后，同样的
        200 MHz 阵列时钟每周期向以 1600 MT/s 运行的 I/O 总线提供 8 位数据——外部
        频率是阵列频率的 4 倍。阵列保持低温；I/O 总线高速运行。
      </p>

      <h2>各代次关键创新</h2>

      <h3>FPM → EDO（1987–1994）：CAS 流水线</h3>
      <p>
        快速页模式允许在不重新发送 RAS 的情况下循环 CAS，从而对同一行进行背靠背读取。
        EDO（扩展数据输出）增加了一个输出锁存器，在下一个 CAS 发出期间仍将前一数据
        保持在 DQ 上。这形成了一级流水线：发送下一列地址→前一数据仍有效→捕获→新数据
        到来。效果：在不改变阵列的情况下吞吐量提升约 40%。
      </p>

      <h3>EDO → SDRAM（1994–1996）：引入时钟</h3>
      <p>
        异步 DRAM 要求控制器了解板上每块芯片的精确时序余量。同步 DRAM 增加了
        <strong>CLK 引脚</strong>——所有命令和数据均在时钟沿采样。DRAM 现在可以从
        单条 READ 命令中对最多 8 次列访问进行突发排队，数据在连续时钟沿上可靠出现。
        这也使 DIMM 能够在多种 PCB 布局中与内存控制器协同工作。
      </p>

      <h3>SDRAM → DDR（1996–2000）：时钟双沿传输</h3>
      <p>
        关键洞察：SDRAM 浪费了时钟下降沿。DDR 在<em>上升沿和下降沿</em>均驱动数据，
        在相同时钟频率下吞吐量翻倍。2n 预取缓冲区每内部周期从阵列读取两位；差分
        DQS 选通信号（每字节通道一个）精确告知控制器何时采样每一位。内部时钟不变；
        外部总线以阵列时钟 2 倍的速率运行。
      </p>

      <h3>DDR → DDR2/3：更快 I/O，更宽预取</h3>
      <p>
        DDR2 将预取扩展至 4n，I/O 频率推至 SDRAM 参考频率的 2 倍。同时新增片上终端（ODT）
        以改善信号完整性——此前由内存控制器在外部管理终端。DDR3 扩展至 8n 预取，
        并在 DIMM 上采用飞越拓扑（菊花链代替 T 型拓扑），以减少高频下的信号反射。
      </p>

      <h3>DDR3 → DDR4（2007–2014）：Bank Group</h3>
      <p>
        DDR4 的关键架构新增是 <strong>Bank Group</strong>：16 个 Bank 被组织为
        4 组，每组 4 个。每个 Bank Group 有独立的内部数据路径，允许对不同组的
        背靠背列访问只需 tCCD_S = 4 周期（同组内为 tCCD_L = 5 周期）。DDR4 还
        引入 POD-1.2 信号标准（取代 SSTL），I/O 功耗降低约 25%。
      </p>

      <DDR4BankGroupDiagram />

      <h3>DDR4 → DDR5（2014–2021）：子通道与片上 ECC</h3>
      <p>
        DDR5 自 SDRAM 以来进行了最多的结构性变更：
      </p>
      <ul>
        <li><strong>每 DIMM 两个独立的 32 位子通道</strong>：原 DDR4 的一个 64 位
            通道拆分为两个 32 位 DDR5 通道，各自独立寻址。这将最小传输粒度减半
            （32 字节 vs 64 字节），并提升 Bank 并行度。</li>
        <li><strong>片上 ECC</strong>：每块 DRAM 芯片在向控制器传送数据之前在
            内部添加 ECC 保护。这可以捕获 DIMM 级 ECC 无法感知的芯片内软错误。
            它不能替代 DIMM 级 ECC。</li>
        <li><strong>模组集成 PMIC</strong>：电源管理芯片从主板移至 DIMM，支持
            更精细的逐 rank 电压调节，以比系统级稳压器更高的精度提供 DDR5 所需
            的 1.1 V Vdd。</li>
        <li><strong>16n 预取</strong>：内部阵列时钟现在是数据速率的 1/16。在
            6400 MT/s 下，阵列仅以 400 MHz 运行——发热可控。</li>
        <li><strong>按 Bank 刷新</strong>：各 Bank 可独立刷新，减少 DDR4 中在
            tRFC 期间出现的全 Bank 停摆时间。</li>
      </ul>

      <h2>电压缩减：每代功耗降低</h2>
      <p>
        动态功耗与 C × V² × f 成正比。每一代 DDR 都降低了 Vdd：
        5V → 3.3V → 2.5V → 1.8V → 1.5V → 1.2V → 1.1V。尽管带宽（频率 × 总线
        宽度）不断提升，电压的下降部分抵消了功耗增长。LPDDR5 在自刷新期间进一步
        降至 0.5 V，使移动设备在深度休眠时功耗接近于零。
      </p>

      <h2>没有改变的：延迟之墙</h2>
      <p>
        尽管带宽提升了 1000 倍，绝对读取延迟（tRP + tRCD + CL）仅从约 75 ns
        （SDRAM，1996 年）降至约 42 ns（DDR5-6400，2024 年）——28 年内不到 2 倍的
        改善。存储单元物理特性（电荷共享、灵敏放大器判决）的变化远不足以等比例
        压缩这些时间间隔。这正是为什么<strong>内存墙</strong>从根本上是一堵
        <em>延迟</em>之墙，而非带宽之墙。
      </p>

      <LessonNav lessonId={8} onComplete={() => markComplete(8)} lessons={lessonsZh} />
    </div>
  )
}
