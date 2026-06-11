import { useOutletContext } from 'react-router-dom'
import LessonNav from '../../../components/LessonNav'
import RetentionViz from '../../../visualizations/level2/RetentionViz'
import { lessonsL2Zh } from '../../../data/lessonsL2.zh'

export default function L2_09() {
  const { markComplete } = useOutletContext()
  return (
    <div className="lesson-prose">
      <div className="mb-6">
        <span className="text-xs font-mono text-dram-blue uppercase tracking-widest">Level 2 · 第 09 模块 · 模块组 C：可靠性与安全性</span>
        <h1 className="text-3xl font-bold text-dram-text mt-1">可变保持时间与可靠性</h1>
        <p className="text-dram-muted mt-2">VRT 单元、Arrhenius 温度模型、FIT 率与保持时间测试</p>
      </div>

      <div className="rounded-lg p-4 bg-dram-blue/5 border border-dram-blue/20 text-sm text-dram-muted mb-6">
        <strong className="text-dram-blue">Level 1 关联：</strong>在模块 6（写入与刷新）中，你已了解 DRAM 单元必须每 64 ms 刷新一次。本模块深入探讨为何部分单元会比其他单元更早失效、温度如何加速失效，以及制造商如何保证 10 年产品生命周期内的可靠性。
      </div>

      <RetentionViz />

      <h2>Arrhenius 保持时间模型</h2>
      <p>
        存储单元的电荷保持时间遵循 Arrhenius 动力学——该方程同样适用于化学反应速率和半导体退化：
      </p>
      <p>
        <code>τ(T) = τ₀ · exp(Ea / kT)</code>
      </p>
      <p>
        其中，τ₀ 为指前因子，Ea ≈ 0.6–0.8 eV 为电荷泄漏的激活能（主要由存取晶体管亚阈值沟道泄漏决定），k = 8.617×10⁻⁵ eV/K 为玻尔兹曼常数，T 为开尔文绝对温度。
      </p>
      <p>
        实用经验法则：<strong>温度每升高 10°C，保持时间减半</strong>（适用于 Ea ≈ 0.65 eV 的情形）。JEDEC 规定在 85°C（最高壳温）下保持时间为 64 ms。在 25°C 室温下，典型单元可保持电荷数秒至数分钟。
      </p>

      <h2>可变保持时间（VRT）</h2>
      <p>
        VRT 是 DRAM 可靠性领域最难应对的现象。量产 DRAM 中极少数单元（&lt;10 ppm）会表现出<strong>双峰保持时间</strong>：它们在长保持状态和短保持状态之间随机切换，状态转换的时间尺度为数小时。
      </p>
      <p>
        其物理根源在于存储节点附近存在单个<strong>氧化层陷阱</strong>。当陷阱被占据（带电）时，局部电场增强，加速电容器漏电；当陷阱释放电荷后，漏电恢复正常。陷阱占据状态具有随机性，且受温度激活。
      </p>
      <p>
        VRT 单元尤为隐蔽：测试时（若恰好处于长保持状态）可通过所有可靠性筛查，但数月后在实际使用中却发生失效。
      </p>

      <h2>工艺差异</h2>
      <p>
        保持时间在同一芯片内的不同单元之间以及不同芯片之间差异显著：
      </p>
      <ul>
        <li><strong>片内差异：</strong>由于光刻和刻蚀的不均匀性，单元电容 Cs 偏差为 ±5–10%；随机掺杂涨落导致晶体管阈值偏差为 ±30 mV。</li>
        <li><strong>片间差异：</strong>晶圆面内工艺条件（氧化层厚度、掺杂浓度）的差异使平均保持时间偏移 ±20%。</li>
        <li><strong>批次间差异：</strong>不同设备间差异及工艺参数变更会导致单元群体发生系统性偏移。</li>
      </ul>
      <p>
        64 ms 规范必须由<strong>所有工艺角下的最差单元</strong>满足，因此制造商在高温（通常 85°C 或 105°C 应力测试）下进行测试，以加速失效暴露。
      </p>

      <h2>FIT 率与系统可靠性</h2>
      <p>
        可靠性以 <strong>FIT（Failure In Time）</strong>量化：每 10^9 器件小时内的预期失效次数。典型 DRAM 硬失效 FIT 率约为 1–10，由宇宙射线中子引起的软错误率约为 1000 FIT（次级中子翻转存储节点中的位）。
      </p>
      <p>
        对于搭载 256 GB DRAM 的服务器（≈ 256×10^9 字节 × 8 位/字节 = ~2×10^12 位，即约 2×10^6 Mb），若软错误率为 1 FIT/Mb，总 FIT 约为 2×10^6——即每台服务器每 500 个工作小时发生约一次未纠正错误。对于 10,000 台服务器的集群，约每小时出现 20 次全局错误，由此可见 ECC 和内存擦洗（memory scrubbing）在数据中心部署中不可或缺。
      </p>

      <h2>保持时间测试方法</h2>
      <p>
        DRAM 制造商采用 <strong>HTOL（High Temperature Operating Life，高温工作寿命）</strong>测试，在 105°C 或 125°C 下持续数千小时，利用 Arrhenius 加速因子等效老化。在 105°C 下进行 1000 小时 HTOL 测试，大致等效于在 55°C（典型内存工作温度）下工作 10 年。
      </p>

      <LessonNav lessonId={9} onComplete={() => markComplete(9)} lessons={lessonsL2Zh} />
    </div>
  )
}
