import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import DRAMArraySim from '../../visualizations/DRAMArraySim'
import { lessonsZh } from '../../data/lessons.zh'

function BitlineTopologyDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        折叠位线 vs 开放位线架构
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 开放位线 */}
        <div>
          <div className="text-xs font-mono text-dram-amber mb-3 text-center">开放位线（旧式，结构简单）</div>
          <svg width="100%" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet">
            {/* SA 左侧单元 */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={10} y={20 + i*40} width={22} height={18} rx={3} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1}/>
                <text x={21} y={32+i*40} textAnchor="middle" fill="#3b82f6" fontSize={8}>C{i}</text>
                <line x1={32} y1={29+i*40} x2={85} y2={80} stroke="#3b82f6" strokeWidth={1} opacity={0.5}/>
              </g>
            ))}
            {/* SA 右侧单元 */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={168} y={20 + i*40} width={22} height={18} rx={3} fill="#163820" stroke="#22c55e" strokeWidth={1}/>
                <text x={179} y={32+i*40} textAnchor="middle" fill="#22c55e" fontSize={8}>C{i}</text>
                <line x1={168} y1={29+i*40} x2={115} y2={80} stroke="#22c55e" strokeWidth={1} opacity={0.5}/>
              </g>
            ))}
            {/* SA */}
            <rect x={80} y={68} width={40} height={24} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5}/>
            <text x={100} y={83} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">SA</text>
            {/* BL 和 BLB 标签 */}
            <text x={55} y={65} fill="#3b82f6" fontSize={8}>BL</text>
            <text x={130} y={65} fill="#22c55e" fontSize={8}>BLB</text>
            {/* 噪声说明 */}
            <text x={100} y={130} textAnchor="middle" fill="#ef4444" fontSize={8}>来自两个不同子阵列的单元</text>
            <text x={100} y={142} textAnchor="middle" fill="#ef4444" fontSize={8}>→ 噪声不对称</text>
          </svg>
        </div>
        {/* 折叠位线 */}
        <div>
          <div className="text-xs font-mono text-dram-green mb-3 text-center">折叠位线（现代标准）</div>
          <svg width="100%" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet">
            {/* BL 单元 */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={10} y={15 + i*35} width={22} height={18} rx={3} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1}/>
                <text x={21} y={27+i*35} textAnchor="middle" fill="#3b82f6" fontSize={8}>R{i*2}</text>
                <line x1={32} y1={24+i*35} x2={80} y2={90} stroke="#3b82f6" strokeWidth={1} opacity={0.6}/>
              </g>
            ))}
            {/* BLB 单元 — 同侧，交替行 */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={40} y={22 + i*35} width={22} height={18} rx={3} fill="#163820" stroke="#22c55e" strokeWidth={1}/>
                <text x={51} y={34+i*35} textAnchor="middle" fill="#22c55e" fontSize={8}>R{i*2+1}</text>
                <line x1={62} y1={31+i*35} x2={120} y2={90} stroke="#22c55e" strokeWidth={1} opacity={0.6}/>
              </g>
            ))}
            {/* SA */}
            <rect x={80} y={80} width={60} height={24} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1.5}/>
            <text x={110} y={95} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">SA</text>
            <text x={90} y={115} fill="#3b82f6" fontSize={8}>BL</text>
            <text x={120} y={115} fill="#22c55e" fontSize={8}>BLB</text>
            <text x={110} y={140} textAnchor="middle" fill="#22c55e" fontSize={8}>同一子阵列 → BL 与 BLB 噪声对称</text>
            <text x={110} y={152} textAnchor="middle" fill="#22c55e" fontSize={8}>SA 共模抑制消除噪声</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-dram-muted mt-3">
        折叠位线设计中，BL 和 BLB 均来自同一物理子阵列的单元，因此耦合到 BL 上的任何噪声
        也会等量耦合到 BLB——SA 将其抵消。开放位线没有这种对称性。
        所有现代 DRAM 均采用折叠位线架构。
      </p>
    </div>
  )
}

function AddressMultiplexDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        地址复用 — RAS 和 CAS 共用同一组引脚
      </h3>
      <div className="flex flex-col gap-2 font-mono text-xs">
        {[
          { phase: 'RAS↓', pins: 'A[0:15]', color: '#f59e0b', label: '锁存行地址', note: '等待 tRCD' },
          { phase: 'CAS↓', pins: 'A[0:10]', color: '#3b82f6', label: '锁存列地址', note: '+ 突发起始' },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: r.color + '11', border: `1px solid ${r.color}33` }}>
            <span className="font-bold w-14 text-center" style={{ color: r.color }}>{r.phase}</span>
            <span className="text-dram-muted w-20">{r.pins}</span>
            <span className="text-dram-text flex-1">{r.label}</span>
            <span className="text-dram-muted text-right">{r.note}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        同一组 16 根地址引脚在 RAS 选通时传送行地址，在 CAS 选通时传送列地址。
        与完整并行地址总线相比，这将所需引脚数减半，代价是需要两个独立的总线周期
        才能完整寻址一个单元。
      </p>
    </div>
  )
}

export default function L04() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 04</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DRAM 阵列组织</h1>
        <p className="text-dram-muted mt-2">数十亿个 1T1C 单元如何被组织成一个高速、可寻址的阵列</p>
      </div>

      <DRAMArraySim lang="zh" />

      <h2>从单个单元到二维阵列</h2>
      <p>
        一个 1T1C 单元存储一个比特。将足够多的单元排列成网格，便构成了内存。
        网格有两条轴：<strong>行</strong>（字线，水平方向）和<strong>列</strong>（位线，垂直方向）。
        每个单元恰好位于一个行列交叉点。要寻址特定的比特，需拉高一根字线（选中行），
        再激活一条列路径（选中列）。
      </p>
      <p>
        以典型的 DDR4 芯片（例如 8 Gb x8）为例，每个 Bank 有 <strong>65,536 行 × 8,192 列</strong>，
        每 Bank 容量为 512 Mb。16 个 Bank 合计 <strong>8 Gb</strong>/芯片。
        一条 16 GB DDR4 DIMM 每个 rank 使用 8 颗这样的芯片，组成 64 位宽的总线
        （每颗 x8 芯片提供 8 位），两个 rank 共 16 GB——每个 rank 还额外配一颗 ECC 芯片。
      </p>

      <h2>字线与位线</h2>
      <p>
        <strong>字线</strong>横向贯穿阵列。每根字线连接同一行所有晶体管的栅极——
        通常是 1,024 个晶体管并联。拉高字线会同时导通所有这些晶体管，
        将该行的每个单元都暴露给对应的位线。这一操作称为<strong>行激活</strong>，
        也叫"打开一行"。
      </p>
      <p>
        <strong>位线</strong>纵向贯穿阵列。每根位线连接同一列所有晶体管的漏极——
        该列所有单元共享一根位线。由于位线接触数百个单元，其总寄生电容
        （Cbl ≈ 100–300 fF）远大于任意单个单元的存储电容（Cs ≈ 15–25 fF）。
        正是这个比值迫使灵敏放大器必须检测极小的电压偏移。
      </p>

      <h2>灵敏放大器与感应区</h2>
      <p>
        每根位线的底部（或顶部，取决于版图设计）都有一个<strong>灵敏放大器（SA）</strong>。
        其职责是：检测行激活后位线相对于 Vdd/2 的微小偏移方向，
        再将该差值放大为满摆幅信号。SA 是一个交叉耦合反相器锁存器——
        位线稳定至电荷共享平衡点后，SA 在 1–2 ns 内完成判决。
      </p>
      <p>
        灵敏放大器占用相当大的面积（在 20 nm 节点每个 SA 约 2–3 µm 宽）。
        为减少硅面积浪费，阵列被划分为多个<strong>子阵列</strong>，
        相邻子阵列之间共享一个感应区。典型芯片包含 256–512 个子阵列，
        每个约 256 行 × 512 列，每对子阵列之间设有一个 SA 区。
      </p>

      <h2>折叠位线 vs 开放位线架构</h2>
      <p>
        BL 和 BLB 连接到 SA 的方式决定了 SA 的噪声抑制能力：
      </p>

      <BitlineTopologyDiagram />

      <p>
        在<strong>开放位线</strong>拓扑（旧式，DDR1 时代）中，BL 来自一个子阵列的单元，
        BLB 来自相邻的不同子阵列。任何对两侧产生不同影响的噪声（例如字线串扰）
        在 SA 看来都像真实信号。
      </p>
      <p>
        在<strong>折叠位线</strong>拓扑（所有现代 DRAM 采用）中，BL 和 BLB 均来自
        同一子阵列，单元以交替间距排列——偶数行连接 BL，奇数行连接 BLB。
        耦合入子阵列的噪声对 BL 和 BLB 的影响相同，SA 看到的差分噪声为零。
        这种共模抑制能力正是折叠位线主导市场的原因。
      </p>
      <p>
        折叠位线的缺点：每根位线的有效单元密度减半（仅每隔一行连接到 BL，其余连接到 BLB）。
        设计上通过更小的单元间距和半间距字线来补偿。
      </p>

      <h2>行译码器与列译码器</h2>
      <p>
        行译码器接收行地址（通常 15–16 位），精确驱动一根字线有效。
        内部采用<strong>基于 NAND 的译码树</strong>：地址被分段预译码（生成部分选择信号），
        再由每根字线对应的最终 NAND 门合并部分信号。这种方案在保持译码速度
        （完整译码路径 &lt; 5 ns）的同时降低了每个门的扇入数。
      </p>
      <p>
        <strong>列译码器</strong>（也称 CAS 多路复用器或 IO 门控）负责选择已激活行中
        哪些位线连接到 DQ 输出总线。对于 BL8 突发（连续 8 列的突发传输），
        它在突发期间依次激活 8 × 总线宽度 根位线。
      </p>

      <h2>地址复用</h2>
      <p>
        DRAM 芯片的地址引脚在行地址和列地址之间复用——这就是地址复用。
        行地址首先输入（在 RAS 选通时锁存），然后列地址在相同引脚上输入
        （在 CAS 选通时锁存）。与完整并行地址总线相比，这将所需引脚数减半，
        显著降低封装成本。
      </p>

      <AddressMultiplexDiagram />

      <p>
        现代 DDR 采用<strong>命令/地址（CA）总线</strong>，将命令
        （ACT、READ、WRITE、PRE、REF）编码为地址引脚上的位模式，
        取消了物理 RAS/CAS 选通引脚。语义不变：行地址和列地址仍作为独立的
        总线事务，相隔 tRCD 依次到达。
      </p>

      <h2>Bank：独立的子阵列</h2>
      <p>
        单个阵列每次只能服务一行——在同一 Bank 中激活第二行，必须先关闭（预充电）第一行。
        为允许内存请求流水线化，现代 DRAM 芯片被划分为多个 <strong>Bank</strong>：
        物理上相互独立的阵列，各自拥有行译码器、灵敏放大器和已激活行寄存器。
      </p>
      <ul>
        <li>DDR3：每芯片 8 个 Bank</li>
        <li>DDR4：16 个 Bank（4 个 Bank Group × 每组 4 个 Bank）。各 Bank Group 拥有独立的内部数据通路，
            允许对不同 Bank Group 进行背靠背列访问，最小间隔仅需 tCCD_S = 4 周期，
            而同一 Bank Group 内需 tCCD_L = 5–8 周期。</li>
        <li>DDR5：32 个 Bank（每个子通道 8 个 Bank Group × 每组 4 个 Bank）</li>
      </ul>
      <p>
        当 Bank A 在等待 tRAS（行必须保持激活的最短时间）时，内存控制器可以激活 Bank B 的一行、
        发出 CAS 命令并获取数据——将 Bank A 的延迟隐藏在 Bank B 的有效工作中。
        这就是<strong>Bank 级并行</strong>，也是内存控制器最大化吞吐量的主要技术手段。
      </p>

      <LessonNav lessonId={4} lessons={lessonsZh} onComplete={() => markComplete(4)} />
    </div>
  )
}
