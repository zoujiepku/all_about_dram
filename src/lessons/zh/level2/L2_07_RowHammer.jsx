import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import RowHammerSim from '../../../visualizations/level2/RowHammerSim'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_07() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 07 模块 · 模块组 C：可靠性与安全性</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">RowHammer 攻击</h1>
        <p className="text-dram-muted mt-2">电荷泵效应、sub-20 nm 工艺下的位翻转、TRR 绕过，以及 DDR5 RFM</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在第 6 模块（写入与刷新）中，
        你了解到 DRAM 存储单元会漏电，需要定期刷新。RowHammer 的发现揭示了：
        攻击者可以通过数百万次反复激活某一行，故意导致<em>相邻</em>行发生位翻转——
        而无需直接访问受害行的数据。
      </div>

      <RowHammerSim lang="zh" />

      <h2>RowHammer 的工作机制</h2>
      <p>
        当 DRAM 字线被激活时，NMOS 访问晶体管短暂导通，V_GS ≈ Vpp − V_cell ≈ 1.5–2 V。
        在 sub-20 nm 特征尺寸下，这会产生<strong>热载流子</strong>——即拥有足够能量穿透
        物理相邻行访问晶体管薄栅氧化层的电子。这一现象称为<strong>电荷泵效应（charge pumping）</strong>。
      </p>
      <p>
        每次激活都会向相邻行的存储节点注入微小的电荷扰动（约阿法拉级别）。
        在单个 64 ms 刷新间隔内，经过数万次乃至数十万次的反复激活后，
        这种累积扰动足以翻转受害行中的位。
      </p>
      <p>
        Kim 等人在 ISCA 2014 上发现，在普通 DDR3 DIMM 上，每个 tREFW 内
        仅需 <strong>139,000 次激活</strong>就足以触发位翻转——
        这比制造商预估的威胁阈值低了几个数量级。
      </p>

      <h2>单面锤击与双面锤击</h2>
      <p>
        在<strong>单面锤击（Single-Sided Hammering）</strong>中，一个攻击行被反复激活。
        受害行（物理上紧邻其上方或下方的一行）只从一个方向积累电荷扰动。
      </p>
      <p>
        在<strong>双面锤击（Double-Sided Hammering）</strong>中，夹住受害行的两行
        （攻击行 A 和攻击行 A+2）被交替锤击。受害行 A+1 同时从两侧接收扰动，
        触发位翻转所需的激活次数约为单面锤击的一半。
      </p>

      <h2>漏洞利用与安全影响</h2>
      <p>
        RowHammer 已超越硬件可靠性缺陷的范畴，演变为严重的安全漏洞：
      </p>
      <ul>
        <li><strong>权限提升：</strong>翻转页表项中的某个位，可将用户页重新映射到特权物理页。</li>
        <li><strong>Rowhammer.js（2016）：</strong>基于 JavaScript 的攻击，利用缓存驱逐确保每次访问都能到达 DRAM。</li>
        <li><strong>RAMBleed（2019）：</strong>利用 RowHammer 从相邻行读出密钥等秘密数据——利用了读取扰动所造成的信息泄露。</li>
        <li><strong>Half-Double（2021）：</strong>Google 证明"受害行"不必与攻击行直接相邻——电荷扰动可通过耦合效应跨越两行传播。</li>
      </ul>

      <h2>防御措施</h2>
      <p>
        <strong>目标行刷新（TRR，Target Row Refresh）</strong>是首个 DRAM 侧防御措施：
        统计每行的激活次数，当达到阈值时对相邻行执行刷新。
        然而，研究人员证明 TRR 可以被绕过——将锤击分散到多行，超出有限的硬件追踪能力即可。
      </p>
      <p>
        <strong>PARA（概率性相邻行激活，Probabilistic Adjacent Row Activation）：</strong>
        在每次行激活后，以概率 p 刷新相邻行。无需追踪状态，但会带来与 p 成正比的带宽开销。
      </p>
      <p>
        <strong>DDR5 RFM（刷新管理，Refresh Management）：</strong>JEDEC 在 DDR5 中强制要求 RFM。
        内存控制器使用滚动访问计数寄存器（ACR）统计每个 DRAM 设备的激活次数，
        当计数超过阈值（RAAIMT = Rowhammer 激活间隔管理阈值）时发出显式 RFM 命令。
        这是一种确定性的、标准化的解决方案，优于 TRR。
      </p>

      <div className="rounded-lg overflow-hidden border border-dram-border text-xs mt-4">
        <div className="grid grid-cols-3 bg-dram-bg px-3 py-2 font-semibold text-dram-muted">
          <div>防御措施</div><div>有效性</div><div>开销</div>
        </div>
        {[
          ['TRR (DDR4)', '可被多行模式绕过', '带宽开销极小'],
          ['PARA', '概率性保证，非确定性', '开销与刷新率 p 成正比'],
          ['DDR5 RFM', '确定性，已标准化', '典型工作负载下约 1–2% 带宽'],
          ['ECC + scrubbing', '事后纠正单比特翻转', '擦洗增加延迟与带宽开销'],
        ].map(([mit, eff, oh]) => (
          <div key={mit} className="grid grid-cols-3 border-t border-dram-border px-3 py-2">
            <div className="text-dram-blue font-mono">{mit}</div>
            <div className="text-dram-muted">{eff}</div>
            <div className="text-amber-400">{oh}</div>
          </div>
        ))}
      </div>

      <LessonNav lessonId={7} onComplete={() => markComplete(7)} lessons={lessonsL2Zh} />
    </div>
  )
}
