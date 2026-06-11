import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import DecoderViz from '../../../visualizations/level2/DecoderViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_03() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · Module 03 · Cluster A: Circuit Design</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">行列译码器设计</h1>
        <p className="text-dram-muted mt-2">基于 NAND 的行译码、地址预译码以及列选通门多路选择</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">与 Level 1 的联系：</strong>在第 5 模块（读操作）中，你看到 RAS（行地址选通）选择一行，CAS（列地址选通）选择一列。译码器就是将 n 位地址转换为单一有效字线或位线的电路。
      </div>

      <DecoderViz lang="zh" />

      <h2>基于 NAND 的行译码器</h2>
      <p>
        拥有 2^n 行的 DRAM 需要 n 位地址来选择 2^n 条字线中的一条。最简单的方案是<strong>全译码器</strong>：每条字线对应一个 NAND 门，每个门的输入连接到特定地址位或其补码。只有当所有输入与编码行号匹配时，该门才触发（输出为低，经字线驱动器反相后变为高电平）。
      </p>
      <p>
        对于 8192 行（2^13），这意味着需要 8192 个各有 13 个输入的 NAND 门。但 13 输入 NAND 门速度很慢（高扇入 → 长晶体管串联栈）。解决方案是<strong>预译码</strong>。
      </p>

      <h2>地址预译码</h2>
      <p>
        预译码将 n 位地址拆分为两组或三组，对每组独立译码，再用最终 NAND 将结果合并：
      </p>
      <ul>
        <li>将 13 位拆分为 5+4+4 三组 → 生成 32 + 16 + 16 = 64 条预译码线</li>
        <li>每条最终字线的 NAND 门只需 3 个输入（每组预译码各取一路）</li>
        <li>一个 13 输入 NAND 被替换为三个 5/4 输入译码器加一个 3 输入 NAND</li>
      </ul>
      <p>
        时序收益显著：在同一工艺节点下，3 输入 NAND 的速度约为 13 输入 NAND 的 3 倍。预译码缓冲器带来的面积开销相对于速度提升而言十分有限。
      </p>

      <div className="rounded-lg p-4 bg-dram-bg border border-dram-border text-xs font-mono my-4 space-y-1">
        <div className="text-dram-blue">// 8 行（3 位地址）的预译码示例</div>
        <div>A[2:1] → 4 路：A2·A1, A2·Ā1, Ā2·A1, Ā2·Ā1</div>
        <div>A[0]   → 2 路：A0, Ā0</div>
        <div>Row k  → NAND(predecode_21[k&gt;&gt;1], predecode_0[k&amp;1])</div>
      </div>

      <h2>列译码器：选通门多路选择</h2>
      <p>
        行激活后，该行中的 8192 条以上位线均驱动各自的灵敏放大器。列地址通过<strong>列选通门阵列</strong>从中选取一个或多个灵敏放大器输出：
      </p>
      <ul>
        <li>列译码器将列地址转换为独热（one-hot）选通信号</li>
        <li>每列灵敏放大器的输出经过一个 NMOS 选通晶体管</li>
        <li>只有被选中的选通晶体管导通，将数据路由至 I/O 锁存器</li>
        <li>DDR5 的 16n 预取意味着每个芯片同时译码 16 个列地址以输出 16 位数据</li>
      </ul>

      <h2>热载流子应力与译码器可靠性</h2>
      <p>
        字线驱动器承受着 DRAM 中最高的电压（在核心电压低于 Vdd 的工艺节点上 Vpp ≈ 2.5–3 V）。这会在字线驱动器 NMOS 的漏端产生<strong>热载流子注入（HCI）</strong>应力，经过数十亿次激活操作后逐渐使阈值电压发生漂移。
      </p>
      <p>
        可靠性工程师使用 <strong>NBTI（负偏置温度不稳定性）</strong>和 HCI 模型，确保器件在额定电压和温度下满足 10 年使用寿命要求。主要缓解措施包括：限制 Vpp 幅度、在驱动器中使用较长沟道的 PMOS，以及在测试阶段进行可靠性筛查。
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-2 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>译码器类型</div><div>权衡分析</div>
        </div>
        {[
          ['NAND decoder', '开关速度快、面积小、负逻辑输出（反相输出需驱动器）'],
          ['NOR decoder', '正逻辑输出，但速度较慢（PMOS 串联栈 → 阻抗较高）'],
          ['Predecoded NAND', '面积×速度最优：3 输入 NAND 对比 13 输入，代价是预译码缓冲器'],
        ].map(([type, tradeoff]) => (
          <div key={type} className="grid grid-cols-2 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{type}</div>
            <div className="text-dram-muted">{tradeoff}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={3} onComplete={() => markComplete(3)} lessons={lessonsL2Zh} />
    </div>
  )
}
