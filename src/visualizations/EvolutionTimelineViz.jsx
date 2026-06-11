import { useState } from 'react'

const generationsData = {
  en: [
    {
      name: 'FPM DRAM',
      year: '1987',
      bandwidth: 0.1,
      freq: 25,
      desc: 'Fast Page Mode — first DRAM to allow multiple CAS cycles without re-issuing RAS. Improved sequential read throughput by ~50%.',
      key: 'First "page mode" access — CAS can repeat without re-opening the row',
      color: '#64748b',
    },
    {
      name: 'EDO DRAM',
      year: '1994',
      bandwidth: 0.2,
      freq: 40,
      desc: 'Extended Data Out — output buffer holds data while next CAS begins, enabling pipeline overlap. Used in Pentium-era PCs.',
      key: 'Pipelined CAS: output valid while next column address is latched',
      color: '#3b82f6',
    },
    {
      name: 'SDRAM',
      year: '1996',
      bandwidth: 0.8,
      freq: 100,
      desc: 'Synchronous DRAM — clocked to the system bus. Enabled burst transfers. PC-100 and PC-133 ubiquitous in late 90s desktops.',
      key: 'Synchronized to system clock; burst length up to 8 words per access',
      color: '#06b6d4',
    },
    {
      name: 'DDR SDRAM',
      year: '2000',
      bandwidth: 2.1,
      freq: 266,
      desc: 'Double Data Rate — transfers data on both rising and falling clock edges, doubling bandwidth vs SDRAM at the same clock frequency.',
      key: 'Double-pumped data bus: 2 transfers per clock cycle',
      color: '#22c55e',
    },
    {
      name: 'DDR2',
      year: '2003',
      bandwidth: 4.3,
      freq: 533,
      desc: 'Lower voltage (1.8V), 4-bit prefetch, faster off-chip bus. Dominated mid-2000s. Replaced DDR in mainstream systems.',
      key: '4n prefetch, 1.8V, higher data bus frequency relative to cell array',
      color: '#84cc16',
    },
    {
      name: 'DDR3',
      year: '2007',
      bandwidth: 8.5,
      freq: 1066,
      desc: '8-bit prefetch, 1.5V (later 1.35V for DDR3L). Standard for Intel Sandy/Ivy Bridge through Haswell era.',
      key: '8n prefetch, 1.5V, fly-by topology for signal integrity',
      color: '#f59e0b',
    },
    {
      name: 'DDR4',
      year: '2014',
      bandwidth: 17.1,
      freq: 2133,
      desc: '1.2V, bank groups for parallel access, better signal integrity. Intel Skylake onward. Still widely deployed.',
      key: 'Bank groups (4 banks per group) enable near-pipelined row access',
      color: '#f97316',
    },
    {
      name: 'DDR5',
      year: '2021',
      bandwidth: 51.2,
      freq: 6400,
      desc: '1.1V, on-die ECC, 16n prefetch, two independent 32-bit subchannels per DIMM. Intel Alder Lake / AMD Zen 4 onward.',
      key: 'On-die ECC, split channel per DIMM, power management on module (PMIC)',
      color: '#a855f7',
    },
  ],
  zh: [
    {
      name: 'FPM DRAM',
      year: '1987',
      bandwidth: 0.1,
      freq: 25,
      desc: 'Fast Page Mode — 首款允许多次 CAS 周期而无需重新发出 RAS 的 DRAM，顺序读取吞吐量提升约 50%。',
      key: '首个"页模式"访问——CAS 可重复执行而无需重新打开行',
      color: '#64748b',
    },
    {
      name: 'EDO DRAM',
      year: '1994',
      bandwidth: 0.2,
      freq: 40,
      desc: 'Extended Data Out — 输出缓冲区在下一次 CAS 开始时保持数据有效，实现流水线重叠。用于奔腾时代的个人电脑。',
      key: '流水线 CAS：锁存下一列地址时输出仍有效',
      color: '#3b82f6',
    },
    {
      name: 'SDRAM',
      year: '1996',
      bandwidth: 0.8,
      freq: 100,
      desc: '同步 DRAM — 与系统总线同步，支持突发传输。PC-100 和 PC-133 在 90 年代末台式机中普遍使用。',
      key: '与系统时钟同步；每次访问突发长度最多 8 个字',
      color: '#06b6d4',
    },
    {
      name: 'DDR SDRAM',
      year: '2000',
      bandwidth: 2.1,
      freq: 266,
      desc: 'Double Data Rate — 在时钟上升沿和下降沿均传输数据，相同时钟频率下带宽是 SDRAM 的两倍。',
      key: '双泵数据总线：每个时钟周期传输 2 次',
      color: '#22c55e',
    },
    {
      name: 'DDR2',
      year: '2003',
      bandwidth: 4.3,
      freq: 533,
      desc: '更低电压（1.8V），4 位预取，更快的片外总线。主导 2000 年代中期市场，取代 DDR 成为主流。',
      key: '4n 预取，1.8V，相对存储单元阵列更高的数据总线频率',
      color: '#84cc16',
    },
    {
      name: 'DDR3',
      year: '2007',
      bandwidth: 8.5,
      freq: 1066,
      desc: '8 位预取，1.5V（后期 DDR3L 降至 1.35V）。Intel Sandy/Ivy Bridge 到 Haswell 时代的标准。',
      key: '8n 预取，1.5V，飞越拓扑提升信号完整性',
      color: '#f59e0b',
    },
    {
      name: 'DDR4',
      year: '2014',
      bandwidth: 17.1,
      freq: 2133,
      desc: '1.2V，Bank 组支持并行访问，更好的信号完整性。Intel Skylake 起至今仍广泛部署。',
      key: 'Bank 组（每组 4 个 Bank）实现近流水线行访问',
      color: '#f97316',
    },
    {
      name: 'DDR5',
      year: '2021',
      bandwidth: 51.2,
      freq: 6400,
      desc: '1.1V，片上 ECC，16n 预取，每个 DIMM 两个独立的 32 位子通道。Intel Alder Lake / AMD Zen 4 起支持。',
      key: '片上 ECC，每 DIMM 独立子通道，模块上电源管理（PMIC）',
      color: '#a855f7',
    },
  ],
}

