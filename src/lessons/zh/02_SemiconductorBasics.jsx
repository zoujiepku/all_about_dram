import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import MOSFETViz from '../../visualizations/MOSFETViz'
import { lessonsZh } from '../../data/lessons.zh'

function CapacitorViz() {
  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        电容器 — 电荷存储
      </h3>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <svg width="180" height="120" viewBox="0 0 180 120">
          <rect x="30" y="20" width="120" height="14" rx="2" fill="#3b82f6" opacity="0.8"/>
          <text x="90" y="31" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+ + + + + +</text>
          <rect x="30" y="37" width="120" height="20" rx="1" fill="#fde68a" opacity="0.5"/>
          <text x="90" y="50" textAnchor="middle" fill="#78350f" fontSize="9">介电层（绝缘体）</text>
          <rect x="30" y="60" width="120" height="14" rx="2" fill="#3b82f6" opacity="0.8"/>
          <text x="90" y="71" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">– – – – – –</text>
          <text x="90" y="100" textAnchor="middle" fill="#f59e0b" fontSize="13" fontFamily="monospace" fontWeight="bold">C = k × A / d</text>
          <text x="90" y="113" textAnchor="middle" fill="#64748b" fontSize="9">k=介电常数, A=面积, d=间距</text>
        </svg>
        <div className="text-sm text-dram-muted space-y-2 flex-1">
          <p>电容器将电荷存储在两块被介电层隔开的导电极板之间。</p>
          <p>电容 <code>C</code> 随以下因素增大：极板面积越大、介电层越薄、介电常数 k 越高。</p>
          <p>在 DRAM 中，电容器被制成高耸的垂直圆柱形，以在极小的占地面积内最大化极板面积——当今的电容器<strong>高度是直径的 40–100 倍</strong>（深宽比 40–100:1）。</p>
        </div>
      </div>
    </div>
  )
}

function LeakageDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        NMOS 漏电流 — 电容器电荷的流失原因
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: '亚阈值漏电',
            color: '#ef4444',
            magnitude: 'pA–nA',
            dominant: true,
            desc: '即使 V_GS < V_th，漏极到源极仍有电流流过。随温度呈指数增长。在 65 nm 以下节点，是限制保持时间的主导机制。',
            formula: 'I_sub ∝ exp(V_GS / nV_T)',
          },
          {
            name: '栅氧化层隧穿',
            color: '#f59e0b',
            magnitude: 'fA–pA',
            dominant: false,
            desc: '电子通过量子力学隧穿效应穿透栅氧化层进入沟道。仅在氧化层厚度低于约 2 nm 时才显著。DRAM 采用较厚的氧化层来抑制此效应。',
            formula: 'I_tunnel ∝ exp(−α × t_ox)',
          },
          {
            name: 'p-n 结漏电',
            color: '#3b82f6',
            magnitude: 'fA–pA',
            dominant: false,
            desc: '存储节点与 p 型衬底形成反向偏置结。热激发产生的电子空穴对会形成微小的反向饱和电流。',
            formula: 'I_j = I_0(e^{qV/kT} - 1)',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono" style={{ color: item.color }}>{item.magnitude}</span>
              {item.dominant && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: item.color + '22', color: item.color }}>主导因素</span>}
            </div>
            <p className="text-xs text-dram-muted mb-2">{item.desc}</p>
            <div className="text-xs font-mono text-dram-muted bg-dram-bg rounded px-2 py-1">{item.formula}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CapacitorEvolution() {
  const nodes = [
    { node: '180 nm（2001）', structure: '堆叠电容', material: 'Si₃N₄/SiO₂', k: 7, height: '~800 nm', cs: '~25 fF' },
    { node: '90 nm（2005）', structure: '王冠形电容', material: 'Al₂O₃', k: 9, height: '~1200 nm', cs: '~22 fF' },
    { node: '40 nm（2012）', structure: '圆柱形电容', material: 'HfO₂/ZrO₂', k: 20, height: '~1800 nm', cs: '~18 fF' },
    { node: '16 nm（2019）', structure: '高圆柱形电容', material: 'ZrO₂/Al₂O₃/ZrO₂', k: 40, height: '~3500 nm', cs: '~12–16 fF' },
    { node: '10 nm（2024）', structure: '超高圆柱形电容', material: 'ZAZ/TiN', k: '>45', height: '~4500 nm', cs: '~10–14 fF' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">工艺节点</th>
            <th className="text-left p-3 text-dram-muted font-semibold">结构</th>
            <th className="text-left p-3 text-dram-muted font-semibold">介电材料</th>
            <th className="text-left p-3 text-dram-muted font-semibold">k 值</th>
            <th className="text-left p-3 text-dram-muted font-semibold">电容高度</th>
            <th className="text-left p-3 text-dram-muted font-semibold">Cs</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((n, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono text-dram-amber">{n.node}</td>
              <td className="p-3 text-dram-muted">{n.structure}</td>
              <td className="p-3 font-mono text-dram-blue">{n.material}</td>
              <td className="p-3 font-mono text-dram-green">{n.k}</td>
              <td className="p-3 font-mono text-dram-muted">{n.height}</td>
              <td className="p-3 font-mono text-dram-text font-bold">{n.cs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MOSFETExplainer() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        NMOS 工作原理 — 三个工作区
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            name: '截止区（关断）',
            cond: 'V_GS < V_th',
            color: '#64748b',
            desc: '无导电沟道形成，仅有极小的漏电流通过。存储电容器与位线完全隔离。',
            use: '字线低电平 → 单元隔离',
          },
          {
            name: '饱和区',
            cond: 'V_GS > V_th, V_DS > V_GS − V_th',
            color: '#f59e0b',
            desc: '沟道在漏端夹断，电流仅受 V_GS 控制，相当于受控电流源。',
            use: '字线上升初期 — 过渡状态',
          },
          {
            name: '线性区（导通）',
            cond: 'V_GS > V_th, V_DS < V_GS − V_th',
            color: '#22c55e',
            desc: '从源极到漏极形成完整导电沟道，V_GS 越大阻抗越低，单元与位线相连。',
            use: '字线完全高电平 → 读/写',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="text-xs font-mono text-dram-muted mb-2">{item.cond}</div>
            <p className="text-xs text-dram-muted mb-2">{item.desc}</p>
            <div className="text-xs bg-dram-bg rounded px-2 py-1 font-mono" style={{ color: item.color }}>{item.use}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        字线电压必须升压至 Vpp ≈ 2.5–3 V（字线升压），以确保在读写过程中晶体管始终工作在线性区。
        在 Vdd = 1.2 V 时，V_GS = 1.2 V，V_th ≈ 0.5 V，因此 V_GS − V_th = 0.7 V。
        向电容写入"1"时，V_cap → Vdd = 1.2 V，此时 V_DS → 0——只有当 V_GS（字线）超过
        Vdd + V_th ≈ 1.7 V 时才可能实现，因此需要 Vpp 升压。
      </p>
    </div>
  )
}

export default function L02() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 02</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">半导体基础</h1>
        <p className="text-dram-muted mt-2">构成 DRAM 的晶体管与电容器——以及它们的物理特性如何决定 DRAM 的行为</p>
      </div>

      <h2>硅中的二进制存储</h2>
      <p>
        数字系统以<strong>比特</strong>存储信息——值只能是 0 或 1。
        在 DRAM 中，一个比特对应电容器上电荷的有无。
        充电至约 Vdd（DDR5 中为 1.2 V）的电容器表示逻辑 <strong>1</strong>；
        接近 0 V 表示逻辑 <strong>0</strong>。判断阈值为 Vdd/2（0.6 V）——
        电容器电压高于此值即为 1，低于此值即为 0。
      </p>

      <h2>MOSFET：电压控制的开关</h2>
      <p>
        每个 DRAM 单元中的晶体管是 <strong>NMOS MOSFET</strong>（N 型金属氧化物半导体场效应晶体管），
        具有三个端口：
      </p>
      <ul>
        <li><strong>栅极（Gate）</strong>：控制输入端，连接字线。栅极电压决定晶体管的开关状态。</li>
        <li><strong>源极（Source）</strong>：连接位线。晶体管导通时，电荷在源极和漏极之间流动。</li>
        <li><strong>漏极（Drain）</strong>：连接存储电容器。电容器在此节点上储存电荷。</li>
      </ul>
      <p>
        关键参数是 <strong>V_th</strong>（阈值电压）：栅极电压超过此值时晶体管导通。
        DRAM 访问晶体管的典型 V_th ≈ 0.5–0.7 V。栅极电压低于 V_th 时，晶体管关断，
        电容器被隔离；栅极电压超过 V_th 时，源极与漏极之间形成导电沟道。
      </p>

      <MOSFETViz lang="zh" />

      <h2>三个工作区</h2>
      <MOSFETExplainer />

      <h2>体效应：为何需要字线升压</h2>
      <p>
        阈值电压 V_th 并非常数——随着晶体管源极电压升高，V_th 会<strong>增大</strong>。
        这就是<strong>体效应</strong>：
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>V_th(V_SB) = V_th0 + γ × (√(2φ_F + V_SB) − √(2φ_F))</div>
        <div className="text-dram-muted mt-2">典型 DRAM NMOS 参数：V_th0 ≈ 0.5V，γ ≈ 0.5V^0.5，φ_F ≈ 0.35V</div>
        <div className="text-dram-muted mt-1">写入"1"时：源极电压 → Vdd = 1.2V → V_th 升至约 0.7–0.8V</div>
      </div>
      <p>
        写操作期间电容器向 Vdd = 1.2 V 充电时，源极端（即电容节点）电位升高。
        体效应使 V_th 随之升高，导致电容器尚未充满时晶体管就趋于关断。
        为防止这种情况，字线被升压至 Vpp ≈ 2.5–3 V，确保整个写周期内
        V_GS 始终远高于 V_th。
      </p>
      <p>
        反之，在待机状态（WL = 0）下，DRAM 采用<strong>负字线</strong>
        （nWL ≈ −0.5 V）。负的栅极电压反向增大 V_GS 与阈值的差距，抑制亚阈值漏电，
        将保持时间延长约 10 倍。
      </p>

      <h2>电容器：电荷存储</h2>
      <p>
        DRAM 电容器必须保有足够的电荷，使灵敏放大器在与位线共享电荷后仍能可靠地检测到信号。
        所需的最小电荷约为 10–20 fC（飞库）。由于 Q = C × V，V ≈ 0.6 V（即 Vdd 的一半），
        因此需要 C ≥ 17–33 fF。
      </p>
      <p>
        <code>C = k × ε₀ × A / d</code> — 电容随介电常数 k 增大、极板面积 A 增大、
        极板间距 d 减小而增大。
      </p>

      <CapacitorViz />

      <h2>DRAM 电容器的演进</h2>
      <p>
        随着工艺节点缩小，单元占地面积也在缩小——但所需电荷量并未减少。
        工程师用两种手段应对：<strong>高介电常数材料</strong>（将 k=3.9 的 SiO₂ 替换为
        k=40–50 的 ZrO₂ 基叠层）和<strong>更高的圆柱体</strong>（纵向增加极板面积，
        而非横向扩展）：
      </p>

      <CapacitorEvolution />

      <p>
        在 10 nm 节点，圆柱形电容器在约 40 nm × 40 nm 的单元占地上高达 ~4.5 µm，
        深宽比超过 100:1。制造这类结构需要原子层沉积（ALD）工艺将共形介电薄膜
        均匀地涂覆在圆柱内壁，并用 ALD 沉积氮化钛（TiN）电极填充狭窄的圆柱，
        确保无空隙。
      </p>

      <h2>漏电流：保持时间的大敌</h2>
      <p>
        晶体管必须在两次刷新之间（64 ms 内）将电荷保持在电容器上。
        但没有晶体管是完美的开关——三种漏电机制会持续消耗电容器上的电荷：
      </p>

      <LeakageDiagram />

      <p>
        亚阈值漏电是限制因素。它与 V_GS 和温度均呈指数关系。在室温下，
        单个单元的综合漏电约为 <strong>100–200 fA</strong>（飞安）——
        恰好使 20 fF 电容器在约 64 ms 内从 Vdd 放电至 Vdd/2：
        Q = C × ΔV = 20 fF × 0.6 V = 12 fC；
        t = 12 fC ÷ 180 fA ≈ 67 ms。在 85°C 时，漏电流增长 8–16 倍（Arrhenius 定律），
        保持时间缩短至 4–8 ms。
      </p>

      <h2>整合：1T1C 单元</h2>
      <p>
        一个 NMOS 晶体管（访问晶体管）+ 一个电容器（存储电容）= 完整的 DRAM 比特单元。
        晶体管栅极连接字线，控制访问；源极连接位线，传输数据；漏极连接电容器下极板，
        上极板接 Vdd/2 作为参考电位。
      </p>
      <p>
        我们将学习的每一个 DRAM 特性——破坏性读取（电荷共享）、周期性刷新（漏电）、
        字线升压（体效应）、时序约束（RC 稳定时间、SA 分辨时间）——
        都可以直接追溯到这一个晶体管和一个电容器的物理特性。
      </p>

      <LessonNav lessonId={2} lessons={lessonsZh} onComplete={() => markComplete(2)} />
    </div>
  )
}
