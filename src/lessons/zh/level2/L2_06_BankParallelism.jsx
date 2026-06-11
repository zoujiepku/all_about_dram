import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import FAWViz from '../../../visualizations/level2/FAWViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_06() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 06 模块 · 模块组 B：系统架构</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">Bank 并行性与 tFAW</h1>
        <p className="text-dram-muted mt-2">四激活窗口约束、DDR4/5 中的 Bank 组，以及内存级并行性</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在第 7 模块（时序参数）中，你已了解
        tRRD（Bank 激活之间的行到行延迟）。tFAW 是叠加在 tRRD 之上的全局约束——
        无论每个 Bank 的独立时序如何，它限制了在短时间窗口内可以打开的 Bank 数量。
      </div>

      <FAWViz />

      <h2>Bank 与并行性的重要性</h2>
      <p>
        现代 DDR4 DRAM 拥有 <strong>16 个 Bank</strong>（4 个 Bank 组 × 每组 4 个 Bank）。
        每个 Bank 可以独立执行 RAS-CAS-预充电周期。由于大多数操作会将一个 Bank 锁定 tRAS
        时间（约 35 ns）后才能预充电，因此在流水线中保持多个 Bank 同时打开对于隐藏延迟至关重要：
      </p>
      <ul>
        <li>激活 Bank 0 → 在行 0 打开期间，激活 Bank 1</li>
        <li>从 Bank 0 读取列数据 → 在数据传输期间，读取 Bank 1</li>
        <li>对 Bank 0 进行预充电 → 在 Bank 0 预充电期间，Bank 1 继续响应请求</li>
      </ul>
      <p>
        这种<strong>内存级并行性（MLP，Memory-Level Parallelism）</strong>是随机访问工作负载
        中主要的吞吐量提升机制，因为每个请求都会命中不同的 Bank。
      </p>

      <h2>tFAW：四激活窗口</h2>
      <p>
        行激活会从电源网络中汲取大量浪涌电流（字线和感应放大器同时充电）。
        如果在短时间内有过多 Bank 同时激活，叠加的浪涌电流会在 Vdd 上产生
        <strong> IR 压降</strong>，可能导致感应放大器工作异常，进而引发数据错误。
      </p>
      <p>
        JEDEC 通过 tFAW（四激活窗口）来解决这一问题：<em>在任意长度为 tFAW 的滚动时间窗口内，
        最多只能发出 4 条 ACT 命令</em>。以 DDR4-2400 为例：
      </p>
      <p>
        <code>tFAW = 26 ns（在 1200 MHz 下 → 约 31 个时钟周期）</code>
      </p>
      <p>
        如果第五次激活会违反该窗口约束，控制器必须等待，直到窗口内最早的那次激活滑出窗口范围为止。
      </p>

      <h2>DDR4/5 中的 Bank 组</h2>
      <p>
        DDR4 引入了 <strong>Bank 组</strong>的概念：16 个 Bank 被分为 4 组，每组 4 个。
        当两次访问位于<em>不同</em> Bank 组时，tCCD（CAS 到 CAS 延迟）更短：
      </p>
      <ul>
        <li><strong>tCCD_L</strong>（同一 Bank 组）：5–8 ck——组内共享的内部 IO 路径在下一次列访问前需要更长的稳定时间</li>
        <li><strong>tCCD_S</strong>（不同 Bank 组）：4 ck——每个 Bank 组拥有独立的 IO 路径，跨组的背靠背访问可以更紧密地调度</li>
      </ul>
      <p>
        记忆口诀：<em>L = Long（长）= 同组；S = Short（短）= 不同组</em>。
        一个聪明的调度器会将访问交织分布在全部四个 Bank 组之间，充分利用 tCCD_S 以最大化吞吐量。
      </p>

      <h2>GPU 与 CPU 的访问模式对比</h2>
      <p>
        CPU 每个核心通常同时发出 1–4 个内存请求（受乱序执行窗口大小限制）。
        GPU 则可以从数千个着色器线程同时发出数千个内存请求——天然具备极高的 MLP。
        这正是 GPU（搭配 GDDR 或 HBM）在内存密集型工作负载上如此高效的原因：
        它们始终能让所有 Bank 保持忙碌，从而隐藏 tRAS 和 tRP 延迟。
      </p>
      <p>
        CPU 内存控制器则依靠激进的预取和乱序调度来实现相近的 MLP，
        但可并发的请求数量远低于 GPU。
      </p>

      <div className="rounded-lg p-4 bg-dram-bg text-xs font-mono space-y-1 mt-4">
        <div className="text-dram-blue">// tFAW 计算示例（DDR4-3200，tck = 0.625 ns）</div>
        <div>tFAW     = 26 ns / 0.625 ns = ~41.6 → rounded to 42 ck</div>
        <div>tRRD_L   = 6 ck  // row-to-row within same bank group</div>
        <div>tRRD_S   = 4 ck  // row-to-row across bank groups</div>
        <div>Rule: max 4 ACT in any tFAW window, plus tRRD_L/S between consecutive ACTs</div>
      </div>

      <LessonNav lessonId={6} onComplete={() => markComplete(6)} lessons={lessonsL2Zh} />
    </div>
  )
}
