import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import HBMStackViz from '../../visualizations/HBMStackViz'
import { lessonsZh } from '../../data/lessons.zh'

function HBMGenerationTable() {
  const gens = [
    { gen: 'HBM1', year: '2013（标准）/ 2015（产品）', bw: '128 GB/s/堆栈', capacity: '1 GB', dies: '4', bus: '1024 位', vdd: '1.2V', note: 'JEDEC 2013 年标准化；首款产品 AMD Fury X（2015 年 6 月）' },
    { gen: 'HBM2', year: '2016', bw: '256 GB/s/堆栈', capacity: '4–8 GB', dies: '4–8', bus: '1024 位', vdd: '1.2V', note: 'NVIDIA V100、AMD Instinct MI25' },
    { gen: 'HBM2E', year: '2020', bw: '460 GB/s/堆栈', capacity: '8–16 GB', dies: '8', bus: '1024 位', vdd: '1.2V', note: 'NVIDIA A100、AMD MI100（3.2 Gbps/引脚时最高 1.6 TB/s）' },
    { gen: 'HBM3', year: '2022', bw: '819 GB/s/堆栈', capacity: '24 GB', dies: '12', bus: '1024 位', vdd: '1.1V', note: 'NVIDIA H100、AMD MI300 — 6.4 Gbps/引脚' },
    { gen: 'HBM3E', year: '2024', bw: '1.2 TB/s/堆栈', capacity: '36–64 GB', dies: '16', bus: '1024 位', vdd: '1.1V', note: 'NVIDIA H200、AMD MI300X — 9.6 Gbps/引脚' },
    { gen: 'HBM4（规划中）', year: '2025+', bw: '2+ TB/s/堆栈', capacity: '64–128 GB', dies: '16+', bus: '2048 位', vdd: '1.0V', note: '混合键合（无微焊球）、可选单片 Base Die 方案' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">代次</th>
            <th className="text-left p-3 text-dram-muted font-semibold">年份</th>
            <th className="text-left p-3 text-dram-muted font-semibold">带宽/堆栈</th>
            <th className="text-left p-3 text-dram-muted font-semibold">容量</th>
            <th className="text-left p-3 text-dram-muted font-semibold">芯片数</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">典型应用</th>
          </tr>
        </thead>
        <tbody>
          {gens.map((g, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-bold text-dram-blue whitespace-nowrap">{g.gen}</td>
              <td className="p-3 text-dram-muted">{g.year}</td>
              <td className="p-3 font-mono text-dram-green font-bold">{g.bw}</td>
              <td className="p-3 font-mono text-dram-amber">{g.capacity}</td>
              <td className="p-3 font-mono text-dram-muted">{g.dies}</td>
              <td className="p-3 text-dram-muted hidden md:table-cell">{g.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PackageDiagram() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">
        2.5D 封装：GPU + HBM 共置于硅转接板
      </h3>
      <svg width="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
        {/* PCB / substrate */}
        <rect x="0" y="160" width="500" height="40" rx="4" fill="#0f1e2e" stroke="#334155" strokeWidth="1.5"/>
        <text x="250" y="184" textAnchor="middle" fill="#64748b" fontSize="11">PCB / 有机基板</text>

        {/* Silicon interposer */}
        <rect x="20" y="130" width="460" height="34" rx="4" fill="#1a2744" stroke="#3b82f6" strokeWidth="1.5"/>
        <text x="250" y="151" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">硅转接板（无源布线层）</text>

        {/* GPU die */}
        <rect x="150" y="60" width="200" height="70" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
        <text x="250" y="93" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="bold">GPU / AI 加速器</text>
        <text x="250" y="111" textAnchor="middle" fill="#64748b" fontSize="10">逻辑裸片（TSMC 4N / 5nm）</text>

        {/* HBM stacks */}
        {[[30, 70], [390, 70]].map(([x, y], idx) => (
          <g key={idx}>
            {[0, 1, 2].map(j => (
              <rect key={j} x={x} y={y - j * 14} width={80} height={13} rx={2}
                fill={j === 0 ? '#163820' : '#1a2744'}
                stroke={j === 0 ? '#22c55e' : '#3b82f6'}
                strokeWidth={1}
              />
            ))}
            <text x={x + 40} y={y + 10} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight="bold">HBM3</text>
            <text x={x + 40} y={y + 22} textAnchor="middle" fill="#64748b" fontSize={8}>12 颗 DRAM 裸片</text>
            <text x={x + 40} y={y + 33} textAnchor="middle" fill="#64748b" fontSize={8}>+ 逻辑 Base Die</text>
            {/* TSV indication */}
            {[0,1,2,3].map(k => (
              <line key={k} x1={x + 15 + k * 15} y1={y + 13} x2={x + 15 + k * 15} y2={130}
                stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.7}/>
            ))}
          </g>
        ))}
        <text x="55" y="155" textAnchor="middle" fill="#f59e0b" fontSize={8}>TSV + 微焊球</text>
        <text x="425" y="155" textAnchor="middle" fill="#f59e0b" fontSize={8}>TSV + 微焊球</text>
        {/* BGA balls */}
        {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460].map(x => (
          <circle key={x} cx={x} cy={167} r={5} fill="#334155" stroke="#475569" strokeWidth={1}/>
        ))}
        <text x="250" y="118" textAnchor="middle" fill="#64748b" fontSize={8}>凸块连接至转接板</text>
      </svg>
      <p className="text-xs text-dram-muted mt-3">
        GPU 裸片和 HBM 堆栈共同封装在硅转接板上，转接板提供两者之间高密度布线（线宽/间距 2–5 µm）。
        转接板本身通过标准 BGA 焊球连接到 PCB。这就是"2.5D"——各裸片并排放置于转接板上，
        而非直接垂直堆叠。
      </p>
    </div>
  )
}

function TSVExplainer() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">硅通孔（TSV）— 关键尺寸</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {[
          { label: '直径', value: '5–10 µm', note: '由 Bosch DRIE 工艺刻蚀' },
          { label: '深度', value: '30–50 µm', note: '贯穿减薄后的裸片' },
          { label: '节距', value: '40–60 µm', note: '中心间距' },
          { label: '每堆栈数量', value: '~40,000', note: 'HBM3 单堆栈估算值' },
        ].map((item) => (
          <div key={item.label} className="bg-dram-bg rounded-lg p-3 text-center">
            <div className="text-xs text-dram-muted">{item.label}</div>
            <div className="text-dram-amber font-bold font-mono text-sm mt-1">{item.value}</div>
            <div className="text-xs text-dram-muted mt-1">{item.note}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted">
        TSV 使堆栈内各 DRAM 裸片之间可以实现 1024 位总线宽度——这在 PCB 上用焊球连接是物理上不可能实现的。
        极短的连接距离（µm 级 vs cm 级）也意味着 TSV 互连的寄生电容比 PCB 走线低约 100 倍，
        每比特传输所需功耗大幅降低。
      </p>
    </div>
  )
}

function MicrobumpVsHybridBonding() {
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">微焊球 vs 混合键合</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: '微焊球（HBM1–HBM3E）',
            pitch: '节距约 55 µm',
            color: '#f59e0b',
            desc: '微型焊球将 DRAM 裸片连接到逻辑 Base Die。焊球尺寸限制了连接密度。在 55 µm 节距下，1024 位总线需要约 1 mm² 的焊球面积。',
            pros: '量产工艺成熟，可返工',
            cons: '节距受限 → 带宽密度受限',
          },
          {
            name: '混合键合（HBM4+）',
            pitch: '节距约 1–10 µm',
            color: '#22c55e',
            desc: '相邻裸片上的铜焊盘直接金属-金属键合，无需焊料。裸片表面经原子级抛光后在热压下直接键合。密度是微焊球的 10–50 倍。',
            pros: '密度大幅提升、电阻更低、电感更小',
            cons: '对表面处理要求极高，量产良率难度大',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-lg p-3" style={{ border: `1px solid ${item.color}33`, backgroundColor: item.color + '08' }}>
            <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.name}</div>
            <div className="text-xs font-mono text-dram-muted mb-2">{item.pitch}</div>
            <div className="text-xs text-dram-muted mb-2">{item.desc}</div>
            <div className="text-xs text-dram-green"><strong className="text-dram-text">优点：</strong> {item.pros}</div>
            <div className="text-xs text-dram-amber mt-1"><strong className="text-dram-text">缺点：</strong> {item.cons}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function L10() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">模块 10</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">HBM 与 3D DRAM</h1>
        <p className="text-dram-muted mt-2">垂直堆叠芯片，实现 TB/s 级带宽</p>
      </div>

      <HBMStackViz />

      <h2>HBM 诞生的原因：引脚数量的天花板</h2>
      <p>
        GDDR6 最高 512 GB/s 的带宽来自 8 颗各 32 位总线的芯片——共 256 个数据引脚，运行在 16 Gbps。
        若想带宽翻倍，要么增加引脚数（更多芯片、更宽总线），要么提升速率（信号完整性更难保证）。
        两条路都很快触碰到极限：PCB 布线空间告罄，而在极高速率下，PCB 走线上的信号完整性
        需要昂贵的均衡电路和严格的阻抗控制。
      </p>
      <p>
        HBM 的解法是将存储裸片移到逻辑裸片的<em>上方</em>（或旁边），通过贯穿硅片的铜孔——
        <strong>硅通孔（TSV）</strong>——以 1024 位宽的内部总线相连。
        以 1024 位宽度、6.4 Gbps/引脚运行，HBM3 单堆栈可达 819 GB/s，
        而对外的 PCB 连接数远少于任何等效 GDDR 方案。
      </p>

      <h2>HBM 各代演进</h2>
      <HBMGenerationTable />

      <h2>硅通孔（TSV）</h2>
      <TSVExplainer />

      <p>
        TSV 制造工艺需要将 DRAM 裸片减薄（标准厚度约 700 µm，HBM 裸片研磨至 30–50 µm），
        用深反应离子刻蚀（DRIE）打孔，沉积绝缘衬层，再填充铜。整个堆栈组装在晶圆级工艺中
        完成，之后才切割成单颗芯片。
      </p>

      <h2>2.5D 封装：GPU + HBM 共置于转接板</h2>
      <PackageDiagram />

      <p>
        硅转接板是一块无源芯片（无晶体管，仅有布线），采用标准 CMOS 光刻工艺在 300 mm 晶圆上制造。
        它可以有 4–8 层金属布线，线宽/间距 2–5 µm——比 PCB 的 50–100 µm 精细 10 倍。
        这使 GPU 裸片与各 HBM 堆栈之间能在短距离内传输数千路信号，且无信号完整性问题。
      </p>
      <p>
        硅转接板的成本相当可观（它是一大块优质硅片），这也是 HBM 封装价格远高于 GDDR6 的原因。
        配备 5 颗 HBM3 堆栈的 H100 GPU 模组发布时售价约 3 万美元——而带有相近内存带宽的 GDDR6
        显卡仅售 500–1500 美元。
      </p>

      <h2>微焊球与混合键合</h2>
      <MicrobumpVsHybridBonding />

      <h2>存储内计算（PIM）</h2>
      <p>
        将数据从内存搬到处理器代价高昂——内存带宽有限，每次数据传输都消耗能量。
        <strong>PIM</strong>（Processing-In-Memory）在 HBM 堆栈内部直接添加计算单元，
        让数据在原地完成处理。
      </p>
      <ul>
        <li><strong>SK Hynix AiM（存储内加速器）</strong>：在 HBM 逻辑 Base Die 上
            集成 SIMD 乘累加单元，用于三星 Flashbolt 及 SK Hynix 自有 AI 服务器产品。
            堆栈内 MAC 吞吐量约 1 TOPS，对于卷积密集型 ML 核函数可完全绕过内存总线。</li>
        <li><strong>三星 HBM-PIM</strong>：在每个 Bank 的感应放大器区域集成可编程 FP16 计算单元，
            每颗裸片拥有专用 PIM 执行引擎，通过新定义的 JEDEC 命令访问。</li>
        <li><strong>UPMEM</strong>：非 HBM 方案——基于 DIMM 的设计，每颗 DRAM 芯片内集成
            24 核 RISC 处理器。对于访问模式与并行结构匹配的数据库扫描和基因组测序任务效果显著。</li>
      </ul>
      <p>
        PIM 面临的挑战在于它要求全新的编程模型：程序员必须清楚数据位于哪个物理 Bank，
        并据此调度 PIM 操作。它最适合高度并行、内存密集、算术运算简单的核函数。
      </p>

      <h2>HBM4 及未来展望</h2>
      <p>
        HBM4（规划于 2025–2026 年）通过引入 1–10 µm 节距的<strong>混合键合</strong>
        （取代 55 µm 微焊球），将每堆栈总线宽度翻倍至 2048 位。
        在约 9.6 Gbps/引脚下，单堆栈带宽超过 2 TB/s。
        容量目标为每堆栈 64–128 GB，采用 16 颗裸片 + 逻辑 Base Die 的结构。
      </p>
      <p>
        SK Hynix 还宣布了一个选项：将 HBM4 逻辑 Base Die 改用台积电先进节点（3nm 级）制造，
        而非沿用自有 DRAM 节点。这使 Base Die 能够集成更复杂的内存控制器和内置机器学习加速能力——
        进一步模糊计算与存储的边界。
      </p>

      <LessonNav lessonId={10} lessons={lessonsZh} onComplete={() => markComplete(10)} />
    </div>
  )
}
