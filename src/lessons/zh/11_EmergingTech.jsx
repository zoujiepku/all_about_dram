import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import { lessonsZh } from '../../data/lessons.zh'

function TechCard({ name, mechanism, readSpeed, writeSpeed, endurance, retention, nonVol, status, color, desc, products }) {
  return (
    <div className="rounded-xl p-5 border" style={{ borderColor: color + '44', backgroundColor: color + '08' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-base" style={{ color }}>{name}</h4>
        <span
          className="text-xs px-2 py-0.5 rounded font-mono"
          style={{ backgroundColor: color + '22', color }}
        >
          {status}
        </span>
      </div>
      <p className="text-xs text-dram-muted mb-3">{desc}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          ['机制', mechanism],
          ['读取速度', readSpeed],
          ['写入速度', writeSpeed],
          ['耐久度', endurance],
          ['保留时间', retention],
          ['非易失性', nonVol],
        ].map(([k, v]) => (
          <div key={k} className="bg-dram-bg rounded p-2">
            <div className="text-xs text-dram-muted">{k}</div>
            <div className="text-xs font-bold font-mono" style={{ color }}>{v}</div>
          </div>
        ))}
      </div>
      {products && (
        <div className="text-xs text-dram-muted bg-dram-bg rounded p-2">
          <span className="text-dram-text font-medium">相关产品：</span>{products}
        </div>
      )}
    </div>
  )
}