const maxBW = Math.max(...generationsData.en.map((g) => g.bandwidth))

export default function EvolutionTimelineViz({ lang = 'en' }) {
  const isZh = lang === 'zh'
  const generations = generationsData[lang] ?? generationsData.en
  const [selected, setSelected] = useState(7)

  return (
    <div className="bg-dram-surface rounded-xl p-6 border border-dram-border">
      <h3 className="text-sm font-semibold text-dram-muted uppercase tracking-wider mb-1">
        {isZh ? 'DRAM 发展历程 — 点击柱状图了解详情' : 'DRAM Generation Timeline — click a bar to explore'}
      </h3>
      <p className="text-xs text-dram-muted mb-4">
        {isZh ? '带宽 = 单通道每 DIMM 峰值（MT/s × 8 字节）' : 'Bandwidth = single-channel per-DIMM peak (MT/s × 8 bytes)'}
      </p>

      {/* Bar chart — horizontally scrollable on very narrow screens */}
      <div className="overflow-x-auto pb-1">
      <div className="flex items-end gap-1.5 mb-6 h-36" style={{ minWidth: 340 }}>
        {generations.map((g, i) => {
          const h = Math.max(8, Math.round((g.bandwidth / maxBW) * 130))
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${g.name} — ${g.bandwidth} GB/s`}
            >
              <span className={`text-xs font-mono transition-colors ${
                selected === i ? 'text-dram-text' : 'text-transparent group-hover:text-dram-muted'
              }`}>
                {g.bandwidth >= 1 ? `${g.bandwidth}` : `${g.bandwidth * 1000}M`}
              </span>
              <div
                className="w-full rounded-t-sm transition-all duration-200"
                style={{
                  height: h,
                  backgroundColor: selected === i ? g.color : g.color + '55',
                  boxShadow: selected === i ? `0 0 8px ${g.color}88` : 'none',
                }}
              />
              <span
                className="text-xs font-bold rotate-0 truncate w-full text-center"
                style={{ color: selected === i ? g.color : '#475569', fontSize: '9px' }}
              >
                {g.name.replace(' DRAM', '').replace(' SDRAM', '')}
              </span>
              <span className="text-xs text-dram-muted/50" style={{ fontSize: '9px' }}>
                {g.year}
              </span>
            </button>
          )
        })}
      </div>
      </div>

      {/* Detail card */}
      {selected !== null && (
        <div
          className="rounded-lg p-5 border transition-all duration-300"
          style={{
            borderColor: generations[selected].color + '44',
            backgroundColor: generations[selected].color + '0d',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg" style={{ color: generations[selected].color }}>
              {generations[selected].name}
            </h4>
            <span className="text-xs text-dram-muted font-mono">{generations[selected].year}</span>
          </div>
          <p className="text-dram-muted text-sm mb-3">{generations[selected].desc}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dram-bg rounded-lg p-3">
              <div className="text-xs text-dram-muted mb-1">{isZh ? '峰值带宽' : 'Peak Bandwidth'}</div>
              <div className="font-bold font-mono" style={{ color: generations[selected].color }}>
                {generations[selected].bandwidth} GB/s
              </div>
            </div>
            <div className="bg-dram-bg rounded-lg p-3">
              <div className="text-xs text-dram-muted mb-1">{isZh ? '数据速率' : 'Data Rate'}</div>
              <div className="font-bold font-mono" style={{ color: generations[selected].color }}>
                {generations[selected].freq} MT/s
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs rounded-lg bg-dram-bg p-3">
            <span className="text-dram-muted">{isZh ? '关键创新：' : 'Key innovation: '}</span>
            <span className="text-dram-text">{generations[selected].key}</span>
          </div>
        </div>
      )}
    </div>
  )
}
