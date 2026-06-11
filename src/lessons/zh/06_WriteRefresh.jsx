import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import DRAMCellViz from '../../visualizations/DRAMCellViz'
import DRAMArraySim from '../../visualizations/DRAMArraySim'
import { lessonsZh } from '../../data/lessons.zh'

function WriteVsReadDiagram() {
  const phases = [
    {
      title: '写操作',
      color: '#22c55e',
      steps: [
        { label: 'PRE', desc: '位线预充电至 Vdd/2（与读操作相同）' },
        { label: 'ACT', desc: '字线升高，行激活（与读操作相同）' },
        { label: 'WR', desc: '写驱动器强制将 BL 驱动至 Vdd（写 1）或 GND（写 0）' },
        { label: 'tWR 等待', desc: '写驱动器保持 BL 至少 15 ns（tWR），确保电容充/放电完成' },
        { label: 'PRE', desc: '等待 tWR 后：字线关闭，BL 预充电' },
      ],
    },
    {
      title: '读操作',
      color: '#3b82f6',
      steps: [
        { label: 'PRE', desc: '位线预充电至 Vdd/2' },
        { label: 'ACT', desc: '字线升高，BL 悬空——存储单元拉动 BL' },
        { label: 'RD', desc: '灵敏放大器检测 ΔV ≈ ±55 mV，放大至满摆幅' },
        { label: 'DATA', desc: '列选中，数据通过 DQ 突发输出（64 字节，BL8）' },
        { label: 'PRE', desc: '等待 tRAS 后：字线关闭，BL 预充电' },
      ],
    },
  ]
  return (
    <div className="bg-dram-surface rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-4">写操作 vs 读操作——核心区别</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((p) => (
          <div key={p.title} className="rounded-lg p-3" style={{ border: `1px solid ${p.color}33`, backgroundColor: p.color + '08' }}>
            <div className="font-bold text-sm mb-3" style={{ color: p.color }}>{p.title}</div>
            <div className="space-y-2">
              {p.steps.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono w-20 flex-shrink-0 font-bold" style={{ color: p.color }}>{s.label}</span>
                  <span className="text-dram-muted">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-dram-muted mt-3">
        写操作中，位线是<strong>主动驱动器</strong>——它强制将电容充电至目标电压。
        读操作中，位线处于<strong>悬空状态</strong>——被动接受来自电容的电荷。
        这种方向上的反转是两者的根本区别。
      </p>
    </div>
  )
}

function RefreshMathCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-dram-border mb-6">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-3">刷新计算</h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-dram-muted">保持时间（室温）：</span>
          <span className="text-dram-green">64 ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">每 Bank 行数：</span>
          <span className="text-dram-green">8,192（DDR4 典型值）</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">所需刷新间隔（tREFI）：</span>
          <span className="text-dram-amber font-bold">64 ms ÷ 8192 = 7.8 µs</span>
        </div>
        <div className="border-t border-dram-border pt-2 mt-2 flex justify-between">
          <span className="text-dram-muted">刷新周期时间（tRFC，DDR4-8Gb）：</span>
          <span className="text-dram-blue">350 ns</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">tRFC，DDR5-32Gb：</span>
          <span className="text-dram-blue">550 ns（需刷新更多行）</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dram-muted">有效开销（全 Bank 同步刷新）：</span>
          <span className="text-dram-amber">350 ns ÷ 7800 ns ≈ 4.5%</span>
        </div>
      </div>
    </div>
  )
}

function RetentionTempTable() {
  const rows = [
    { temp: '25°C（室温）', retention: '~64 ms', note: '标准规格' },
    { temp: '55°C（偏热）', retention: '~8 ms', note: '每升高 10°C 漏电加倍，共 3 次加倍' },
    { temp: '85°C（结温热态）', retention: '~1 ms', note: '从 25°C 起共 6 次加倍' },
    { temp: '95°C（过温）', retention: '<0.5 ms', note: '即使执行刷新也存在数据丢失风险' },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-dram-border mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dram-surface">
            <th className="text-left p-3 text-dram-muted font-semibold">温度</th>
            <th className="text-left p-3 text-dram-muted font-semibold">典型保持时间</th>
            <th className="text-left p-3 text-dram-muted font-semibold hidden md:table-cell">备注</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-dram-border ${i % 2 === 0 ? 'bg-dram-bg/50' : ''}`}>
              <td className="p-3 font-mono text-dram-amber">{r.temp}</td>
              <td className="p-3 font-bold text-dram-green">{r.retention}</td>
              <td className="p-3 text-dram-muted text-xs hidden md:table-cell">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function L06() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 06</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">写入与刷新</h1>
        <p className="text-dram-muted mt-2">将数据写入存储单元，并通过定期刷新维持电荷</p>
      </div>

      <h2>写操作原理</h2>
      <p>
        写操作的起始与读操作完全相同：预充电 → 行激活。但在 CAS 步骤时，
        不再让灵敏放大器悬空检测，而是由<strong>写驱动器</strong>接管，
        主动将位线强制驱动至目标电压。
      </p>

      <WriteVsReadDiagram />

      <h3>写驱动器：主动驱动 vs 悬空位线</h3>
      <p>
        这是最重要的区别。读操作时位线处于悬空状态——它根据存储电容与位线电容之间的
        电荷共享找到平衡点。写操作时，写驱动器将位线钳位至 Vdd（写"1"）或 GND
        （写"0"），无论存储单元当前保存什么值。
      </p>
      <p>
        字线保持高电平，写驱动器强力驱动 BL，电容通过导通的晶体管充电或放电。
        写驱动器必须保持位线至少 <strong>tWR = 15 ns</strong>（写恢复时间），
        确保电容已完全稳定到新值。在 tWR 到期前发送 PRE 命令会在电容充电完成前
        关闭字线，导致部分写入——产生数据损坏。
      </p>

      <h3>写数据屏蔽（DM / DBI）</h3>
      <p>
        DDR3/4/5 支持只写入突发中的特定字节。<strong>DM</strong>（数据屏蔽）
        引脚与数据同步采样，对被屏蔽的字节抑制写驱动器——这些存储单元不被写入。
        DDR4/5 可以用 <strong>DBI</strong>（数据总线反转）替代 DM：如果一个字节
        中超过 4 位需要被驱动为"0"（耗电更多），DBI 将该字节取反并置位标志位，
        从而将开关活动和功耗降低最多 25%。
      </p>

      <h3>写 CAS 延迟（CWL）</h3>
      <p>
        写操作有其专属延迟：<strong>CWL</strong>（CAS 写延迟），始终小于或等于 CL。
        对于 DDR4-3200 CL22，CWL 通常为 16 个周期。较低的 CWL 意味着写数据必须在
        READ 命令之前更早地置于总线上，以确保数据相对于 CAS-WRITE 命令在正确时刻
        到达 DRAM。
      </p>

      <h2>存储单元漏电——电荷为何消失</h2>
      <p>
        即使字线为低电平（晶体管关断），存储单元也并非完全隔离。三种漏电机制
        持续耗尽电荷：
      </p>
      <ul>
        <li><strong>亚阈值漏电</strong>：NMOS 晶体管即使在阈值以下也会流过微小电流。
            在 65 nm 及以下工艺中，这是主要漏电路径——约 100–200 fA（飞安培）从
            电容经晶体管漏极流向位线（在 Vdd/2 处）。</li>
        <li><strong>栅极氧化层隧穿</strong>：超薄栅极氧化层（&lt;2 nm）中，电子可以
            量子力学地隧穿通过 SiO₂。在典型工作温度下，其影响小于亚阈值漏电。</li>
        <li><strong>结漏电</strong>：电容底板与衬底形成 p-n 结，高温下反向偏置
            漏电会有所贡献。</li>
      </ul>
      <p>
        综合这些机制，一个存储单元的电荷会在约 <strong>25°C 下的 64 ms</strong> 内
        从满量消耗至低于 50% 感测阈值。所有 DRAM 必须在此时间窗口内完成刷新。
      </p>

      <h2>温度与保持时间</h2>
      <p>
        亚阈值漏电大约每升高 10°C 翻倍（阿伦尼乌斯关系），这会在温度较高时
        显著缩短保持时间：
      </p>

      <RetentionTempTable />

      <p>
        JEDEC 通过两种刷新规格来应对此问题：标准规格（在结温最高 85°C 时 64 ms）
        和<strong>高温自刷新（HTSR）</strong>——当 LPDDR 设备的片上温度传感器
        读数超过 85°C 时，激活更快的 32 ms 刷新速率。服务器 DRAM 有时在高负载
        情况下使用 <strong>2× 刷新速率模式</strong>（tREFI = 3.9 µs）。
      </p>

      <DRAMCellViz />

      <h2>刷新机制</h2>
      <p>
        刷新命令在电气上与完整的行读操作完全相同——但没有列选择，也没有数据输出。
        每个 Bank 的操作序列如下：
      </p>
      <ol>
        <li>内存控制器（或 DRAM 内部的自动刷新计数器）发送 <strong>REF</strong> 命令。</li>
        <li>DRAM 内部的<strong>刷新行计数器</strong>自动选择下一行进行刷新（循环遍历所有 8,192 行）。</li>
        <li>该行字线升高，存储单元向位线电荷共享。</li>
        <li>灵敏放大器触发，将该行所有存储单元恢复至满电荷。</li>
        <li>字线降低，位线预充电，计数器递增至下一行。</li>
      </ol>
      <p>
        控制器提供时序（每隔 tREFI = 7.8 µs 发送一次 REF），但不指定具体行——
        DRAM 在内部自行管理。这称为<strong>自动刷新（AR）</strong>。
        另外，<strong>自刷新（SR）</strong>模式允许 DRAM 运行自己的内部振荡器并在
        无控制器介入的情况下自我刷新——用于 LPDDR 的深度休眠，以降低控制器功耗。
      </p>

      <h2>刷新计算</h2>
      <RefreshMathCard />

      <h2>全 Bank 同步刷新 vs 按 Bank 刷新</h2>
      <p>
        传统 DRAM 使用<strong>全 Bank 同步刷新</strong>：当 REF 命令到来时，
        所有 Bank 同时刷新相同的行。在 tRFC 期间（DDR5 32 Gb 最高达 550 ns），
        所有 Bank 均不可用，为 CPU 带来规律性的死区。
      </p>
      <p>
        DDR5 引入的<strong>按 Bank 刷新（PBR）</strong>允许每个 Bank 独立刷新。
        Bank 0 刷新时，Bank 1–15 仍可处理读写请求。单 Bank 的 tRFC 更短（130 ns
        对比 350 ns），因为刷新电流分散在更少的 Bank 上，但刷新频率必须相应提高。
        最终效果是大幅改善最坏情况延迟，代价是调度逻辑稍显复杂。
      </p>

      <h2>刷新管理（RFM）——RowHammer 防护</h2>
      <p>
        DDR5 新增了 <strong>RFM（刷新管理）</strong>作为 RowHammer 缓解措施。如果
        控制器对某行的激活频率异常偏高，RFM 命令会指示 DRAM 对该热行物理上相邻的
        行执行定向刷新，防止累积的干扰电荷翻转相邻存储单元的比特。RFM 独立于
        常规的 tREFI 刷新周期，仅在触发时才增加延迟。
      </p>

      <h2>使用仿真器</h2>
      <p>
        将阵列切换到<strong>写入</strong>模式，选择值 0 或 1，点击存储单元进行写入。
        观察单元值的变化。切换上方单元可视化中的<strong>模拟漏电</strong>，观察电荷
        消耗过程，然后点击<strong>刷新行</strong>恢复电荷。
      </p>

      <DRAMArraySim />

      <LessonNav lessonId={6} onComplete={() => markComplete(6)} lessons={lessonsZh} />
    </div>
  )
}