function RadarViz({ techs }) {
  const attrs = ['速度', '密度', '耐久度', '保留性', '成熟度']
  const cx = 150, cy = 130, r = 90
  const n = attrs.length

  const getPoint = (i, val) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    const dist = (val / 10) * r
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)]
  }

  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        技术对比雷达图
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        <svg width="100%" height="auto" viewBox="0 0 300 260" style={{ maxWidth: 300 }}>
          {[2, 4, 6, 8, 10].map((v) => (
            <polygon key={v}
              points={attrs.map((_, i) => {
                const [px, py] = getPoint(i, v)
                return `${px},${py}`
              }).join(' ')}
              fill="none" stroke="#334155" strokeWidth="1"
            />
          ))}
          {attrs.map((_, i) => {
            const [px, py] = getPoint(i, 10)
            return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#334155" strokeWidth="1" />
          })}
          {attrs.map((label, i) => {
            const [px, py] = getPoint(i, 11.5)
            return (
              <text key={i} x={px} y={py} textAnchor="middle" dominantBaseline="middle"
                fill="#64748b" fontSize="10">{label}</text>
            )
          })}
          {techs.map((tech) => {
            const pts = tech.scores.map((s, i) => {
              const [px, py] = getPoint(i, s)
              return `${px},${py}`
            }).join(' ')
            return (
              <polygon key={tech.name} points={pts}
                fill={tech.color + '25'} stroke={tech.color} strokeWidth="1.5"
              />
            )
          })}
        </svg>
        <div className="flex flex-col gap-2 self-center">
          {techs.map((t) => (
            <div key={t.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }} />
              <span className="text-xs" style={{ color: t.color }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const radarTechs = [
  { name: 'DRAM', color: '#3b82f6', scores: [9, 7, 9, 2, 10] },
  { name: 'NAND Flash', color: '#f59e0b', scores: [5, 9, 4, 10, 10] },
  { name: 'ReRAM', color: '#22c55e', scores: [7, 8, 7, 9, 5] },
  { name: 'MRAM', color: '#a855f7', scores: [9, 4, 8, 10, 6] },
  { name: 'FeRAM', color: '#ef4444', scores: [8, 5, 9, 10, 6] },
]

function NANDEvolutionCard() {
  const rows = [
    { type: 'SLC（1 位/单元）', levels: 2, endurance: '~10 万次 P/E', retention: '>10 年', speed: '最快', use: '企业级缓存、NVMe Tier-0' },
    { type: 'MLC（2 位/单元）', levels: 4, endurance: '~1 万次 P/E', retention: '>10 年', speed: '快', use: '企业级 SSD、客户端 SSD' },
    { type: 'TLC（3 位/单元）', levels: 8, endurance: '~3000 次 P/E', retention: '~1–3 年', speed: '中等', use: '消费级 SSD（主流）' },
    { type: 'QLC（4 位/单元）', levels: 16, endurance: '~1000 次 P/E', retention: '<1 年', speed: '较慢', use: '高容量 HDD 替代、冷数据存储' },
    { type: 'PLC（5 位/单元）', levels: 32, endurance: '~100 次 P/E', retention: '数月', speed: '最慢', use: '磁带替代研究' },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">NAND Flash — 每单元位数演进</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-dram-muted border-b border-dram-border">
              <th className="text-left p-2">类型</th>
              <th className="p-2">电平数</th>
              <th className="p-2">耐久度</th>
              <th className="p-2">保留时间</th>
              <th className="p-2 hidden md:table-cell">应用场景</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']
              return (
                <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
                  <td className="p-2 font-bold" style={{ color: colors[i] }}>{r.type}</td>
                  <td className="p-2 font-mono text-center text-dram-muted">{r.levels}</td>
                  <td className="p-2 font-mono text-center text-dram-text">{r.endurance}</td>
                  <td className="p-2 font-mono text-center text-dram-text">{r.retention}</td>
                  <td className="p-2 text-dram-muted hidden md:table-cell">{r.use}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-dram-muted mt-2">
        每单元位数越多 = 每 GB 成本越低，但耐久度和保留时间也越差。3D NAND（96–232 层堆叠）
        通过在每个节点使用更厚的隧穿氧化层，并持续增加层数而非进一步缩小单元尺寸，
        在一定程度上弥补了这一劣势。
      </p>
    </div>
  )
}

function CXLDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">
        CXL 内存解聚架构
      </h3>
      <svg width="100%" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
        {/* CPUs */}
        {[0, 1].map(i => (
          <g key={i}>
            <rect x={20 + i * 140} y={20} width={110} height={50} rx={6} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5}/>
            <text x={75 + i * 140} y={43} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="bold">CPU {i}</text>
            <text x={75 + i * 140} y={58} textAnchor="middle" fill="#64748b" fontSize={9}>本地 DDR5</text>
          </g>
        ))}

        {/* PCIe / CXL switch */}
        <rect x="175" y="90" width="150" height="40" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth={1.5}/>
        <text x="250" y="108" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold">CXL 交换机</text>
        <text x="250" y="122" textAnchor="middle" fill="#64748b" fontSize={9}>PCIe 5.0 / CXL 3.0</text>

        {/* CXL DRAM expanders */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x={80 + i * 140} y={140} width={100} height={20} rx={3} fill="#1a2744" stroke="#22c55e" strokeWidth={1}/>
            <text x={130 + i * 140} y={153} textAnchor="middle" fill="#22c55e" fontSize={9}>CXL DRAM {i + 1}</text>
          </g>
        ))}

        {/* Connection lines */}
        {[0, 1].map(i => (
          <line key={i} x1={75 + i * 140} y1={70} x2={250} y2={90} stroke="#64748b" strokeWidth={1} strokeDasharray="4 2"/>
        ))}
        {[0, 1, 2].map(i => (
          <line key={i} x1={130 + i * 140} y1={140} x2={250} y2={130} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2"/>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        {[
          { label: '本地 DDR5 延迟', val: '~80 ns', color: '#3b82f6' },
          { label: 'CXL DRAM 延迟', val: '~180–300 ns', color: '#22c55e' },
          { label: '地址空间', val: '统一（同一虚拟地址）', color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="bg-dram-bg rounded p-2 text-center">
            <div className="text-dram-muted">{item.label}</div>
            <div className="font-bold font-mono mt-1" style={{ color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-2">
        多台服务器可共享一组 CXL DRAM 刀片，按需分配容量。
        运行内存密集型负载的服务器可从轻载服务器借用容量，
        将数据中心平均内存利用率从约 40% 提升至 70% 以上。
      </p>
    </div>
  )
}

export default function L11() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">模块 11</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">新兴存储技术</h1>
        <p className="text-dram-muted mt-2">ReRAM、FeRAM、MRAM、CXL 以及内存的未来</p>
      </div>

      <RadarViz techs={radarTechs} />

      <h2>DRAM 缩放为何放缓</h2>
      <p>
        DRAM 的缩放一直比逻辑缩放更难。逻辑门随晶体管等比缩小——晶体管变小，门也变小。
        而 DRAM 存储单元则受到两个独立约束：
      </p>
      <ul>
        <li><strong>电容</strong>必须存储足够的电荷才能被可靠检测（≥ 10–20 fC）。
            随着单元面积缩小，电容面积随之减小，电容量和存储电荷量也降低。
            工程师通过更高纵横比的圆柱形电容和更高介电常数材料（ZrO₂、HfO₂ 叠层，
            介电常数 k = 40–50，而 SiO₂ 仅 k = 3.9）来补偿，
            但纵横比超过 100:1（高度：直径）的制造极为困难。</li>
        <li><strong>晶体管</strong>漏电流必须足够低，以保证 64 ms 的数据保留时间。
            当栅极长度缩小至 20 nm 以下时，亚阈值漏电流呈指数级增大，缩短保留时间。
            埋字线（BWLD）设计和负字线（-0.5 V）技术可延长保留时间，但增加了工艺复杂度。</li>
      </ul>
      <p>
        DRAM 节点已停滞在约 10–16 nm 有效单元尺寸（而逻辑已达 3–5 nm）。
        业界正在研究能够替代或增强 DRAM 单元的替代方案。
      </p>

      <h2>新兴非易失性存储器</h2>

      <div className="space-y-4 mb-6">
        <TechCard
          name="ReRAM（电阻式 RAM）"
          mechanism="导电细丝形成/断裂实现阻变"
          readSpeed="~10 ns"
          writeSpeed="~10 ns"
          endurance="10⁸–10¹²"
          retention=">10 年"
          nonVol="是"
          status="早期量产"
          color="#22c55e"
          products="Weebit Nano（HfOx 基）、松下 RRAM（TaOx）、IMEC 研究"
          desc="两个电极之间的金属氧化物（如 HfOx、TaOx）通过导电细丝的形成或断裂来切换电阻状态。SET 操作生长细丝（低阻 = 逻辑 1）；RESET 操作断裂细丝（高阻 = 逻辑 0）。两端结构可实现极高密度——理论上可达 10 nm 以下单元。主要挑战：细丝形成的周期间一致性差，以及在小裕度下可靠区分两种电阻状态。"
        />
        <TechCard
          name="FeRAM（铁电 RAM）"
          mechanism="HfO₂ 基介质的铁电极化"
          readSpeed="~1–10 ns"
          writeSpeed="~1–10 ns"
          endurance="10⁸–10¹¹（HfO₂-FeFET）"
          retention=">10 年"
          nonVol="是"
          status="小批量生产"
          color="#ef4444"
          products="Texas Instruments（传统 PZT）、FMC（FRAM）、铁电 FET 研究（台积电、imec）"
          desc="利用铁电材料的双稳态极化状态作为存储单元。掺 Zr 的 HfO₂（HZO）与 CMOS 工艺兼容，可直接集成到 FET 栅极堆叠中（FeFET = 铁电场效应晶体管），完全省去独立电容。写入快速且低功耗——只需施加电压切换极化方向。读取为非破坏性（与 DRAM 不同）。传统 PZT 基 FeRAM 可达 10¹⁴ 次擦写周期，但不兼容 CMOS 工艺。"
        />
        <TechCard
          name="MRAM（磁性 RAM）"
          mechanism="磁隧道结（MTJ）阻变"
          readSpeed="~1–3 ns"
          writeSpeed="~1–10 ns"
          endurance=">10¹⁵"
          retention=">10 年（85°C 下）"
          nonVol="是"
          status="量产中（嵌入式）"
          color="#a855f7"
          products="Everspin（分立 STT-MRAM）、台积电 N22 嵌入式 MRAM、三星 28nm eMRAM、GlobalFoundries 22FDX"
          desc="磁隧道结由两层铁磁层夹一层薄 MgO 绝缘层构成。两层磁化方向平行时电阻低（逻辑 0）；反平行时电阻高（逻辑 1）。自旋转移矩（STT）通过隧道结的自旋极化电流切换磁化方向，无需外加磁场。MRAM 现已嵌入先进逻辑节点，作为末级缓存和微控制器代码存储的 SRAM 替代方案。超高耐久度（>10¹⁵ 次）使其适合写密集型负载。目前每比特面积是 SRAM 的 2–4 倍，限制了其与 SRAM 缓存的竞争力。"
        />
        <TechCard
          name="PCM（相变存储器）"
          mechanism="GeSbTe 非晶态 ↔ 晶态相变"
          readSpeed="~50–100 ns"
          writeSpeed="~50–500 ns"
          endurance="10⁷–10⁸"
          retention=">10 年（85°C 下）"
          nonVol="是"
          status="量产（Optane 已于 2022 年停产）"
          color="#06b6d4"
          products="Intel Optane（3D XPoint，2022 年停产）、IBM PCM 研究"
          desc="硫族化物合金（GeSbTe）通过电流产生的热量在非晶态（高阻）和晶态（低阻）之间切换。SET（晶化）需要在中等温度下较长时间加热；RESET（非晶化）需要短暂高功率脉冲后快速淬火。Intel Optane DIMM 以 DIMM 形态将 PCM 用作存储级内存（SCM）层——比 DRAM 慢（~300 ns），但非易失且密度更高。Intel 因市场接受度有限于 2022 年停产 Optane，但 SCM 作为 DRAM+SSD 混合存储层的技术理念仍具参考价值。"
        />
      </div>

      <h2>NAND Flash：存储的中坚力量</h2>
      <p>
        NAND Flash 并非 DRAM——它是非易失性存储介质，而非主存。但作为 NVMe SSD 的存储介质，
        它在内存层次结构中不可或缺。NAND 通过提高每单元位数和垂直堆叠更多层（3D NAND）来持续扩容：
      </p>

      <NANDEvolutionCard />

      <p>
        现代 3D NAND 垂直堆叠 176–232 层存储单元（三星 V-NAND 第八代：236 层）。
        每层是约 128 个单元组成的 NAND 串。垂直串在顶部和底部各共享一个选择晶体管，
        因此增加层数几乎不增加额外面积——3D 正是 NAND 在平面单元尺寸受限后继续扩展的方式。
      </p>

      <h2>SRAM 缩放面临的挑战</h2>
      <p>
        CPU 缓存使用的 SRAM（6T 单元）同样陷入困境。在 5 nm 及以下节点，位单元面积改善几乎停滞——
        台积电 3nm 比 5nm 的 SRAM 位单元面积仅缩小约 5%。原因在于 6T 单元的所有 6 个晶体管
        都需要最小宽度，而随着晶体管缩小，SRAM 单元的电压裕度不断退化。
      </p>
      <p>
        应对方案：<strong>AMD 3D V-Cache</strong>（通过混合键合在 CPU 裸片上叠加额外的 SRAM 裸片，
        新增 64–192 MB L3 缓存），以及研究中的
        <strong>STT-MRAM 替代 SRAM</strong> 用于末级缓存（Everspin、台积电路线图项目）。
        随着 SRAM 缩放放缓，MRAM 的密度劣势在先进节点上将逐渐收窄。
      </p>

      <h2>CXL：内存解聚</h2>
      <p>
        <strong>CXL（Compute Express Link）</strong>是基于 PCIe 5.0/6.0 的缓存一致性互连协议。
        CXL.mem 允许 CPU 通过 PCIe 访问外部 DRAM 刀片，就如同访问本地内存一样——
        同一虚拟地址空间，缓存一致。这实现了<strong>内存解聚</strong>：
        一组 DRAM 资源可在多台服务器之间共享。
      </p>

      <CXLDiagram />

      <p>
        CXL 延迟（~180–300 ns）比本地 DDR5 高 2–4 倍，但容量和成本优势显著。
        服务器可通过挂载 CXL DRAM 扩展模块突破自身 DIMM 插槽上限——
        为内存数据库、大型语言模型推理和内存密集型分析提供 1–10 TB 的可寻址存储空间。
      </p>
      <p>
        CXL 3.0（基于 PCIe 6.0）支持多主机 Fabric——多台主机同时共享同一 CXL 内存池，
        并在主机间保持缓存一致性。这使 CXL 成为云端内存即服务的平台：
        机架内的 DRAM 刀片可按虚拟机粒度按需分配。
      </p>

      <h2>异构内存的未来</h2>
      <p>
        2025 年以后的内存层次结构不再是每层只有一种技术——而是根据工作负载选择的
        <strong>异构技术栈</strong>：
      </p>
      <ul>
        <li><strong>片上 SRAM / eMRAM</strong> → 末级缓存（3–512 MB）</li>
        <li><strong>HBM3E / HBM4</strong> → AI 训练带宽（每加速器 TB/s 级）</li>
        <li><strong>DDR5 / LPDDR5X</strong> → 主存容量（32–512 GB）</li>
        <li><strong>CXL DRAM</strong> → 内存容量扩展（1–10 TB）</li>
        <li><strong>PCIe NVMe（TLC/QLC 3D NAND）</strong> → 高速存储（1–64 TB）</li>
        <li><strong>QLC / PLC NAND</strong> → 冷数据存储（100 TB+）</li>
      </ul>
      <p>
        软件和操作系统内存管理正在向自动分层演进——将热数据放入快速层，
        冷数据放入慢速层，并随访问模式变化透明迁移。这是系统研究的前沿阵地。
      </p>

      {/* Completion card */}
      <div className="mt-8 rounded-xl p-6 bg-gradient-to-br from-dram-blue/10 to-dram-green/10 border border-dram-blue/30 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <h3 className="text-xl font-bold text-dram-text mb-2">第一级完成！</h3>
        <p className="text-dram-muted text-sm mb-4">
          从 1T1C 存储单元到 HBM3 再到新兴非易失性存储器——你现在已经对现代内存的工作原理
          有了扎实的全面认识。继续进入第二级，深入学习工程细节。
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          {lessonsZh.map((l) => (
            <span key={l.id} className="px-2 py-1 rounded-full bg-dram-surface text-dram-muted border border-dram-border">
              {l.icon} {l.title}
            </span>
          ))}
        </div>
      </div>

      <LessonNav lessonId={11} lessons={lessonsZh} onComplete={() => markComplete(11)} />
    </div>
  )
}
