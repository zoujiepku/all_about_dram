import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import MemoryHierarchyViz from '../../visualizations/MemoryHierarchyViz'
import { lessonsZh } from '../../data/lessons.zh'

function HierarchyTable() {
  const levels = [
    { level: 'Registers（寄存器）', size: '1–4 KB', latency: '< 1 ns', tech: '触发器（SRAM）', bw: '> 1 TB/s', cost: '~$1000/GB', note: 'CPU 指令直接寻址 — AX、RBX 等' },
    { level: 'L1 Cache', size: '32–64 KB/核', latency: '~1–4 ns（4–16 周期）', tech: 'SRAM（6T 单元）', bw: '~200 GB/s', cost: '~$200/MB', note: '指令+数据分离；每核私有；4 路至 8 路组相联' },
    { level: 'L2 Cache', size: '256 KB–2 MB/核', latency: '~4–12 ns（10–40 周期）', tech: 'SRAM（6T 单元）', bw: '~100 GB/s', cost: '~$100/MB', note: '统一缓存；Intel 平台每核私有；4 路至 16 路组相联' },
    { level: 'L3 Cache（LLC）', size: '8–64 MB（共享）', latency: '~20–50 ns（40–150 周期）', tech: 'SRAM（6T 单元，部分用 MRAM）', bw: '~50 GB/s', cost: '~$20/MB', note: '所有核共享；通常分 Bank，每核对应独立分片' },
    { level: 'Main Memory（DRAM）', size: '4–256 GB', latency: '~60–100 ns（200–300 周期）', tech: 'DRAM（1T1C 单元）', bw: '25–96 GB/s', cost: '~$0.003/MB', note: '字节寻址；每 7.8 µs 刷新一次；本课程重点' },
    { level: 'NVMe SSD', size: '256 GB–8 TB', latency: '~100 µs', tech: '3D NAND Flash', bw: '5–14 GB/s', cost: '~$0.0001/MB', note: '持久化存储；块寻址（最小 4 KB）；需要操作系统页缓存' },
    { level: 'HDD（机械硬盘）', size: '1–20 TB', latency: '~5–10 ms', tech: '磁性盘片', bw: '~200 MB/s', cost: '~$0.00002/MB', note: '旋转延迟为主要瓶颈；顺序带宽远高于随机访问' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">层级</th>
            <th className="text-left p-3 text-dram-muted font-semibold">容量</th>
            <th className="text-left p-3 text-dram-muted font-semibold">延迟</th>
            <th className="text-left p-3 text-dram-muted font-semibold">技术</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">备注</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => {
            const isDRAM = l.level.includes('DRAM')
            return (
              <tr key={i} className={`border-t border-dram-border ${isDRAM ? 'bg-dram-blue/5' : i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                <td className={`p-3 font-bold ${isDRAM ? 'text-dram-blue' : 'text-dram-text'}`}>{l.level}</td>
                <td className="p-3 font-mono text-dram-amber">{l.size}</td>
                <td className="p-3 font-mono text-dram-green">{l.latency}</td>
                <td className="p-3 text-dram-muted">{l.tech}</td>
                <td className="p-3 text-dram-muted hidden md:table-cell">{l.note}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LocalityDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        缓存为何有效 — 访存局部性原理
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: '时间局部性',
            color: '#3b82f6',
            icon: '⏱',
            desc: '如果访问了地址 X，短时间内很可能再次访问 X。',
            example: '循环变量每次迭代都被读取，将其保留在 L1 中可避免数千次 DRAM 访问。',
          },
          {
            name: '空间局部性',
            color: '#22c55e',
            icon: '📍',
            desc: '如果访问了地址 X，短时间内很可能访问 X±64 字节附近的地址。',
            example: '遍历数组时会访问连续地址。DRAM 每次传输 64 字节的缓存行——相邻元素会被一并加载，无需额外开销。',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-4" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-2" style={{ color: item.color }}>{item.icon} {item.name}</div>
            <p className="text-xs text-dram-text mb-2">{item.desc}</p>
            <div className="text-xs text-dram-muted bg-dram-bg rounded p-2">
              <span className="text-dram-text font-medium">示例：</span>{item.example}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        如果程序同时违背这两条原则——对大数据集进行随机访问——每次访问都会遭遇完整的 DRAM 延迟。
        这正是缓存无关算法和数据结构内存布局对高性能计算如此重要的原因。
      </p>
    </div>
  )
}

function MemoryWallDiagram() {
  const years = [1993, 1997, 2001, 2005, 2009, 2013, 2017, 2021, 2024]
  const cpuPerf = [1, 3.5, 12, 35, 80, 200, 500, 1000, 2000]
  const dramBW = [1, 3, 7, 18, 36, 50, 80, 127, 170]
  const dramLatNs = [100, 95, 85, 80, 75, 72, 68, 65, 62]

  const w = 420, h = 140
  const xPad = 40, yPad = 15
  const xScale = (y) => xPad + ((y - 1993) / (2024 - 1993)) * (w - xPad - 20)
  const yLogScale = (v, min, max) => h - yPad - ((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))) * (h - 2 * yPad)

  const cpuPts = years.map((y, i) => `${xScale(y)},${yLogScale(cpuPerf[i], 1, 2500)}`).join(' ')
  const bwPts = years.map((y, i) => `${xScale(y)},${yLogScale(dramBW[i], 1, 2500)}`).join(' ')

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        内存墙 — CPU 性能 vs DRAM 带宽（对数坐标，1993 年 = 1×）
      </h3>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} preserveAspectRatio="xMidYMid meet">
        {/* CPU 性能曲线 */}
        <polyline points={cpuPts} fill="none" stroke="#3b82f6" strokeWidth="2"/>
        {/* DRAM 带宽曲线 */}
        <polyline points={bwPts} fill="none" stroke="#22c55e" strokeWidth="2"/>

        {/* 年份标签 */}
        {years.filter((_, i) => i % 2 === 0).map((y) => (
          <text key={y} x={xScale(y)} y={h + 20} textAnchor="middle" fill="#64748b" fontSize={9}>{y}</text>
        ))}

        {/* 图例 */}
        <line x1={xPad} y1={12} x2={xPad + 20} y2={12} stroke="#3b82f6" strokeWidth="2"/>
        <text x={xPad + 24} y={16} fill="#3b82f6" fontSize={9}>CPU 吞吐量（30 年约提升 2000×）</text>
        <line x1={200} y1={12} x2={220} y2={12} stroke="#22c55e" strokeWidth="2"/>
        <text x={224} y={16} fill="#22c55e" fontSize={9}>DRAM 带宽（30 年约提升 170×）</text>

        {/* 差距标注 */}
        <text x={xScale(2024) - 5} y={yLogScale(2000, 1, 2500) + 4} textAnchor="end" fill="#3b82f6" fontSize={8}>2000×</text>
        <text x={xScale(2024) - 5} y={yLogScale(170, 1, 2500) + 4} textAnchor="end" fill="#22c55e" fontSize={8}>170×</text>
        <line x1={xScale(2024) - 2} y1={yLogScale(170, 1, 2500)} x2={xScale(2024) - 2} y2={yLogScale(2000, 1, 2500)} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2"/>
        <text x={xScale(2024) + 2} y={(yLogScale(170, 1, 2500) + yLogScale(2000, 1, 2500)) / 2 + 3} fill="#ef4444" fontSize={8}>差距！</text>
      </svg>
    </div>
  )
}

export default function L01() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 01</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">存储层次结构</h1>
        <p className="text-dram-muted mt-2">DRAM 存在的意义、它在存储体系中的位置，以及层次结构为何被设计成现在这个形状</p>
      </div>

      <MemoryHierarchyViz />

      <h2>速度与容量的权衡</h2>
      <p>
        每台计算机都需要内存来存放程序和数据。核心矛盾是一个物理上的硬约束：
        快速内存昂贵且容量小；廉价内存容量大但速度慢。工程师用<strong>存储层次结构</strong>来解决这个问题——
        一个分层的栈，每一层都比上一层更大、更便宜、更慢。
      </p>
      <p>
        CPU 以 GHz 频率执行指令，每个时钟周期约 0.3 ns。如果每次访存都要等待主内存（约 80 ns），
        CPU 每条指令将空转 250 多个周期。缓存将近期使用的数据保存在近处，在大多数情况下隐藏了这段延迟。
      </p>

      <h2>完整层次结构 — 必须掌握的数据</h2>
      <HierarchyTable />

      <h2>层次结构为何有效：访存局部性</h2>
      <p>
        如果程序随机访问内存，缓存将毫无用处。缓存之所以有效，是因为真实程序呈现出两种可预测的规律：
      </p>
      <LocalityDiagram />

      <p>
        L1 缓存的典型命中率为 95–99%——意味着 CPU 在 95–99% 的访问中能在 1–4 ns 内找到所需数据。
        昂贵的 DRAM 访问（80 ns）仅发生在 1–5% 的情况下，这是可以接受的。
        如果命中率只有 50%，计算机将会慢 10–20 倍。
      </p>

      <h2>内存墙</h2>
      <p>
        从 1993 年到 2024 年，CPU 性能提升了约 2000 倍（时钟频率 × IPC × 核心数）。
        DRAM <strong>带宽</strong>提升了约 170 倍（FPM 的 ~0.3 GB/s 到 DDR5-6400 的 ~51 GB/s 每通道）。
        而 DRAM <strong>延迟</strong>几乎没有改善——从 1993 年的 ~100 ns 到今天的 ~62 ns，
        不到 2 倍的提升。这种差距就是<strong>内存墙</strong>。
      </p>

      <MemoryWallDiagram />

      <p>
        内存墙本质上是<em>延迟</em>墙，而非带宽墙。带宽尚能跟上（多通道、更宽的总线、DDR 技术）。
        但缓存缺失后等待第一个字节到达所需的时间，与 30 年前几乎一样长。
      </p>
      <p>
        现代 CPU 以极高的复杂度应对延迟墙：
      </p>
      <ul>
        <li><strong>多级缓存</strong>（L1+L2+L3）：在大多数访问到达 DRAM 之前将其拦截</li>
        <li><strong>乱序执行</strong>：在等待内存响应的同时继续执行其他指令</li>
        <li><strong>硬件预取器</strong>：预测未来的访问，在 CPU 请求之前提前从 DRAM 取数据</li>
        <li><strong>非阻塞缓存</strong>：允许多个缓存缺失同时在途（内存级并行，MLP）</li>
        <li><strong>MSHR（缺失状态保持寄存器）</strong>：追踪待处理的缓存缺失，合并重复请求并并行处理</li>
      </ul>

      <h2>为何主内存使用 DRAM？</h2>
      <p>
        SRAM（6 晶体管单元）速度快且无需刷新——从需求角度看是主内存的理想选择。
        但它每比特使用的晶体管数量是 DRAM 1T1C 的 6 倍。以 2024 年的工艺密度为例：
      </p>
      <ul>
        <li>SRAM：台积电 5nm 上约 512 MB/mm²，约 $0.04/MB</li>
        <li>DRAM：约 16 GB/mm²，约 $0.003/MB</li>
      </ul>
      <p>
        DRAM 面积效率约高 13 倍，使 64 GB DRAM 在成本上切实可行，而同等容量的 SRAM
        则会价格高昂（且需要 13 倍的芯片面积）。破坏性读取、周期性刷新、更高的延迟，
        是以密度换来的代价。
      </p>

      <h2>缓存层次设计的关键决策</h2>
      <p>
        缓存设计师需要调整多个参数，在命中率、面积和延迟之间取得平衡：
      </p>
      <ul>
        <li><strong>缓存行大小</strong>：64 字节是行业标准。更大的缓存行能更好地利用空间局部性，但访问稀疏时会浪费带宽。更小的缓存行减少带宽浪费，但需要更多标签开销。</li>
        <li><strong>组相联度</strong>：直接映射（1 路）最快但存在冲突缺失。8 路组相联（L1 典型配置）以适中代价减少冲突。全相联（TLB）无冲突但对普通缓存来说太慢。</li>
        <li><strong>包含策略</strong>：包含型 LLC（L3 包含 L1/L2 的所有内容）简化了一致性协议但浪费空间。独占型（AMD 的方案）让每个字节的缓存空间只被使用一次。</li>
        <li><strong>替换策略</strong>：LRU（最近最少使用）最常见；QLRU（象限 LRU）以低开销近似实现；ARC（自适应替换缓存）对扫描型负载表现更好。</li>
      </ul>

      <LessonNav lessonId={1} lessons={lessonsZh} onComplete={() => markComplete(1)} />
    </div>
  )
}
