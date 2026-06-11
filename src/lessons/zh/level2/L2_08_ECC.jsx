import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import ECCSim from '../../../visualizations/level2/ECCSim'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_08() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 08 模块 · 模块组 C：可靠性与安全性</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">ECC 架构</h1>
        <p className="text-dram-muted mt-2">SECDED 汉明码、奇偶校验矩阵、Chipkill，以及 DDR5 片上 ECC</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在第 9 模块（现代 DRAM）中，你了解到
        DDR5 内置了片上 ECC。本节将从头构建汉明码：需要多少个校验位、
        综合征（Syndrome）如何定位错误，以及为什么 Chipkill 需要 ×4 位宽的芯片。
      </div>

      <ECCSim />

      <h2>为什么 64 位数据需要 8 个校验位？</h2>
      <p>
        要为 n 位数据构建 <strong>SECDED（单比特纠错、双比特检错）</strong>编码，
        需要 r 个校验位满足：
      </p>
      <p>
        <code>2^r ≥ n + r + 1</code>
      </p>
      <p>
        当 n = 64 时：取 r = 7，得 2^7 = 128 ≥ 64 + 7 + 1 = 72 ✓。
        但 SECDED 还需要一个整体奇偶位用于检测（而非纠正）双比特错误，
        因此 r = 7 + 1 = <strong>8 个校验位</strong>。
        这正是 72 位 DIMM 总线的由来（64 位数据 + 8 位 ECC）。
      </p>

      <h2>汉明码的构造方法</h2>
      <p>
        校验位放置在 2 的幂次位置（1、2、4、8、16、32、64）。每个校验位 P_i
        负责校验所有二进制表示中第 i 位为 1 的比特位置：
      </p>
      <ul>
        <li>P_0（位置 1）覆盖位置 1、3、5、7、9、11、……（位置的第 0 位为 1）</li>
        <li>P_1（位置 2）覆盖位置 2、3、6、7、10、11、……（位置的第 1 位为 1）</li>
        <li>P_2（位置 4）覆盖位置 4–7、12–15、20–23、……（位置的第 2 位为 1）</li>
        <li>……依此类推</li>
      </ul>
      <p>
        每个 P_i 的取值使其所覆盖的全部比特（包括 P_i 自身）的 XOR 结果为零。
        接收端重新计算所有校验，得到<strong>综合征（Syndrome）</strong>。
        综合征各位组成的二进制数直接给出出错比特的位置。
      </p>
      <p>
        示例：综合征 = 0b0001011 = 十进制 11 → 第 11 位出错 → 将其翻转即可纠正。
      </p>

      <h2>Chipkill：容忍整颗芯片失效</h2>
      <p>
        标准 SECDED 每 72 位字只能纠正 1 个比特错误。但如果整颗 DRAM 芯片失效
        （例如因电涌或线路卡死），该芯片在这个字中贡献的全部 8 位将同时出错。
        SECDED 无法纠正 8 个同时发生的错误。
      </p>
      <p>
        <strong>Chipkill</strong> 采用<strong>×4 位宽的 DRAM 芯片</strong>（每颗芯片 4 个数据引脚）
        来解决这一问题。18 颗芯片 × 4 位 = 72 位，任意一颗芯片失效时，
        一个字中只有 4 位同时出错。更强的 ECC 编码
        （通常是基于 4 位符号的 Reed-Solomon 码或扩展汉明码）能够检测并纠正整颗芯片的失效。
      </p>
      <p>
        Chipkill 是服务器 DIMM（RDIMM、LRDIMM）的标准配置，也是大规模数据中心部署的强制要求。
        消费级 DIMM 通常使用标准 SECDED（×8 芯片），无法承受整颗芯片失效的情况。
      </p>

      <h2>DDR5 片上 ECC</h2>
      <p>
        DDR5 强制要求片上 ECC（ODECC）：每颗 DRAM 芯片在内部对其 128 位数据通路使用 SECDED 编码。
        数据在到达芯片 I/O 引脚之前已完成纠错，可以防范制造相关的存储单元缺陷
        以及芯片内部的软错误。
      </p>
      <p>
        ODECC 对内存控制器完全透明，且与 DIMM 级别的 ECC 叠加使用（而非替代）。
        两者组合提供了两层独立的纠错保护。
      </p>

      <h2>内存扫描（Memory Scrubbing）</h2>
      <p>
        即使有 ECC，未纠正的错误仍会随着存储单元缓慢漏电或宇宙射线事件引发的软错误而不断积累。
        <strong>内存扫描</strong>是一种后台进程，定期读取每个内存地址，纠正所有单比特错误，
        并将纠正后的数据回写。JEDEC 建议服务器环境每 <strong>24–72 小时</strong>执行一次扫描。
        扫描带来的带宽开销通常低于 &lt;0.1%。
      </p>

      <LessonNav lessonId={8} onComplete={() => markComplete(8)} lessons={lessonsL2Zh} />
    </div>
  )
}
