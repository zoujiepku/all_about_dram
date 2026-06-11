import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import SchedulerSim from '../../../visualizations/level2/SchedulerSim'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_04() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 04 · Cluster B: System Architecture</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">内存控制器调度</h1>
        <p className="text-dram-muted mt-2">FR-FCFS 调度、开放/关闭页策略、行缓冲区分类以及请求饥饿问题</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">与 Level 1 的联系：</strong>在第 7 模块（时序参数）中，你了解到行缓冲区命中（仅需 tCL）比行缓冲区缺失（tRP + tRCD + tCL）快 3–4 倍。内存控制器的调度策略决定了命中的频率。
      </div>

      <SchedulerSim lang="zh" />

      <h2>行缓冲区状态分类</h2>
      <p>
        每条进入的内存请求根据当前 Bank 行缓冲区的状态，可归入以下三类之一：
      </p>
      <ul>
        <li><strong>行缓冲区命中（Row-buffer hit）：</strong>请求的行已处于打开状态（由前一个请求激活）。延迟仅约 tCL（例如 DDR4-3200 下为 16 ns）。</li>
        <li><strong>行缓冲区缺失（Row-buffer miss）：</strong>另一行正处于打开状态。旧行必须先预充电（tRP），新行才能被激活（tRCD）。延迟约 tRP + tRCD + tCL ≈ 48 ns。</li>
        <li><strong>行缓冲区空闲（Row-buffer empty）：</strong>Bank 已完成预充电，无行处于打开状态。可省去 tRP，但仍需 tRCD + tCL ≈ 32 ns。</li>
      </ul>

      <h2>FR-FCFS 调度算法</h2>
      <p>
        <strong>First-Ready FCFS（FR-FCFS，先就绪先服务）</strong>是部署最广泛的调度算法。它对请求队列进行重排，使所有行缓冲区命中请求优先于行缓冲区缺失或空闲请求得到服务，而不考虑到达顺序。在同一行缓冲区状态类别内，则按先到先服务顺序处理。
      </p>
      <p>
        优点：FR-FCFS 最大化行缓冲区局部性，大幅提升具有空间局部性的工作负载（如数据库扫描、GPU 纹理访问）的吞吐量。代价：若命中请求持续涌入，行缓冲区缺失请求可能被无限期推迟——即<strong>饥饿</strong>问题。
      </p>
      <p>
        现代控制器引入<strong>老化阈值</strong>机制：等待超过 τ 个时钟周期的缺失请求将被提升为高优先级，无论其行缓冲区状态如何，从而避免无限延迟。
      </p>

      <h2>开放页策略与关闭页策略</h2>
      <p>
        页策略决定列访问完成后的处理方式：
      </p>
      <ul>
        <li>
          <strong>开放页策略（Open page）：</strong>访问结束后行保持打开。若下一个请求访问同一行（命中），延迟极低。若为缺失，则需额外的预充电步骤。适合具有高空间局部性的工作负载（对同一行的连续读写）。
        </li>
        <li>
          <strong>关闭页策略（Closed page）：</strong>每次访问后立即对行进行预充电。每个请求均需支付 tRP + tRCD + tCL 的完整延迟，但对乱序访问模式没有额外的缺失惩罚。适合随机访问工作负载（键值存储、指针追踪图遍历）。
        </li>
      </ul>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4 mb-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>策略</div><div>最适合</div><div>最不适合</div>
        </div>
        {[
          ['FR-FCFS + open page', '高空间局部性（数据库、GPU）', '随机访问、多来源混合负载'],
          ['FCFS + closed page', '公平访问、实时性保障', '流式顺序访问（浪费行缓冲区命中机会）'],
          ['Round-robin', '多租户公平性', '单线程吞吐量'],
        ].map(([pol, best, worst]) => (
          <div key={pol} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{pol}</div>
            <div className="text-dram-green">{best}</div>
            <div className="text-amber-400">{worst}</div>
          </div>
        ))}
      </div>

      <h2>延迟分布</h2>
      <p>
        在真实系统中，CPU 观测到的内存访问延迟并非固定值，而是一个分布。在使用开放页 FR-FCFS 策略且工作集热度较高的情况下，80–90% 的请求为行缓冲区命中（tCL ≈ 16 ns）。在指针追踪等随机访问工作负载下，90% 以上为缺失（≈48 ns）。尾部延迟（P99）对延迟敏感型应用（如内存数据库和实时分析）至关重要——这也是硬件预取器和 QoS 感知调度器存在的动机。
      </p>

      <LessonNav lessonId={4} onComplete={() => markComplete(4)} lessons={lessonsL2Zh} />
    </div>
  )
}
