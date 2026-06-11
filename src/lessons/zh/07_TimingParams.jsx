import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import TimingDiagramViz from '../../visualizations/TimingDiagramViz'
import { lessonsZh } from '../../data/lessons.zh'

function TimingTable() {
  const params = [
    { param: 'tRP', name: '行预充电时间', typical: '14 ns', desc: '关闭一行后位线均衡至 Vdd/2 所需时间。受预充电电路 RC 时间常数限制。' },
    { param: 'tRCD', name: 'RAS 到 CAS 延迟', typical: '14 ns', desc: '从字线升高到灵敏放大器稳定所需时间。受电荷共享稳定时间加灵敏放大器判决时间限制。' },
    { param: 'CL', name: 'CAS 延迟', typical: '14 ns（DDR4-3200 CL22）', desc: '从 READ 命令到 DQ 上首个有效数据的时间。包含列译码路径 + IO 驱动器延迟。' },
    { param: 'tRAS', name: '行有效选通时间', typical: '32–48 ns', desc: '预充电前行必须保持打开的最短时间。确保所有存储单元完成写回。' },
    { param: 'tRC', name: '行周期时间', typical: '46–62 ns', desc: 'tRAS + tRP——同一 Bank 两次 ACT 命令之间的最短时间。' },
    { param: 'tWR', name: '写恢复时间', typical: '15 ns', desc: '最后一次写突发后到可以发送 PRE 之间的最短时间。保证电容充电完整。' },
    { param: 'tRRD_S', name: '行到行延迟（短）', typical: '3–5 ns', desc: '向不同 Bank Group 发送 ACT 命令之间的最短时间。受功耗/IR 压降限制。' },
    { param: 'tRRD_L', name: '行到行延迟（长）', typical: '5–6 ns', desc: '向同一 Bank Group 内发送 ACT 命令之间的最短时间。' },
    { param: 'tFAW', name: '四激活窗口', typical: '20–35 ns', desc: '在任意 tFAW 时间窗口内，所有 Bank 合计最多只能发起 4 次 ACT 命令，以限制峰值电流。' },
    { param: 'tCCD_S', name: 'CAS 到 CAS（短）', typical: '最短 4 个周期', desc: '向不同 Bank Group 发送连续 READ 命令之间的最短时间。JEDEC DDR4 下限为 4 nCK。' },
    { param: 'tCCD_L', name: 'CAS 到 CAS（长）', typical: '5–8 个周期', desc: '向同一 Bank Group 发送连续 READ 命令之间的最短时间。' },
    { param: 'tWTR_S', name: '写到读（短）', typical: '2–4 个周期', desc: '最后一次写到向不同 Bank Group 发送 READ 之间的时间。总线方向切换所需。' },
    { param: 'tWTR_L', name: '写到读（长）', typical: '6–10 个周期', desc: '最后一次写到向同一 Bank Group 发送 READ 之间的时间。DQ/DQS 方向切换需要更长时间。' },
    { param: 'tRFC', name: '刷新周期时间', typical: '260–550 ns', desc: '自动刷新期间 Bank 被占用的时间。随芯片容量增大而增加：芯片越大需要恢复的行越多。' },
    { param: 'tREFI', name: '刷新间隔', typical: '7.8 µs', desc: '64 ms 保持窗口 ÷ 8192 行。控制器必须每隔 tREFI 发送一次 REF 命令。' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">参数</th>
            <th className="text-left p-3 text-dram-muted font-semibold">名称</th>
            <th className="text-left p-3 text-dram-muted font-semibold">DDR4-3200 典型值</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">物理原因</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono font-bold text-dram-amber whitespace-nowrap">{p.param}</td>
              <td className="p-3 text-dram-text">{p.name}</td>
              <td className="p-3 font-mono text-dram-blue text-xs whitespace-nowrap">{p.typical}</td>
              <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LatencyCalcBlock() {
  const examples = [
    { label: 'DDR4-2400 CL16', mt: 2400, cl: 16, tRCD: 16, tRP: 16 },
    { label: 'DDR4-3200 CL22', mt: 3200, cl: 22, tRCD: 22, tRP: 22 },
    { label: 'DDR5-4800 CL40', mt: 4800, cl: 40, tRCD: 40, tRP: 40 },
    { label: 'DDR5-6400 CL32', mt: 6400, cl: 32, tRCD: 32, tRP: 32 },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        绝对延迟对比——周期数 vs 纳秒
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-dram-muted border-b border-dram-border">
              <th className="text-left p-2">规格</th>
              <th className="p-2">时钟周期</th>
              <th className="p-2">CL（周期）</th>
              <th className="p-2">CL（ns）</th>
              <th className="p-2">tRCD（ns）</th>
              <th className="p-2">tRP（ns）</th>
              <th className="p-2 font-bold text-dram-amber">总计（ns）</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e, i) => {
              const period = 2000 / e.mt
              const clNs = (e.cl * period).toFixed(1)
              const rcdNs = (e.tRCD * period).toFixed(1)
              const rpNs = (e.tRP * period).toFixed(1)
              const total = (e.cl * period + e.tRCD * period + e.tRP * period).toFixed(1)
              return (
                <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/30' : ''}`}>
                  <td className="p-2 text-dram-text font-bold">{e.label}</td>
                  <td className="p-2 text-dram-muted text-center">{period.toFixed(3)} ns</td>
                  <td className="p-2 text-dram-blue text-center">{e.cl}</td>
                  <td className="p-2 text-dram-green text-center">{clNs}</td>
                  <td className="p-2 text-dram-green text-center">{rcdNs}</td>
                  <td className="p-2 text-dram-green text-center">{rpNs}</td>
                  <td className="p-2 text-dram-amber font-bold text-center">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-dram-muted mt-3">
        DDR5-6400 CL32 的 CL 数值<em>低于</em> DDR5-4800 CL40，但两者的绝对延迟
        （仅 CL 部分约 10 ns）大致相同。比较时应始终换算为纳秒，而非周期数。
      </p>
    </div>
  )
}

function tFAWDiagram() {
  const barW = 40
  const gap = 10
  const total = 5 * barW + 4 * gap
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']
  const labels = ['ACT0', 'ACT1', 'ACT2', 'ACT3', 'ACT4 ✗']
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">tFAW——四激活窗口</h3>
      <svg width="100%" viewBox={`0 0 ${total + 60} 100`} preserveAspectRatio="xMidYMid meet">
        {/* tFAW 括号 */}
        <line x1={30} y1={20} x2={30 + 4*barW + 3*gap} y2={20} stroke="#f59e0b" strokeWidth={1.5}/>
        <line x1={30} y1={15} x2={30} y2={25} stroke="#f59e0b" strokeWidth={1.5}/>
        <line x1={30 + 4*barW + 3*gap} y1={15} x2={30 + 4*barW + 3*gap} y2={25} stroke="#f59e0b" strokeWidth={1.5}/>
        <text x={30 + (4*barW + 3*gap)/2} y={14} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">tFAW 窗口（最多 4 次 ACT）</text>

        {labels.map((label, i) => {
          const x = 30 + i * (barW + gap)
          const isBlocked = i === 4
          return (
            <g key={i}>
              <rect x={x} y={30} width={barW} height={35} rx={4}
                fill={isBlocked ? '#ef444422' : colors[i] + '33'}
                stroke={isBlocked ? '#ef4444' : colors[i]}
                strokeWidth={1.5}
                strokeDasharray={isBlocked ? '4 2' : undefined}
              />
              <text x={x + barW/2} y={51} textAnchor="middle" fill={isBlocked ? '#ef4444' : colors[i]} fontSize={8} fontWeight="bold">{label}</text>
              <text x={x + barW/2} y={80} textAnchor="middle" fill="#64748b" fontSize={7}>tRRD</text>
              {i < 4 && <line x1={x + barW} y1={47} x2={x + barW + gap} y2={47} stroke="#475569" strokeWidth={1} strokeDasharray="2 2"/>}
            </g>
          )
        })}
      </svg>
      <p className="text-xs text-dram-muted mt-2">
        ACT0–ACT3 各自遵守 tRRD（激活之间的最短间隔）。但 ACT4 将在 tFAW = 35 ns 窗口内
        放入第 5 次激活，违反功率预算。控制器必须等待 ACT0 滑出窗口后才能发送 ACT4。
      </p>
    </div>
  )
}

export default function L07() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 07</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">时序参数</h1>
        <p className="text-dram-muted mt-2">tRCD、CL、tRAS、tRP、tFAW——读懂 DRAM 数据手册，理解背后的物理原理</p>
      </div>

      <TimingDiagramViz lang="zh" />

      <h2>DRAM 为何需要时序约束</h2>
      <p>
        与 SRAM 在单一传播延迟后即可提供数据不同，DRAM 需要精确的多步骤命令序列，
        且每步之间必须强制等待最短时间。这些等待并非任意规定——每个等待都对应一个
        无法被加速的物理过程：
      </p>
      <ul>
        <li><strong>电容充放电</strong>：存储电容与访问晶体管的 RC 时间常数决定了读写过程中电荷流动的速度（→ tRCD、tWR）</li>
        <li><strong>灵敏放大器判决</strong>：交叉耦合锁存器需要 1–2 ns 将 ΔV ≈ 55 mV 放大至满摆幅；过早激活列路径会看到不确定电压（→ tRCD）</li>
        <li><strong>位线均衡</strong>：行关闭后位线通过 RC 稳定至 Vdd/2（→ tRP）</li>
        <li><strong>峰值电流限制</strong>：同时激活过多行会通过封装电感引发电流尖峰，产生电压毛刺——由 tRRD 和 tFAW 约束</li>
      </ul>
      <p>
        违反任何时序约束不会导致性能下降——而是导致<strong>数据损坏或错误感测</strong>。
        内存控制器必须同时遵守所有约束。
      </p>

      <h2>完整时序参数参考</h2>
      <TimingTable />

      <h2>三种延迟场景</h2>
      <p>
        命令序列和相应延迟因行缓冲状态而异（参见 Module 05）：
      </p>
      <ul>
        <li><strong>Bank 关闭（行为空）</strong>：ACT → 等待 tRCD → RD → 等待 CL → 数据。总计 ≈ tRCD + CL</li>
        <li><strong>行命中（同一行已打开）</strong>：RD → 等待 CL → 数据。总计 ≈ 仅 CL。最快情况。</li>
        <li><strong>行缺失（不同行已打开）</strong>：PRE → 等待 tRP → ACT → 等待 tRCD → RD → 等待 CL → 数据。总计 ≈ tRP + tRCD + CL。最慢情况。</li>
      </ul>

      <h2>绝对延迟 vs 周期数延迟</h2>
      <p>
        数据手册上的时序参数以<em>时钟周期</em>为单位发布。随着数据速率提升，
        周期时间缩短——因此更快速率下较高的 CL 数值可能比较慢速率下较低的 CL
        具有更小的绝对延迟。应始终换算为纳秒：
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>周期时间 = 2000 ns ÷ (MT/s 速率)</div>
        <div className="text-dram-muted mt-1">DDR4-3200：2000 ÷ 3200 = 0.625 ns/周期</div>
        <div className="text-dram-muted">DDR5-6400：2000 ÷ 6400 = 0.3125 ns/周期</div>
      </div>
      <LatencyCalcBlock />

      <h2>tFAW：四激活窗口</h2>
      <p>
        每次行激活都通过字线驱动器和阵列电源产生一个显著的电流脉冲。若过多 Bank
        在极短时间内连续激活，叠加的 di/dt 会在 Vdd 上引起电压跌落，可能损坏
        正在进行电荷共享的存储单元。tFAW 是一个滚动时间窗口，在此窗口内所有
        Bank 合计最多只能发出 4 条 ACT 命令。
      </p>

      <tFAWDiagram />

      <p>
        tFAW 与 tRRD 协同工作。即使 tFAW 窗口内还有余量，每次单独的 ACT 与
        前一次 ACT 之间仍必须间隔 tRRD（通常 5 ns）。tRRD 保护字线驱动器；
        tFAW 保护电源供应。
      </p>

      <h2>tCCD：背靠背列命令</h2>
      <p>
        DDR4 引入了 Bank Group——共享内部数据路径的 Bank 集群。
        对两个不同 Bank Group 的读操作可以更紧密地流水线化（JEDEC DDR4 规定
        tCCD_S 最短 4 个周期），而对同一 Bank Group 的读操作则需要更长时间
        （tCCD_L = 5–8 个周期）。差异源于同一 Bank Group 内共享的灵敏放大器
        输出路径在连续列访问之间需要稳定时间。
      </p>
      <p>
        优秀的内存控制器会将请求交错分散到各 Bank Group，充分利用 tCCD_S，
        使 DQ 总线接近满负荷利用率。
      </p>

      <h2>tWTR：写到读切换时间</h2>
      <p>
        写突发结束后，DQ 引脚必须切换方向——从控制器向外驱动，变为 DRAM 向内
        驱动。tWTR（写到读切换时间）为总线换向和 DQS 选通信号重新对齐提供缓冲。
        tWTR_L（同 Bank Group）比 tWTR_S（不同 Bank Group）更长，原因与 tCCD
        的总线竞争一致。
      </p>

      <h2>读懂时序规格：CL-tRCD-tRP-tRAS</h2>
      <p>
        DRAM 内存条使用 <code>CL-tRCD-tRP-tRAS</code> 的简写标注。示例：
        DDR4-3200 下的 <strong>22-22-22-52</strong> 表示：
      </p>
      <ul>
        <li>CL = 22 周期 = 13.75 ns</li>
        <li>tRCD = 22 周期 = 13.75 ns</li>
        <li>tRP = 22 周期 = 13.75 ns</li>
        <li>tRAS = 52 周期 = 32.5 ns</li>
      </ul>
      <p>
        超频玩家通常会收紧这些时序（数值更小），从而降低绝对延迟。但物理过程
        必须完成——收紧过度会导致错误或不稳定。JEDEC 规定的时序足够保守，大多数
        芯片在提供充足电压和散热的条件下可以运行在更紧的时序下。
      </p>

      <LessonNav lessonId={7} onComplete={() => markComplete(7)} lessons={lessonsZh} />
    </div>
  )
}
