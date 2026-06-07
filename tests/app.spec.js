// @ts-check
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

// Actual h1 text in each lesson file (scraped from page in first run)
const LESSON_TITLES = [
  'Memory Hierarchy',       // lesson 1
  'Semiconductor Basics',   // lesson 2
  'The DRAM Cell',          // lesson 3
  'DRAM Array Organization',// lesson 4 — actual page title is "DRAM Array Organization"
  'Read Operation',         // lesson 5
  'Write & Refresh',        // lesson 6
  'Timing Parameters',      // lesson 7
  'DRAM Evolution',         // lesson 8
  'Modern DRAM',            // lesson 9
  'HBM & 3D DRAM',          // lesson 10
  'Emerging Technologies',  // lesson 11
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Clear progress localStorage before the test */
async function clearProgress(page) {
  await page.goto(BASE)
  await page.evaluate(() => localStorage.removeItem('dram-tutorial-completed'))
}

/**
 * Set a range input value the React-compatible way.
 * Playwright's fill() doesn't work for range inputs, and plain input/change
 * events don't trigger React's synthetic handler.  We use the
 * nativeInputValueSetter approach to update the value and then fire
 * a synthetic input event that React picks up.
 */
async function setSliderValue(page, locator, value) {
  await locator.evaluate((el, val) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set
    nativeInputValueSetter.call(el, val)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, String(value))
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Navigation — all 11 lesson routes load
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('root redirects to lesson 1', async ({ page }) => {
    await page.goto(BASE)
    await expect(page).toHaveURL(/\/lesson\/1/)
    // Use main > h1 to avoid the sidebar's "DRAM Deep Dive" h1
    await expect(page.locator('main h1')).toContainText('Memory Hierarchy')
  })

  for (let i = 1; i <= 11; i++) {
    test(`lesson ${i} loads with correct title`, async ({ page }) => {
      await page.goto(`${BASE}/lesson/${i}`)
      await expect(page.locator('main h1')).toContainText(LESSON_TITLES[i - 1])
    })
  }

  test('sidebar links navigate to each lesson', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // Click lesson 5 in sidebar — use aside to scope to sidebar only
    await page.locator('aside nav a').filter({ hasText: 'Read Operation' }).click()
    await expect(page).toHaveURL(/\/lesson\/5/)
    await expect(page.locator('main h1')).toContainText('Read Operation')
  })

  test('Next button navigates forward from lesson 1 to lesson 2', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // Click the → arrow in the lesson nav (inside main)
    await page.locator('main a').filter({ hasText: 'Semiconductor Basics' }).click()
    await expect(page).toHaveURL(/\/lesson\/2/)
  })

  test('Previous button navigates backward from lesson 3 to lesson 2', async ({ page }) => {
    await page.goto(`${BASE}/lesson/3`)
    // The lesson nav Previous link is scoped to main
    await page.locator('main a').filter({ hasText: 'Semiconductor Basics' }).click()
    await expect(page).toHaveURL(/\/lesson\/2/)
  })

  test('lesson 1 has no Previous button', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // The first lesson nav shows an empty div on the left, no ← Previous link
    const prevLink = page.locator('main a', { hasText: '←' })
    await expect(prevLink).toHaveCount(0)
  })

  test('lesson 11 has no Next button', async ({ page }) => {
    await page.goto(`${BASE}/lesson/11`)
    const nextLink = page.locator('main a', { hasText: '→' })
    await expect(nextLink).toHaveCount(0)
  })

  test('navigating all 11 lessons via Next button', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    for (let i = 2; i <= 11; i++) {
      // Click the → link in lesson nav (main scope, last link = next)
      await page.locator('main .mt-12 a').last().click()
      await expect(page).toHaveURL(new RegExp(`/lesson/${i}`))
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Progress — Mark Complete button
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Progress tracking', () => {
  test.beforeEach(async ({ page }) => {
    await clearProgress(page)
  })

  test('Mark Complete adds checkmark to sidebar', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // Initially no green checkmark for lesson 1
    const checkmark = page.locator('aside nav').locator('text=✓').first()
    await expect(checkmark).not.toBeVisible()

    await page.locator('button', { hasText: 'Mark Complete' }).click()

    // Checkmark should now appear
    await expect(checkmark).toBeVisible()
  })

  test('progress bar advances after marking complete', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // Read initial progress bar width (0%)
    const bar = page.locator('.bg-dram-blue.h-full')
    const initialWidth = await bar.evaluate((el) => el.style.width)
    expect(initialWidth).toBe('0%')

    await page.locator('button', { hasText: 'Mark Complete' }).click()

    // Should now show 1/11
    const updatedWidth = await bar.evaluate((el) => el.style.width)
    expect(updatedWidth).not.toBe('0%')

    // Sidebar shows 1 / 11
    await expect(page.locator('aside').locator('text=1 / 11')).toBeVisible()
  })

  test('clicking Mark Complete twice does not double-count', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    const markBtn = page.locator('button', { hasText: 'Mark Complete' })
    await markBtn.click()
    await markBtn.click()
    await expect(page.locator('aside').locator('text=1 / 11')).toBeVisible()
  })

  test('localStorage persists progress after page refresh', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    await page.locator('button', { hasText: 'Mark Complete' }).click()
    await expect(page.locator('aside').locator('text=1 / 11')).toBeVisible()

    // Reload and check persistence
    await page.reload()
    await expect(page.locator('aside').locator('text=1 / 11')).toBeVisible()
    const checkmark = page.locator('aside nav').locator('text=✓').first()
    await expect(checkmark).toBeVisible()
  })

  test('marking multiple lessons advances progress correctly', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await page.goto(`${BASE}/lesson/${i}`)
      await page.locator('button', { hasText: 'Mark Complete' }).click()
    }
    await expect(page.locator('aside').locator('text=3 / 11')).toBeVisible()
  })

  test('progress persists across navigation', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    await page.locator('button', { hasText: 'Mark Complete' }).click()
    // Navigate to lesson 5
    await page.goto(`${BASE}/lesson/5`)
    // Lesson 1 checkmark still visible in sidebar
    const checkmarks = page.locator('aside nav').locator('text=✓')
    await expect(checkmarks).toHaveCount(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. MemoryHierarchyViz — Lesson 1
// ─────────────────────────────────────────────────────────────────────────────

test.describe('MemoryHierarchyViz (Lesson 1)', () => {
  const levels = [
    { label: 'Registers', detail: 'Inside the CPU core' },
    { label: 'L1 Cache', detail: 'On-die SRAM cache per core' },
    { label: 'L2 Cache', detail: 'Larger unified cache' },
    { label: 'L3 Cache', detail: 'Last-level on-die cache' },
    { label: 'DRAM (Main Memory)', detail: 'Dynamic RAM' },
    { label: 'NVMe SSD', detail: 'Non-volatile flash storage' },
    { label: 'HDD / Tape', detail: 'Magnetic storage' },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
  })

  for (const lvl of levels) {
    test(`clicking "${lvl.label}" bar updates detail panel`, async ({ page }) => {
      await page.locator('button', { hasText: lvl.label }).click()
      // The detail panel is inside main, in the viz component (not sidebar)
      // Scoped to the visualization container: .bg-dram-surface inside main
      const vizPanel = page.locator('main .bg-dram-surface').first()
      await expect(vizPanel.locator('p').filter({ hasText: lvl.detail })).toBeVisible()
      // Title span (font-bold) inside the detail div
      await expect(vizPanel.locator('span.font-bold')).toContainText(lvl.label)
    })
  }

  test('all 7 pyramid bars are present', async ({ page }) => {
    // The pyramid bars are inside the viz's flex-col container
    const vizContainer = page.locator('main .bg-dram-surface').first()
    const buttons = vizContainer.locator('.flex.flex-col.items-center button')
    await expect(buttons).toHaveCount(7)
  })

  test('default selection is DRAM (index 4)', async ({ page }) => {
    const vizPanel = page.locator('main .bg-dram-surface').first()
    await expect(vizPanel.locator('span.font-bold')).toContainText('DRAM (Main Memory)')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOSFETViz — Lesson 2
// ─────────────────────────────────────────────────────────────────────────────

test.describe('MOSFETViz (Lesson 2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/2`)
  })

  test('initial state shows TRANSISTOR OFF', async ({ page }) => {
    await expect(page.locator('svg text').filter({ hasText: 'TRANSISTOR OFF' })).toBeVisible()
  })

  test('slider at 0V shows TRANSISTOR OFF', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await setSliderValue(page, slider, '0')
    await expect(page.locator('svg text').filter({ hasText: 'TRANSISTOR OFF' })).toBeVisible()
  })

  test('slider at 1V (threshold) shows TRANSISTOR ON', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await setSliderValue(page, slider, '1')
    await expect(page.locator('svg text').filter({ hasText: 'TRANSISTOR ON' })).toBeVisible()
  })

  test('slider at 3V shows TRANSISTOR ON', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await setSliderValue(page, slider, '3')
    await expect(page.locator('svg text').filter({ hasText: 'TRANSISTOR ON' })).toBeVisible()
    // Description panel should show ON state text
    await expect(page.locator('div.rounded-lg').filter({ hasText: 'ON state:' })).toBeVisible()
  })

  test('slider at 0.5V (below threshold) shows TRANSISTOR OFF', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await setSliderValue(page, slider, '0.5')
    await expect(page.locator('svg text').filter({ hasText: 'TRANSISTOR OFF' })).toBeVisible()
  })

  test('gate voltage label updates with slider', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await setSliderValue(page, slider, '2')
    // The label shows "Gate Voltage (Vg): 2V"
    await expect(page.locator('label')).toContainText('2V')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. DRAMCellViz — Lesson 3
// ─────────────────────────────────────────────────────────────────────────────

test.describe('DRAMCellViz (Lesson 3)', () => {
  // Status div selector: the monospace status box inside the DRAMCellViz
  // It's the first .bg-dram-bg.text-xs.text-dram-muted.font-mono inside main
  const statusSel = 'main .rounded-lg.p-3.bg-dram-bg.text-xs.text-dram-muted.font-mono'

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/3`)
  })

  test('Write 1 button stores logic 1 in cell', async ({ page }) => {
    await page.locator('button', { hasText: 'Write 1' }).click()
    // Wait for write animation (1500ms) to complete — status changes
    await page.waitForFunction(
      () => {
        const els = document.querySelectorAll('.bg-dram-bg.text-xs.font-mono')
        return Array.from(els).some(el => el.textContent.includes('stores logic 1'))
      },
      { timeout: 6000 }
    )
    await expect(page.locator(statusSel).first()).toContainText('Write complete. Cell now stores logic 1')
  })

  test('Write 0 button stores logic 0 in cell', async ({ page }) => {
    // First write 1 to ensure known state
    await page.locator('button', { hasText: 'Write 1' }).click()
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('.bg-dram-bg.text-xs.font-mono'))
               .some(el => el.textContent.includes('stores logic 1')),
      { timeout: 6000 }
    )
    await page.waitForTimeout(200)

    await page.locator('button', { hasText: 'Write 0' }).click()
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('.bg-dram-bg.text-xs.font-mono'))
               .some(el => el.textContent.includes('stores logic 0')),
      { timeout: 6000 }
    )
    await expect(page.locator(statusSel).first()).toContainText('Write complete. Cell now stores logic 0')
  })

  test('Read Cell button updates status text', async ({ page }) => {
    await page.locator('button', { hasText: 'Read Cell' }).click()
    // Immediately — wordline HIGH
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('.bg-dram-bg.text-xs.font-mono'))
               .some(el => el.textContent.includes('Wordline HIGH')),
      { timeout: 4000 }
    )
    // After animation completes — wordline LOW
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('.bg-dram-bg.text-xs.font-mono'))
               .some(el => el.textContent.includes('Wordline LOW')),
      { timeout: 6000 }
    )
  })

  test('Simulate Leak button appears initially, Stop Leak replaces it', async ({ page }) => {
    const simulateLeak = page.locator('button', { hasText: 'Simulate Leak' })
    const stopLeak = page.locator('button', { hasText: 'Stop Leak' })

    await expect(simulateLeak).toBeVisible()
    await expect(stopLeak).not.toBeVisible()

    await simulateLeak.click()

    await expect(stopLeak).toBeVisible()
    await expect(simulateLeak).not.toBeVisible()
  })

  test('Stop Leak restores Simulate Leak button', async ({ page }) => {
    await page.locator('button', { hasText: 'Simulate Leak' }).click()
    await page.locator('button', { hasText: 'Stop Leak' }).click()

    await expect(page.locator('button', { hasText: 'Simulate Leak' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Stop Leak' })).not.toBeVisible()
  })

  test('Refresh Row button appears when leaking', async ({ page }) => {
    const refreshBtn = page.locator('button', { hasText: 'Refresh Row' })

    // Initially should not be visible (charge starts at 85%)
    await expect(refreshBtn).not.toBeVisible()

    await page.locator('button', { hasText: 'Simulate Leak' }).click()

    // Refresh button should appear since leaking=true triggers the condition (leaking || charge < 0.4)
    await expect(refreshBtn).toBeVisible()
  })

  test('Refresh Row resets charge and status', async ({ page }) => {
    // Start leak, let it run briefly, then refresh
    await page.locator('button', { hasText: 'Simulate Leak' }).click()
    const refreshBtn = page.locator('button', { hasText: 'Refresh Row' })
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()
    // Status should say Refreshed!
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('.bg-dram-bg.text-xs.font-mono'))
               .some(el => el.textContent.includes('Refreshed')),
      { timeout: 4000 }
    )
    await expect(page.locator(statusSel).first()).toContainText('Refreshed!')
  })

  test('Read, Write 1, Write 0 are disabled during wordline animation', async ({ page }) => {
    await page.locator('button', { hasText: 'Write 1' }).click()
    // During the 1500ms animation, buttons should be disabled
    const readBtn = page.locator('button', { hasText: 'Read Cell' })
    await expect(readBtn).toBeDisabled()
    // Wait for animation to complete
    await page.waitForFunction(
      () => {
        const btn = Array.from(document.querySelectorAll('button'))
                         .find(b => b.textContent === 'Read Cell')
        return btn && !btn.disabled
      },
      { timeout: 5000 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. DRAMArraySim — Lesson 4
// ─────────────────────────────────────────────────────────────────────────────

test.describe('DRAMArraySim (Lesson 4)', () => {
  // State indicator: styled div with font-mono state label
  const stateIndicatorSel = '.rounded-lg.px-4.py-2\\.5'

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/4`)
    // Set speed to fastest (200ms) for quicker test runs
    const speedSlider = page.locator('input[type="range"]').last()
    await setSliderValue(page, speedSlider, '200')
  })

  test('state indicator initially shows IDLE', async ({ page }) => {
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'IDLE' })).toBeVisible()
  })

  test('clicking a cell in Read mode triggers PRECHARGE → ROW ACTIVE sequence', async ({ page }) => {
    // Click cell [0,0] — the first grid cell button
    const gridCells = page.locator('.flex.items-center.gap-0 button')
    await gridCells.first().click()

    // Should transition to PRECHARGE
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'PRECHARGE' })).toBeVisible({ timeout: 3000 })

    // Then ROW ACTIVE
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'ROW ACTIVE' })).toBeVisible({ timeout: 3000 })

    // Then COL SELECT
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'COL SELECT' })).toBeVisible({ timeout: 3000 })

    // Then DATA VALID
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'DATA VALID' })).toBeVisible({ timeout: 3000 })

    // Then RESTORE
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'RESTORE' })).toBeVisible({ timeout: 3000 })

    // Finally back to IDLE
    await expect(page.locator('.font-bold.font-mono').filter({ hasText: 'IDLE' })).toBeVisible({ timeout: 3000 })
  })

  test('Read/Write mode toggle works', async ({ page }) => {
    const readBtn = page.locator('button', { hasText: 'Read' }).first()
    const writeBtn = page.locator('button', { hasText: 'Write' }).first()

    // Initially in read mode — Read button should have blue bg
    await expect(readBtn).toHaveClass(/bg-dram-blue/)

    await writeBtn.click()
    await expect(writeBtn).toHaveClass(/bg-dram-amber/)
    // Write 1 / Write 0 toggle should appear
    await expect(page.locator('button', { hasText: 'Write 1' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Write 0' })).toBeVisible()
  })

  test('Write 0 / Write 1 value toggle in Write mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Write' }).first().click()
    const w1 = page.locator('button', { hasText: 'Write 1' })
    const w0 = page.locator('button', { hasText: 'Write 0' })

    await expect(w1).toHaveClass(/bg-dram-green/)
    await w0.click()
    await expect(w0).toHaveClass(/bg-red-500/)
  })

  test('write operation changes cell value in grid and log shows entry', async ({ page }) => {
    // Switch to Write mode, select Write 1
    await page.locator('button', { hasText: 'Write' }).first().click()
    await page.locator('button', { hasText: 'Write 1' }).click()

    // Click cell [0,0]
    const firstCell = page.locator('.flex.items-center.gap-0 button').first()
    await firstCell.click()

    // Wait for operation to complete — log should have WRITE complete
    await page.waitForFunction(
      () => {
        const logEl = document.querySelector('.bg-dram-bg.rounded-lg.p-3.font-mono')
        return logEl && logEl.textContent.includes('WRITE complete')
      },
      { timeout: 5000 }
    )
    // After completion cell should show 1
    await expect(firstCell).toContainText('1')
  })

  test('Refresh All button is clickable and animates rows', async ({ page }) => {
    const refreshBtn = page.locator('button', { hasText: 'Refresh All' })
    await expect(refreshBtn).toBeEnabled()
    await refreshBtn.click()
    // Button should be disabled during refresh
    await expect(refreshBtn).toBeDisabled()
    // Wait for completion
    await page.waitForFunction(
      () => {
        const btn = Array.from(document.querySelectorAll('button'))
                         .find(b => b.textContent.includes('Refresh All'))
        return btn && !btn.disabled
      },
      { timeout: 5000 }
    )
    await expect(refreshBtn).toBeEnabled()
  })

  test('cells are disabled during running operation (rapid clicking guard)', async ({ page }) => {
    const firstCell = page.locator('.flex.items-center.gap-0 button').first()
    await firstCell.click()

    // Immediately check - cells should be disabled during operation
    const gridCells = page.locator('.flex.items-center.gap-0 button')
    // Check first few cells are disabled
    await expect(gridCells.first()).toBeDisabled()
  })

  test('event log updates after cell click', async ({ page }) => {
    const firstCell = page.locator('.flex.items-center.gap-0 button').first()
    await firstCell.click()
    // Log should show a READ entry
    await expect(page.locator('.bg-dram-bg.rounded-lg.p-3.font-mono')).toContainText('READ [0,0]')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. TimingDiagramViz — Lesson 7
// ─────────────────────────────────────────────────────────────────────────────

test.describe('TimingDiagramViz (Lesson 7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/7`)
  })

  test('all 4 phase buttons are visible', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'tRP' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'tRCD' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'CL' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'tRAS' })).toBeVisible()
  })

  test('default phase is tRP (phase 0)', async ({ page }) => {
    await expect(page.locator('strong').filter({ hasText: 'tRP — Row Precharge' })).toBeVisible()
    await expect(page.locator('text=1 / 4')).toBeVisible()
  })

  test('clicking tRCD updates description', async ({ page }) => {
    await page.locator('button', { hasText: 'tRCD' }).click()
    await expect(page.locator('strong').filter({ hasText: 'tRCD — RAS to CAS Delay' })).toBeVisible()
    await expect(page.locator('text=2 / 4')).toBeVisible()
  })

  test('clicking CL updates description', async ({ page }) => {
    await page.locator('button', { hasText: 'CL' }).click()
    await expect(page.locator('strong').filter({ hasText: 'tCL — CAS Latency' })).toBeVisible()
    await expect(page.locator('text=3 / 4')).toBeVisible()
  })

  test('clicking tRAS updates description', async ({ page }) => {
    await page.locator('button', { hasText: 'tRAS' }).click()
    await expect(page.locator('strong').filter({ hasText: 'tRAS — Row Active Strobe' })).toBeVisible()
    await expect(page.locator('text=4 / 4')).toBeVisible()
  })

  test('Next button advances phase', async ({ page }) => {
    await page.locator('button', { hasText: 'Next →' }).click()
    await expect(page.locator('strong').filter({ hasText: 'tRCD — RAS to CAS Delay' })).toBeVisible()
    await expect(page.locator('text=2 / 4')).toBeVisible()
  })

  test('Previous button is disabled on first phase', async ({ page }) => {
    await expect(page.locator('button', { hasText: '← Previous' })).toBeDisabled()
  })

  test('Next button is disabled on last phase', async ({ page }) => {
    await page.locator('button', { hasText: 'tRAS' }).click()
    await expect(page.locator('button', { hasText: 'Next →' })).toBeDisabled()
  })

  test('Previous button navigates backward', async ({ page }) => {
    await page.locator('button', { hasText: 'tRAS' }).click()
    await page.locator('button', { hasText: '← Previous' }).click()
    await expect(page.locator('strong').filter({ hasText: 'tCL — CAS Latency' })).toBeVisible()
    await expect(page.locator('text=3 / 4')).toBeVisible()
  })

  test('stepping through all phases sequentially with Next', async ({ page }) => {
    const phases = ['tRCD — RAS to CAS Delay', 'tCL — CAS Latency', 'tRAS — Row Active Strobe']
    for (const phaseTitle of phases) {
      await page.locator('button', { hasText: 'Next →' }).click()
      await expect(page.locator('strong').filter({ hasText: phaseTitle })).toBeVisible()
    }
    await expect(page.locator('button', { hasText: 'Next →' })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. EvolutionTimelineViz — Lesson 8
// ─────────────────────────────────────────────────────────────────────────────

test.describe('EvolutionTimelineViz (Lesson 8)', () => {
  // The bar buttons display trimmed labels (the viz code strips " DRAM" and " SDRAM")
  // from the name string for the bar label. So:
  //   "FPM DRAM" → bar shows "FPM"
  //   "DDR SDRAM" → bar shows "DDR"   (BUT contains "DDR2", "DDR3" too — need exact)
  //   "DDR2" → bar shows "DDR2"
  // We'll use the bar button with exact year to disambiguate
  const generations = [
    { year: '1987', cardName: 'FPM DRAM' },
    { year: '1994', cardName: 'EDO DRAM' },
    { year: '1996', cardName: 'SDRAM' },
    { year: '2000', cardName: 'DDR SDRAM' },
    { year: '2003', cardName: 'DDR2' },
    { year: '2007', cardName: 'DDR3' },
    { year: '2014', cardName: 'DDR4' },
    { year: '2021', cardName: 'DDR5' },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/8`)
  })

  test('all 8 generation bars are present', async ({ page }) => {
    const bars = page.locator('.flex.items-end.gap-1\\.5 > button')
    await expect(bars).toHaveCount(8)
  })

  test('default selection is DDR5 (index 7)', async ({ page }) => {
    await expect(page.locator('h4').filter({ hasText: 'DDR5' })).toBeVisible()
  })

  for (let i = 0; i < generations.length; i++) {
    const gen = generations[i]
    test(`clicking bar index ${i} (${gen.year}) shows ${gen.cardName} detail card`, async ({ page }) => {
      // Click by positional index in the bar chart
      const bars = page.locator('.flex.items-end.gap-1\\.5 > button')
      await bars.nth(i).click()
      // The detail card h4 should show the full name
      await expect(page.locator('h4').filter({ hasText: gen.cardName })).toBeVisible()
      // Year shown in the card
      await expect(page.locator('.rounded-lg.p-5').locator('span.text-xs.font-mono')).toContainText(gen.year)
    })
  }

  test('detail card shows Peak Bandwidth and Data Rate fields', async ({ page }) => {
    // Already on DDR5 by default — verify the detail card fields
    await expect(page.locator('.rounded-lg.p-5 div').filter({ hasText: 'Peak Bandwidth' }).first()).toBeVisible()
    await expect(page.locator('.rounded-lg.p-5 div').filter({ hasText: 'Data Rate' }).first()).toBeVisible()
    await expect(page.locator('.rounded-lg.p-5').filter({ hasText: 'Key innovation' })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. HBMStackViz — Lesson 10
// ─────────────────────────────────────────────────────────────────────────────

test.describe('HBMStackViz (Lesson 10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/lesson/10`)
  })

  test('all 9 die-stack layers are present in SVG', async ({ page }) => {
    // Each layer is a <g> with cursor:pointer inside the SVG
    const layers = page.locator('svg g[style*="cursor: pointer"]')
    await expect(layers).toHaveCount(9)
  })

  test('clicking Logic Base Die shows description panel', async ({ page }) => {
    const layer = page.locator('svg g[style*="cursor: pointer"]').first()
    await layer.click()
    await expect(page.locator('div.rounded-lg strong').filter({ hasText: 'Logic Base Die' })).toBeVisible()
    await expect(page.locator('div.rounded-lg p').filter({ hasText: 'memory controller' })).toBeVisible()
  })

  test('clicking DRAM Die shows TSV description', async ({ page }) => {
    const dieLayer = page.locator('svg g[style*="cursor: pointer"]').nth(1)
    await dieLayer.click()
    await expect(page.locator('div.rounded-lg p').filter({ hasText: 'Through-Silicon Vias' })).toBeVisible()
  })

  test('clicking same layer twice toggles description off', async ({ page }) => {
    const layer = page.locator('svg g[style*="cursor: pointer"]').first()
    await layer.click()
    await expect(page.locator('div.rounded-lg strong').filter({ hasText: 'Logic Base Die' })).toBeVisible()
    await layer.click()
    await expect(page.locator('div.rounded-lg strong').filter({ hasText: 'Logic Base Die' })).not.toBeVisible()
  })

  test('all 4 HBM version buttons are visible', async ({ page }) => {
    // The HBM version buttons are in the right column; each contains "HBMx" + year
    // Use the "HBM Generations" section container to scope
    const versionsSection = page.locator('.flex-1.space-y-2')
    await expect(versionsSection.locator('button').nth(0)).toContainText('HBM1')
    await expect(versionsSection.locator('button').nth(1)).toContainText('HBM2')
    await expect(versionsSection.locator('button').nth(2)).toContainText('HBM2E')
    await expect(versionsSection.locator('button').nth(3)).toContainText('HBM3')
  })

  test('default active HBM version is HBM2E (index 2)', async ({ page }) => {
    // HBM2E is default (activeVersion=2), its desc should be expanded
    await expect(page.locator('text=SK Hynix / Micron variants')).toBeVisible()
  })

  test('clicking HBM1 shows HBM1 details', async ({ page }) => {
    await page.getByRole('button', { name: /HBM1/ }).click()
    await expect(page.locator('text=AMD Fury GPU')).toBeVisible()
    await expect(page.locator('text=128 GB/s')).toBeVisible()
  })

  test('clicking HBM3 shows HBM3 details', async ({ page }) => {
    await page.getByRole('button', { name: /HBM3\s/ }).click()
    // NVIDIA H100 text may appear in the button itself — use the expanded p element
    await expect(page.locator('p.text-xs.text-dram-muted.mb-2').filter({ hasText: 'NVIDIA H100' })).toBeVisible()
    await expect(page.locator('text=819 GB/s')).toBeVisible()
  })

  test('HBM version detail shows bandwidth, capacity, bus width, max dies', async ({ page }) => {
    // Click HBM2 (2nd button in versions section)
    const versionsSection = page.locator('.flex-1.space-y-2')
    await versionsSection.locator('button').nth(1).click()
    // The expanded detail stats are inside the active button
    const activeBtn = versionsSection.locator('button').nth(1)
    await expect(activeBtn.locator('text=Bandwidth/stack')).toBeVisible()
    await expect(activeBtn.locator('text=256 GB/s')).toBeVisible()
    await expect(activeBtn.locator('text=Bus width')).toBeVisible()
    await expect(activeBtn.locator('text=Max dies')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. Mobile view — hamburger menu
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mobile view (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('hamburger button is visible at mobile viewport', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    const hamburger = page.locator('button[aria-label="Open menu"]')
    await expect(hamburger).toBeVisible()
  })

  test('sidebar is hidden by default on mobile', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    // Sidebar has -translate-x-full when not open
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/-translate-x-full/)
  })

  test('clicking hamburger opens sidebar', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    const hamburger = page.locator('button[aria-label="Open menu"]')
    await hamburger.click()
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/translate-x-0/)
    // Overlay should appear
    await expect(page.locator('.fixed.inset-0.bg-black\\/60')).toBeVisible()
  })

  test('clicking overlay closes sidebar', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    await page.locator('button[aria-label="Open menu"]').click()
    // Click the overlay
    await page.locator('.fixed.inset-0.bg-black\\/60').click()
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/-translate-x-full/)
  })

  test('clicking sidebar link closes sidebar and navigates', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    await page.locator('button[aria-label="Open menu"]').click()
    await page.locator('aside nav a').filter({ hasText: 'The DRAM Cell' }).click()
    await expect(page).toHaveURL(/\/lesson\/3/)
    // Sidebar should close
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/-translate-x-full/)
  })

  test('mobile top bar is visible with title', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header')).toContainText('DRAM Deep Dive')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 11. Lesson 11 — completion banner with all tags
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Lesson 11 completion banner', () => {
  test.beforeEach(async ({ page }) => {
    await clearProgress(page)
    // Mark all 11 lessons complete
    await page.evaluate(() => {
      localStorage.setItem('dram-tutorial-completed', JSON.stringify([1,2,3,4,5,6,7,8,9,10,11]))
    })
    await page.goto(`${BASE}/lesson/11`)
  })

  test('lesson 11 loads with Emerging Technologies title', async ({ page }) => {
    await expect(page.locator('main h1')).toContainText('Emerging Technologies')
  })

  test('completion banner appears when all 11 lessons are complete', async ({ page }) => {
    await expect(page.locator('text=11 / 11')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 12. Edge cases
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Edge cases', () => {
  test('direct URL to lesson 6 loads both DRAMCellViz and DRAMArraySim', async ({ page }) => {
    await page.goto(`${BASE}/lesson/6`)
    await expect(page.locator('main h1')).toContainText('Write & Refresh')
    // Both vizualizations present
    await expect(page.locator('text=DRAM Cell (1T1C)')).toBeVisible()
    await expect(page.locator('text=DRAM Array Simulator')).toBeVisible()
  })

  test('lesson 9 static content renders comparison table', async ({ page }) => {
    await page.goto(`${BASE}/lesson/9`)
    await expect(page.locator('main h1')).toContainText('Modern DRAM')
    // Should have content with DDR5
    await expect(page.locator('main').filter({ hasText: 'DDR5' })).toBeVisible()
  })

  test('rapid clicking MemoryHierarchy bars does not break detail panel', async ({ page }) => {
    await page.goto(`${BASE}/lesson/1`)
    const vizContainer = page.locator('main .bg-dram-surface').first()
    const buttons = vizContainer.locator('.flex.flex-col.items-center button')
    // Rapidly click all 7 bars
    for (let i = 0; i < 7; i++) {
      await buttons.nth(i).click()
    }
    // Last clicked is HDD/Tape (index 6)
    await expect(vizContainer.locator('span.font-bold')).toContainText('HDD / Tape')
  })

  test('DRAMArraySim in lesson 5 also renders', async ({ page }) => {
    await page.goto(`${BASE}/lesson/5`)
    await expect(page.locator('main h1')).toContainText('Read Operation')
    await expect(page.locator('text=DRAM Array Simulator')).toBeVisible()
  })

  test('mark complete persists across lesson navigation', async ({ page }) => {
    await clearProgress(page)
    await page.goto(`${BASE}/lesson/1`)
    await page.locator('button', { hasText: 'Mark Complete' }).click()
    await page.goto(`${BASE}/lesson/2`)
    await page.locator('button', { hasText: 'Mark Complete' }).click()
    await page.goto(`${BASE}/lesson/1`)
    // Both checkmarks should be there
    const checkmarks = page.locator('aside nav').locator('text=✓')
    await expect(checkmarks).toHaveCount(2)
  })
})
