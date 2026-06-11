import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import DRAMArraySim from '../../visualizations/DRAMArraySim'
import { lessonsZh } from '../../data/lessons.zh'

function ReadStepDiagram() {
  const steps = [
    { step: '预充电', signal: 'PRE', color: '#3b82f6', desc: '所有位线被驱动至 Vdd/2。均衡晶体管将 BL 与 BLB 短接。Bank 处于空闲状态，行缓冲区为空。' },
    { step: '行激活', signal: 'ACT', color: '#f59e0b', desc: '锁存行地址。字线升至 Vpp。存储电容通过电荷共享向位线充电。经过 tRCD 后灵敏放大器触发。' },
    { step: '列选择', signal: 'RD', color: '#a855f7', desc: '发送列地址。列译码器将选定位线接通至 DQ 输出总线。DQS 选通信号开始。' },
    { step: '突发传输', signal: 'DQ', color: '#22c55e', desc: '以 DDR 速率传输 8 个（BL8）连续列的突发数据。DQS 按字节通道切换。64 字节填满一条缓存行。' },
    { step: '数据恢复', signal: '—', color: '#06b6d4', desc: '字线保持高电平。灵敏放大器将 BL 驱动至满摆幅，对已打开行中的所有存储单元重新充电（写回）。' },
    { step: '预充电', signal: 'PRE', color: '#3b82f6', desc: '经过 tRAS 后行关闭。位线均衡至 Vdd/2。Bank 准备好接受下一次激活。' },
  ]

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        完整读操作时序
      </h3>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: s.color + '22', color: s.color, border: `1px solid ${s.color}55` }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.step}</span>
                <span className="font-mono text-xs text-dram-muted">[{s.signal}]</span>
              </div>
              <p className="text-xs text-dram-muted mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LatencyPipelineDiagram() {
  const phases = [
    { label: 'tRP', ns: 14, color: '#3b82f6', desc: '预充电' },
    { label: 'tRCD', ns: 14, color: '#f59e0b', desc: '行激活 → 灵敏放大器触发' },
    { label: 'CL', ns: 14, color: '#a855f7', desc: 'CAS → 数据就绪' },
    { label: 'Burst', ns: 5, color: '#22c55e', desc: 'BL8 突发数据' },
  ]
  const total = phases.reduce((s, p) => s + p.ns, 0)
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        读延迟分解（DDR4-3200 CL22，Bank 关闭状态）
      </h3>
      <div className="flex w-full h-10 rounded-lg overflow-hidden mb-2">
        {phases.map((p) => (
          <div
            key={p.label}
            className="flex items-center justify-center text-xs font-mono font-bold"
            style={{ width: `${(p.ns / total) * 100}%`, backgroundColor: p.color + '33', color: p.color, border: `1px solid ${p.color}44` }}
          >
            {p.label}
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap mt-2">
        {phases.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-dram-muted">{p.label} = {p.ns} ns（{p.desc}）</span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded bg-dram-bg text-xs font-mono text-dram-text">
        首字节总延迟 ≈ tRP + tRCD + CL = 14 + 14 + 14 = <span className="text-dram-amber font-bold">42 ns</span>
        <span className="text-dram-muted ml-2">（加上控制器开销 → 端到端约 60–80 ns）</span>
      </div>
    </div>
  )
}

function RowBufferDiagram() {
  const scenarios = [
    { name: '行缓冲命中', color: '#22c55e', latency: '~10 ns', desc: '请求的行已处于打开状态。完全跳过 ACT，直接发送 CAS。最优情况。', pct: '仅 CL' },
    { name: '行缓冲缺失', color: '#f59e0b', latency: '~45 ns', desc: '同一 Bank 中已有另一行处于打开状态。必须先 PRE（关闭当前行），再 ACT（打开新行），然后才能发送 CAS。', pct: 'PRE + tRP + tRCD + CL' },
    { name: '行缓冲为空', color: '#3b82f6', latency: '~35 ns', desc: '该 Bank 中没有任何行处于打开状态。直接发送 ACT 再发送 CAS，省去预充电等待。', pct: 'tRCD + CL' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        行缓冲策略 — 三种情况
      </h3>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <div key={s.name} className="rounded-lg p-3 flex gap-3" style={{ backgroundColor: s.color + '0d', border: `1px solid ${s.color}33` }}>
            <div className="flex-shrink-0 text-right w-24">
              <div className="font-bold text-sm" style={{ color: s.color }}>{s.latency}</div>
              <div className="text-xs font-mono text-dram-muted">{s.pct}</div>
            </div>
            <div>
              <div className="font-semibold text-sm text-dram-text">{s.name}</div>
              <div className="text-xs text-dram-muted mt-0.5">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        内存控制器的<strong>行缓冲管理策略</strong>——开放页策略（保持行打开，押注局部性）与关闭页策略（每次访问后立即预充电，押注访问多样性）——是关键的调度决策。具有空间局部性的真实负载能从开放页策略中获得巨大收益。
      </p>
    </div>
  )
}

export default function L05() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 05</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">读操作</h1>
        <p className="text-dram-muted mt-2">从 CPU 发出请求到数据出现在总线上——每一步详解</p>
      </div>

      <ReadStepDiagram />

      <h2>DRAM 读操作的触发条件</h2>
      <p>
        当 CPU 核心发出加载指令时，内存系统会依次检查 L1、L2 和 L3
        缓存。若三级缓存均未命中，内存控制器便会发起 DRAM 读操作。控制器将
        物理地址转换为 DRAM 的 rank、Bank 编号、行地址和列地址，然后依次发出
        以下命令序列。
      </p>

      <h2>第一步：预充电——建立参考电压</h2>
      <p>
        每次读操作都以 Bank 的位线均衡至 <strong>Vdd/2 = 0.6 V</strong>
        （以 DDR5 的 1.2 V 为例）开始。每对位线顶端的预充电电路包含三个
        晶体管：两个用于将 BL 和 BLB 连接到 Vdd/2，另一个均衡晶体管瞬时将
        BL 与 BLB 短接，强制两者达到完全相同的电压。
      </p>
      <p>
        预充电需要 <strong>tRP</strong>（行预充电时间）才能完成——在 DDR4/5 上
        通常为 10–15 ns。如果 Bank 中之前有行处于打开状态，控制器必须先发送
        PRE 命令并等待 tRP，之后才能打开任何新行。
      </p>
      <p>
        预充电期间，存储电容完全处于隔离状态（字线为低电平，晶体管关断）。
        存储单元中保存的电荷不受影响。
      </p>

      <h2>第二步：行激活——电荷共享与灵敏放大器</h2>
      <p>
        控制器发送包含行地址的 ACT（激活）命令。行译码器将选定字线驱动至高电平——
        升至 Vpp ≈ 2.5–3 V（高于 Vdd 的提升电压），确保 NMOS 访问晶体管完全
        导通。
      </p>
      <p>
        该行中所有晶体管（一个子阵列中通常有 1,024 个）同时导通。每个存储单元的
        电容将自身电荷与对应位线共享。存储"1"的单元（电容在 Vdd）将位线拉至略高于
        Vdd/2；存储"0"的单元（电容接近 0 V）将位线拉至略低。偏差仅为
        <strong>ΔV ≈ ±55 mV</strong>（由电荷共享公式得出，Cs=20fF，Cbl=200fF）。
      </p>
      <p>
        等待 <strong>tRCD</strong>（RAS 到 CAS 延迟，10–15 ns）使位线充分稳定后，
        灵敏放大器触发。每个灵敏放大器在 1–2 ns 内完成判决，将 ±55 mV 信号放大至
        完整的 0–1.2 V 摆幅。行此时处于"打开"状态——该行中所有 1,024 个存储单元
        的数据都被锁存进灵敏放大器，后者充当行缓冲区。
      </p>

      <h2>第三步：列选择——CAS 与 DQS</h2>
      <p>
        行打开、灵敏放大器保持数据后，控制器发送包含列地址的 READ 命令。
        <strong>列译码器</strong>选中相应位线，并通过 IO 门控将其连接至 DQ 输出总线。
      </p>
      <p>
        等待 <strong>CL</strong>（CAS 延迟，以时钟周期计量）后，第一个数据字节出现在
        DQ 引脚上。对于 DDR4-3200 CL22，每个周期为 0.625 ns，因此
        CL = 22 × 0.625 = <strong>13.75 ns</strong> 的额外等待时间。
      </p>
      <p>
        <strong>DQS</strong>（数据选通）信号与数据同步切换，每个字节通道一个。
        控制器以 DQS 作为源同步时钟，在每个字节的有效窗口中心精确采样。若没有
        DQS，控制器必须精确掌握整个往返传播延迟才能正确锁存数据。
      </p>

      <h2>第四步：突发传输</h2>
      <p>
        DRAM 始终以突发方式传输数据，而非单字节。一次 <strong>BL8 突发</strong>
        （突发长度 8）每条 READ 命令返回 8 个连续列的数据。在 DDR 速率（时钟两个沿
        均传输数据）下，BL8 通过 64 位总线传输：
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>8 次传输 × 8 字节 = 每条 READ 命令传输 64 字节</div>
        <div className="text-dram-muted mt-1">= 每条命令恰好填满一条 CPU 缓存行</div>
        <div className="text-dram-muted mt-1">在 3200 MT/s 下：64B ÷ (8 次传输 × 0.3125ns) ≈ 25.6 GB/s 峰值</div>
      </div>
      <p>
        突发传输将昂贵的 ACT 开销（tRCD ≈ 14 ns）分摊到 64 个有效字节上。若
        DRAM 每条命令只返回 1 字节，有效带宽将大幅崩溃。
      </p>

      <h2>第五步：数据恢复——隐式写回</h2>
      <p>
        数据出现在 DQ 上后，字线<em>仍处于高电平</em>。灵敏放大器此时将 BL 驱动至满
        摆幅（Vdd 或 GND），同时通过导通的晶体管将该电压泵回存储电容。这就是
        <strong>写回／恢复</strong>步骤，使破坏性读操作能够自我修复。
      </p>
      <p>
        行必须保持打开至少 <strong>tRAS</strong>（行有效选通时间，≈ 32–48 ns）
        才能保证完全恢复。在 tRAS 到期前关闭行，会导致部分存储单元只充电到一半
        而造成数据错误。
      </p>

      <h2>延迟分解</h2>
      <LatencyPipelineDiagram />

      <h2>行缓冲：开放页策略与关闭页策略</h2>
      <p>
        一旦某行被激活，灵敏放大器就保存着该行的所有数据——该行处于"行缓冲区"中。
        对<em>同一行</em>在<em>同一 Bank</em>中的后续读请求可以完全跳过 PRE 和
        ACT 步骤，直接发送 CAS。这就是<strong>行缓冲命中</strong>，速度显著更快。
      </p>

      <RowBufferDiagram />

      <p>
        内存控制器必须决定：在一次访问后是否让行继续保持打开状态
        （<strong>开放页策略</strong>，押注下一次访问命中同一行），还是每次访问
        后立即预充电（<strong>关闭页策略</strong>，将缺失延迟降至最低）。实际
        控制器采用自适应策略：对顺序或步长访问模式使用开放页策略，对随机访问
        负载使用关闭页策略。
      </p>

      <h2>动手试一试</h2>
      <p>
        在阵列仿真器中点击任意存储单元。观察行激活过程（该行所有单元亮起）、
        列选择过程（特定单元高亮），以及数据出现在输出端的过程。
      </p>

      <DRAMArraySim mode="read" />

      <LessonNav lessonId={5} onComplete={() => markComplete(5)} lessons={lessonsZh} />
    </div>
  )
}
