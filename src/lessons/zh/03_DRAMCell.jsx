import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../components/LessonNav'
import DRAMCellViz from '../../visualizations/DRAMCellViz'
import DRAMCellWalkthrough from '../../visualizations/DRAMCellWalkthrough'
import { lessonsZh } from '../../data/lessons.zh'

export default function L03() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Module 03</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">DRAM 单元（1T1C）</h1>
        <p className="text-dram-muted mt-2">一个晶体管 + 一个电容器 — 读取、写入与刷新的完整工作原理</p>
      </div>

      <DRAMCellViz lang="zh" />

      <h2>1T1C 单元的结构</h2>
      <p>
        DRAM 芯片中的每一个比特都存储在一个 <strong>1T1C 单元</strong>中：
        一个 NMOS 晶体管和一个电容器。连接它的三根导线分别是：
      </p>
      <ul>
        <li><strong>字线（WL，Wordline）</strong>——连接晶体管的栅极。WL 高电平时，晶体管导通，电容器与位线相连；WL 低电平时，晶体管截止，电容器被隔离。</li>
        <li><strong>位线（BL，Bitline）</strong>——列数据线，负责将数据读入和写出单元，同一列的所有单元共享同一根位线。</li>
        <li><strong>存储电容（Cs）</strong>——约 20 飞法（fF）。一端连接晶体管漏极，另一端保持在 Vdd/2 = 0.6 V 作为参考电位。</li>
      </ul>
      <p>
        逻辑 <strong>1</strong> = 电容器充电至约 Vdd（1.2 V）；逻辑 <strong>0</strong> = 电容器放电至约 0 V。
        位线的寄生电容大得多（Cbl ≈ 200 fF），因为它连接着数百个单元、金属导线和灵敏放大器。
        这个 10:1 的电容比（Cbl/Cs）是 DRAM 几乎所有异常操作特性的根本原因。
      </p>

      <h2>逐步操作演示</h2>
      <p>
        使用下方的交互式电路图，逐步了解每个操作阶段。
        电路图实时更新——点击各阶段时，请观察电压变化、晶体管状态以及电荷流向箭头。
      </p>

      <DRAMCellWalkthrough lang="zh" />

      <h2>读操作详解</h2>

      <h3>第一步：预充电</h3>
      <p>
        每次访问前，位线由单元阵列上方的预充电电路<strong>精确充电至 Vdd/2 = 0.6 V</strong>。
        一个专用的均衡晶体管将 BL 和 BLB（互补位线）短暂短接，强制两者都达到 Vdd/2。
        WL 保持低电平，单元电容器被隔离，其中的电荷不受影响。
      </p>
      <p>
        为何选择 Vdd/2？因为灵敏放大器通过检测相对于该中间电位的<em>偏差</em>来工作，
        预充至精确的中点能最大化对称性和抗噪能力。
      </p>

      <h3>第二步：字线拉高</h3>
      <p>
        行译码器驱动字线有效。电压必须<strong>升压至 Vdd 以上</strong>（通常 Vpp ≈ 2.5–3 V），
        因为 NMOS 晶体管完全导通的条件是栅极电压比源极电压高出至少一个阈值电压（Vth ≈ 0.5 V）。
        若 WL 仅为 Vdd = 1.2 V，一旦电容器充电至 Vdd − Vth ≈ 0.7 V，晶体管便会关断，
        阻止电荷完全转移。使用 Vpp 后，晶体管始终保持完全导通。
      </p>

      <h3>第三步：电荷共享 — 微小的 ΔV</h3>
      <p>
        晶体管导通后，单元电容器与位线电容形成一个相连节点，
        电荷重新分配直至达到相同的平衡电压：
      </p>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>V_eq = (Cs × V_cap + Cbl × Vdd/2) / (Cs + Cbl)</div>
        <div className="text-dram-muted mt-2">存储"1"时：(20fF × 1.2V + 200fF × 0.6V) / 220fF ≈ 0.6545 V</div>
        <div className="text-dram-muted">存储"0"时：(20fF × 0.0V + 200fF × 0.6V) / 220fF ≈ 0.5455 V</div>
      </div>
      <p>
        位线仅偏移 <strong>ΔV ≈ ±55 mV</strong>，不到电源电压的 5%——几乎是一声耳语。
        灵敏放大器必须在热噪声、工艺偏差和相邻单元干扰的环境中可靠地检测这一微弱信号。
      </p>

      <h3>第四步：灵敏放大器触发</h3>
      <p>
        灵敏放大器（SA）是一个<strong>交叉耦合反相器锁存器</strong>，
        将 BL 和 BLB 连接到一对背靠背反相器。激活后，它像触发器一样工作：
        哪一侧的电位稍高，就被驱动至 Vdd；另一侧则被拉至 GND。
      </p>
      <p>
        SA 需要 1–2 纳秒完成判决，将 ΔV ≈ 55 mV 放大为完整的 1.2 V 摆幅。
        它必须在位线稳定至 V_eq 之后才能激活——过早激活意味着检测到的是噪声而非信号。
        最小可检测 ΔV 约为 20 mV。
      </p>

      <h3>第五步：恢复（写回）</h3>
      <p>
        SA 触发后，BL 被驱动至 Vdd（"1"）或 GND（"0"）。
        此时字线<em>仍然有效</em>，这个满摆幅电压通过晶体管反向驱入单元电容器，
        将其恢复至原始电荷。这次写回使破坏性读取变为自我修复。
      </p>
      <p>
        恢复阶段约需 15 ns（tWR——写恢复时间）。字线在电容器完全充电之前不能拉低。
      </p>

      <h3>第六步：再次预充电</h3>
      <p>
        WL 拉低，晶体管截止，位线再次预充至 Vdd/2，准备好迎接下一次访问。
        完整的读周期时间（tRC）包含上述所有阶段，DDR5 通常为 45–55 ns。
      </p>

      <h2>写操作详解</h2>
      <p>
        写操作实际上比读操作更简单，但关键区别在于：位线<strong>不是浮空的</strong>。
        写驱动器在字线脉冲开始之前和期间，主动将 BL 强制驱动到目标电压
        （写"1"为 Vdd，写"0"为 GND）。
      </p>
      <ol>
        <li><strong>BL 预充至 Vdd/2</strong>——与所有访问前的操作相同。</li>
        <li><strong>写驱动器覆盖 BL</strong>——控制器将 BL 强制驱动至 Vdd（写"1"）
            或 GND（写"0"）。与读操作不同，位线被主动驱动，而不是浮空等待电容器共享电荷。</li>
        <li><strong>WL 拉高</strong>——BL 被保持在目标电压，电容器通过晶体管充电（或放电）以匹配 BL。
            由于 BL 被主动驱动，这一过程快速且完整。</li>
        <li><strong>WL 在 tWR 后拉低</strong>——等待至少 tWR = 15 ns 以确保完整的电荷转移后，
            字线拉低，电容器以新的电荷被隔离。</li>
      </ol>
      <p>
        关键区别：读操作时 BL 浮空，单元电容器推动 BL 变化；写操作时 BL 被主动驱动，
        它推动单元电容器变化。方向相反，电荷来源互换。
      </p>

      <h2>刷新操作详解</h2>

      <h3>为何需要刷新</h3>
      <p>
        单元晶体管不是完美的开关。在截止状态下，仍有微小的亚阈值漏电流（~100–200 fA，飞安）流过。
        随着时间推移，这会不断消耗电容器上的电荷。在室温（约 25°C）下，
        一个完全充电的单元漏电到极性翻转约需 <strong>64 毫秒</strong>。
        这就是保持时间预算——每一行都必须在这个时间窗口内完成刷新。
      </p>
      <p>
        温度的影响更为显著：温度每升高约 10°C，保持时间减半。
        在 85°C（典型最坏情况结温）下，保持时间降至约 4 ms——
        这也是部分服务器 DRAM 在高负载下采用 32 ms 更快刷新间隔的原因。
      </p>

      <h3>刷新时序</h3>
      <p>
        刷新在电气上与读操作<strong>完全相同——只是没有列选择</strong>。
        内存控制器（或自刷新模式下的内部刷新计数器）发出 REF 命令。
        DRAM 内部的行计数器选出下一行，字线拉高，该行所有位线同时发生电荷共享，
        灵敏放大器触发并恢复所有单元，随后字线拉低，所有位线预充电。
      </p>
      <p>
        没有数据输出——没有列选择，没有数据总线活动。刷新完全在芯片内部完成。
        每次刷新命令恢复完整的一行（通常 1,024–2,048 个单元并行处理）。
      </p>

      <h3>刷新数学</h3>
      <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm my-4 text-dram-green">
        <div>需刷新行数：8,192（DDR4/5 典型值）</div>
        <div>保持时间上限：64 ms</div>
        <div>所需刷新间隔：tREFI = 64 ms ÷ 8,192 = 7.8 µs</div>
        <div className="text-dram-muted mt-2">≈ 每 7,800 ns 发出一次刷新命令</div>
        <div className="text-dram-muted">每次刷新耗时约 75 ns（tRFC）</div>
        <div className="text-dram-muted">刷新开销 ≈ 75/7800 ≈ 1% 的带宽</div>
      </div>
      <p>
        1% 的开销听起来很小，但它是不可避免的——在阵列被刷新占用的约 75 ns 内，
        无法响应任何内存请求。随着 DRAM 密度增加（行数增多），tRFC 增长，开销上升。
        DDR5 引入了<strong>按 Bank 刷新</strong>，允许其他 Bank 在一个 Bank 刷新时
        继续响应请求。
      </p>

      <h2>为何是 1T1C 而非更简单的方案？</h2>
      <p>
        SRAM 每比特使用 6 个晶体管：两对交叉耦合反相器（4 个晶体管）加两个访问晶体管。
        它速度快，无需刷新，且读操作无破坏性。但相比 DRAM 的 1T+1C，6T 意味着
        DRAM 每单位面积能存储约 4–6 倍的比特数。在 16 GB 或 32 GB DIMM 的规模上，
        这种密度差异至关重要。刷新和破坏性读取的复杂性，是换取密度提升的合理工程权衡。
      </p>

      <LessonNav lessonId={3} lessons={lessonsZh} onComplete={() => markComplete(3)} />
    </div>
  )
}
