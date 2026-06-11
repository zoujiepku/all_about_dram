import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import { lessonsZh } from '../../data/lessons.zh'

function ComparisonTable() {
  const types = [
    {
      name: 'DDR5',
      use: '台式机 / 服务器 / 工作站',
      voltage: '1.1V',
      bandwidth: '38–51 GB/s/通道（×2 = 76–102 GB/s 双通道）',
      busWidth: '每 DIMM 2 × 32 位子通道',
      latency: '~14 ns（CL + tRCD）',
      capacity: '每 DIMM 最高 128 GB（2024）',
      feature: '片上 ECC（On-die ECC）、DIMM 上 PMIC、16n 预取、单 Bank 刷新、RFM RowHammer 防御',
      color: '#a855f7',
    },
    {
      name: 'LPDDR5 / 5X',
      use: '移动 SoC / 轻薄笔记本 / 智能手机',
      voltage: '0.5–1.05V',
      bandwidth: '44–68 GB/s（5X：最高 85 GB/s）',
      busWidth: '每通道 16/32 位（4–8 通道接 SoC）',
      latency: '~15 ns',
      capacity: '4–32 GB 封装内集成（PoP）',
      feature: '深度休眠模式（nW 级自刷新）、倒装芯片 PoP 集成、片上 Link-ECC',
      color: '#22c55e',
    },
    {
      name: 'GDDR6 / 6X',
      use: '独立 GPU / AI 推理',
      voltage: '1.35V',
      bandwidth: '448–512 GB/s（256 位 @ 14–16 Gbps/引脚）',
      busWidth: '每芯片 16 或 32 位',
      latency: '~30 ns（较高，但被 GPU 并行度掩盖）',
      capacity: '8–24 GB（消费级），最高 32 GB（专业级）',
      feature: 'PAM4 信令（GDDR6X）、WCK 以 2× 数据率运行、宽引脚训练、高 Vpp',
      color: '#f59e0b',
    },
    {
      name: 'HBM3 / 3E',
      use: 'AI 加速器（H100/H200）/ 高性能计算',
      voltage: '1.1V',
      bandwidth: '每堆栈 819 GB/s（HBM3E：最高 1.2 TB/s）',
      busWidth: '每堆栈 1024 位',
      latency: '~100 ns（含控制器 + PHY 开销）',
      capacity: '每堆栈 24–36 GB（HBM3E：最高 64 GB）',
      feature: 'TSV + 微焊球堆叠、硅转接板（2.5D）、部分型号支持 PIM 扩展',
      color: '#3b82f6',
    },
  ]

  return (
    <div className="space-y-4 mb-6">
      {types.map((t) => (
        <div
          key={t.name}
          className="rounded-xl p-5 border"
          style={{ borderColor: t.color + '44', backgroundColor: t.color + '08' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-lg" style={{ color: t.color }}>{t.name}</h4>
            <span className="text-xs text-dram-muted px-2 py-1 bg-dram-bg rounded font-mono">{t.use}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {[
              ['电压', t.voltage],
              ['带宽', t.bandwidth],
              ['延迟', t.latency],
              ['总线宽度', t.busWidth],
              ['容量', t.capacity],
            ].map(([k, v]) => (
              <div key={k} className="bg-dram-bg rounded-lg p-2">
                <div className="text-xs text-dram-muted">{k}</div>
                <div className="text-xs font-bold font-mono leading-tight mt-0.5" style={{ color: t.color }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-dram-muted bg-dram-bg rounded-lg p-2">
            <span className="text-dram-text font-medium">主要特性：</span>{t.feature}
          </div>
        </div>
      ))}
    </div>
  )
}

function DDRBusDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        DDR5 子通道架构
      </h3>
      <svg width="100%" height="140" viewBox="0 0 540 140" preserveAspectRatio="xMidYMid meet">
        {/* Controller */}
        <rect x="10" y="40" width="100" height="60" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="60" y="65" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">内存</text>
        <text x="60" y="79" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">控制器</text>

        {/* Subchannel A label */}
        <text x="195" y="28" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">子通道 A（32 位）</text>
        <line x1="110" y1="55" x2="280" y2="55" stroke="#a855f7" strokeWidth="2"/>
        <text x="195" y="50" textAnchor="middle" fill="#a855f7" fontSize="8">DQ[0:31] + DQS[0:3] + DM[0:3]</text>

        {/* Subchannel B label */}
        <text x="195" y="110" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">子通道 B（32 位）</text>
        <line x1="110" y1="85" x2="280" y2="85" stroke="#22c55e" strokeWidth="2"/>
        <text x="195" y="97" textAnchor="middle" fill="#22c55e" fontSize="8">DQ[32:63] + DQS[4:7] + DM[4:7]</text>

        {/* DIMM */}
        <rect x="280" y="30" width="100" height="80" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <text x="330" y="65" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">DDR5</text>
        <text x="330" y="79" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">DIMM</text>

        {/* Arrows indicating independent */}
        <text x="420" y="55" fill="#64748b" fontSize="9">独立</text>
        <text x="420" y="68" fill="#64748b" fontSize="9">命令/数据</text>
        <text x="420" y="81" fill="#64748b" fontSize="9">调度</text>

        {/* DDR arrows for subchannel A */}
        {[130, 160, 190].map(x => (
          <g key={x}>
            <line x1={x} y1="46" x2={x} y2="54" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
            <line x1={x+15} y1="54" x2={x+15} y2="46" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
          </g>
        ))}
        {/* DDR arrows for subchannel B */}
        {[130, 160, 190].map(x => (
          <g key={x}>
            <line x1={x} y1="82" x2={x} y2="90" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
            <line x1={x+15} y1="90" x2={x+15} y2="82" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
          </g>
        ))}
      </svg>
      <p className="text-xs text-dram-muted mt-2">
        每个子通道拥有独立的命令/地址总线，可独立调度。控制器可在向子通道 A 发送写操作的同时，
        让子通道 B 处理另一个 32 字节访问。与 DDR4 单条 64 位总线相比，这将最小传输粒度减半。
      </p>
    </div>
  )
}

function GDDRDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        GPU 上的 GDDR6 — 宽并行总线
      </h3>
      <svg width="100%" height="130" viewBox="0 0 520 130" preserveAspectRatio="xMidYMid meet">
        {/* GPU die */}
        <rect x="170" y="20" width="180" height="90" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
        <text x="260" y="60" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="bold">GPU 裸片</text>
        <text x="260" y="78" textAnchor="middle" fill="#64748b" fontSize="10">256 位存储总线</text>
        <text x="260" y="92" textAnchor="middle" fill="#64748b" fontSize="9">（8 颗芯片 × 32 位）</text>

        {/* GDDR chips left */}
        {[0, 1, 2, 3].map(i => (
          <g key={'L' + i}>
            <rect x={10} y={10 + i * 28} width={50} height={20} rx={3} fill="#451a03" stroke="#f59e0b" strokeWidth={1}/>
            <text x={35} y={23 + i * 28} textAnchor="middle" fill="#f59e0b" fontSize={8}>GDDR6</text>
            <line x1={60} y1={20 + i * 28} x2={170} y2={65} stroke="#f59e0b" strokeWidth={1} opacity={0.5}/>
          </g>
        ))}

        {/* GDDR chips right */}
        {[0, 1, 2, 3].map(i => (
          <g key={'R' + i}>
            <rect x={460} y={10 + i * 28} width={50} height={20} rx={3} fill="#451a03" stroke="#f59e0b" strokeWidth={1}/>
            <text x={485} y={23 + i * 28} textAnchor="middle" fill="#f59e0b" fontSize={8}>GDDR6</text>
            <line x1={460} y1={20 + i * 28} x2={350} y2={65} stroke="#f59e0b" strokeWidth={1} opacity={0.5}/>
          </g>
        ))}

        <text x="260" y="120" textAnchor="middle" fill="#64748b" fontSize="9">8 × 16 Gbit 芯片 = 16 GB 总容量 | 512 GB/s @ 16 Gbps/引脚</text>
      </svg>
    </div>
  )
}

export default function L09() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">模块 09</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">现代 DRAM</h1>
        <p className="text-dram-muted mt-2">DDR5、LPDDR5、GDDR6、HBM3 — 四大内存家族及其适用场景</p>
      </div>

      <ComparisonTable />

      <h2>DDR5：改变了什么，为何而变</h2>

      <h3>每 DIMM 两条子通道</h3>
      <p>
        DDR4 每块 DIMM 只有一条 64 位数据总线。DDR5 将其拆分为两条独立的 32 位子通道，
        各自拥有独立的命令/地址总线、DQS 选通信号和 DM 信号。
        这样做的原因：更窄的总线可以独立调度——控制器可以同时向子通道 A 发送写操作、向子通道 B
        发送读操作。在不增加物理走线数量的前提下，有效 Bank 并行度几乎翻倍。
      </p>

      <DDRBusDiagram />

      <h3>片上 ECC（ODECC）</h3>
      <p>
        每颗 DDR5 芯片内部都集成了 ECC 电路。在将数据写入存储阵列之前，芯片会计算奇偶校验码
        并与数据一同存储。读取时，芯片在将数据发送给控制器之前，先进行校验并纠正单比特错误——
        整个过程对控制器透明，控制器直接收到的就是正确数据。
      </p>
      <p>
        ODECC 防护的是芯片内部故障（工艺缺陷、粒子轰击），这类故障对 DIMM 级 ECC（位于芯片外部）
        是不可见的。ODECC <em>并不</em>取代 DIMM ECC——服务器系统仍然同时使用两者。
        对于没有 DIMM ECC 的消费级 DDR5 系统，至少能获得 ODECC 的保护。
      </p>

      <h3>DIMM 上的电源管理芯片（PMIC）</h3>
      <p>
        DDR4 依赖主板稳压器为所有芯片提供 Vdd。DDR5 将 PMIC（电源管理 IC）直接集成到
        DIMM 模组上，由其从主板 12 V 供电生成三路所需电压：<strong>VDD = 1.1 V</strong>
        （核心供电）、<strong>VDDQ = 1.1 V</strong>（I/O 供电）和 <strong>VPP = 1.8 V</strong>
        （内部字线电荷泵供电）。这提升了模组全局的电压精度，尤其是在高负载时
        DDR4 因 PCB 走线电阻造成的压降问题得以改善。
      </p>

      <h2>LPDDR5 / LPDDR5X：移动优先</h2>
      <p>
        LPDDR（低功耗 DDR）通过 PoP（叠层封装）或直接键合到 SoC 转接板的方式与移动 SoC 集成。
        与 DIMM 不同，LPDDR 芯片距离处理器仅数毫米，因此走线极短、信号摆幅也更小。
      </p>
      <p>
        移动端专属特性：
      </p>
      <ul>
        <li><strong>深度断电模式</strong>：LPDDR5 可进入保留模式（VDDQ = 0 V，
            存储单元由独立的最小电流 VDD1 供电维持数据）或自刷新模式
            （DRAM 用内部振荡器自主刷新，控制器完全空闲）。功耗从活跃时约 1 W
            降至深度自刷新时 1 mW 以下。</li>
        <li><strong>电压动态调节</strong>：Vdd 可在 1.05 V（性能模式）至 0.5 V
            （低功耗刷新）之间变化。LPDDR 协议包含动态更改供电电压的专用命令。</li>
        <li><strong>Link ECC</strong>：LPDDR5X 新增单突发 ECC 模式，以极低面积开销
            保护封装内短总线免受软错误和串扰影响。</li>
        <li><strong>LPDDR5X</strong>（扩展版）在 64 位总线上达到 8533 MT/s，约 85 GB/s——
            用于旗舰智能手机（Apple A17/M 系列、骁龙 8 Gen 3）。</li>
      </ul>

      <h2>GDDR6 / GDDR6X：GPU 带宽利器</h2>
      <p>
        图形 DDR 专为以适中成本实现最大带宽而设计。GPU 在 256–384 位总线上配 8–12 颗 GDDR6 芯片，
        每颗芯片总线宽度 32 位，8 颗合计 256 位。16 Gbit（2 GB）的单芯片容量意味着
        8 颗 = 16 GB，这是中高端 GPU 的典型配置。
      </p>

      <GDDRDiagram />

      <h3>GDDR6 中的 WCK 与 PAM4</h3>
      <p>
        GDDR6 引入了 <strong>WCK</strong>（写时钟）——一个以 2× 数据率运行的独立时钟。
        命令时钟 CK 以基础频率运行，而 WCK 以 2× 频率驱动 DQ 数据路径，
        从而改善信号完整性。数据接口拥有自己更快的选通信号，与命令时序解耦。
      </p>
      <p>
        <strong>GDDR6X</strong>（用于 NVIDIA RTX 3090/4090）将 NRZ（双电平）信令替换为
        <strong>PAM4</strong>（四电平脉冲幅度调制）。PAM4 每个符号编码 2 位，在相同信号速率下
        将数据吞吐量翻倍。代价是 9.5 dB 的信噪比损失——PAM4 眼图是 NRZ 的 1/3，
        需要复杂的均衡处理。GDDR6X 每引脚可达 21 Gbps，而 GDDR6 为 16 Gbps。
      </p>

      <h2>如何选择合适的 DRAM</h2>
      <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dram-surface">
              <th className="text-left p-3 text-dram-muted font-semibold">需求场景</th>
              <th className="text-left p-3 text-dram-muted font-semibold">推荐选型</th>
              <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">原因</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['大寻址空间（8–128 GB）', 'DDR5 DIMM', '容量最大、标准插槽、支持 ECC'],
              ['电池供电设备', 'LPDDR5X', '省电模式、PoP 封装、动态电压调节'],
              ['GPU 渲染 / AI 推理', 'GDDR6 / GDDR6X', '中等容量下每 GB/s 成本最低的最宽总线'],
              ['AI 训练 / HPC（带宽优先于容量）', 'HBM3 / HBM3E', '每瓦带宽最高，但价格昂贵且容量固定'],
              ['嵌入式 / IoT（低功耗、超小型）', 'LPDDR4 / LPDDR5', '封装最小、待机功耗最低'],
            ].map(([need, use, why], i) => (
              <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                <td className="p-3 text-dram-text">{need}</td>
                <td className="p-3 font-bold text-dram-blue">{use}</td>
                <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>数据总线反转（DBI）</h2>
      <p>
        DDR4 和 DDR5 均支持 DBI——一种降低功耗的技术。在 POD 信令中，驱动低电平比高电平
        消耗更多功率。当一个字节中超过 4 位将被驱动为低电平时，发送方会将全部 8 位取反，
        并设置 DBI 标志；接收方随即还原数据。结果是发送方每字节驱动低电平的位数永远不超过 4 位，
        在典型工作负载下可将 DQ 切换功耗降低最多 25%。DBI 以每字节通道一条额外控制线的代价，
        换来可观的节能效果。
      </p>

      <LessonNav lessonId={9} lessons={lessonsZh} onComplete={() => markComplete(9)} />
    </div>
  )
}
