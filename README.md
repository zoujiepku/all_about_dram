# All About DRAM

An interactive, two-level tutorial web app for learning DRAM (Dynamic Random Access Memory) from fundamentals to advanced engineering depth.

Built with React 18 + Vite + Tailwind CSS, dark semiconductor theme throughout.

---

## Levels

### Level 1 — Fundamentals (11 lessons)
Aimed at engineers and students who want a solid conceptual foundation.

| # | Lesson |
|---|--------|
| 01 | Memory Hierarchy |
| 02 | Semiconductor Basics & the MOSFET |
| 03 | The DRAM Cell (1T1C) |
| 04 | DRAM Array Organization |
| 05 | Read Operation & Sense Amplifier |
| 06 | Write, Refresh & Leakage |
| 07 | Timing Parameters |
| 08 | DRAM Evolution |
| 09 | Modern DRAM Standards (DDR4 / DDR5 / LPDDR5X) |
| 10 | HBM & 3D Stacking |
| 11 | Emerging Technologies |

### Level 2 — Advanced (12 lessons)
Engineering depth: transistor-level schematics, quantitative trade-offs, and circuit intuition.

| Cluster | # | Lesson |
|---------|---|--------|
| Circuit Design | L01 | Sense Amplifier Design |
| Circuit Design | L02 | Wordline & Bitline Drivers |
| Circuit Design | L03 | Row & Column Decoder Design |
| System Architecture | L04 | Memory Controller Scheduling |
| System Architecture | L05 | Ranks, DIMMs & Channels |
| System Architecture | L06 | Bank Parallelism & tFAW |
| Reliability & Security | L07 | RowHammer Attack |
| Reliability & Security | L08 | ECC Architectures |
| Reliability & Security | L09 | Variable Retention & Reliability |
| Signal Integrity & I/O | L10 | DDR Signal Integrity |
| Signal Integrity & I/O | L11 | I/O Standards & Termination |
| Signal Integrity & I/O | L12 | High-Speed I/O: PAM4 & Equalization |

---

## Interactive Visualizations

Each lesson includes at least one interactive simulation:

- **DRAMCellViz** — 1T1C cell with live charge simulation, read/write, leak & refresh
- **DRAMCellWalkthrough** — step-by-step annotated read cycle with charge-sharing math
- **DRAMArraySim** — full array with row/column access animation
- **TimingDiagramViz** — tRCD, tCL, tRP waveforms
- **SenseAmpSim** — cross-coupled latch animation with tunable Cs/Cbl ratio
- **RowHammerSim** — aggressor/victim grid showing bit-flip accumulation
- **ECCSim** — SECDED Hamming code: inject a bit error, watch syndrome detection
- **SchedulerSim** — FR-FCFS vs. round-robin with live latency histogram
- **EyeDiagramViz** — PAM4 eye with tunable noise and equalization
- **RetentionViz** — Arrhenius retention curve with temperature slider
- **FlyByViz** — fly-by bus signal propagation with adjustable stub length
- …and more

---

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

### Routes

```
/lesson/1  …  /lesson/11      ← Level 1
/level2/lesson/1  …  /level2/lesson/12   ← Level 2
```

Use the Level 1 / Level 2 toggle in the sidebar to switch between curricula.

---

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18 |
| Vite | 5 |
| React Router | v6 |
| Tailwind CSS | v3 |

---

## References

Key references used for scientific accuracy:

- Keeth & Baker, *DRAM Circuit Design: Fundamental and High-Speed Topics*
- Jacob, Ng & Wang, *Memory Systems: Cache, DRAM, Disk*
- JEDEC JESD79-4 (DDR4), JESD79-5 (DDR5), JESD235 (HBM)
- Kim et al., "Flipping Bits in Memory Without Accessing Them" (ISCA 2014)
- Micron Technical Notes (TN-46-04 and related)
