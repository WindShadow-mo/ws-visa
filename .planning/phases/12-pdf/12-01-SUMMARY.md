---
phase: 12-pdf
plan: 01
subsystem: ui
tags: [jspdf, watermark, teleport, loading-overlay]

# Dependency graph
requires:
  - phase: 5-pdf
    provides: usePdfExport composable, html2canvas + jsPDF pipeline
provides:
  - PDF watermark overlay (tiled diagonal vector text on every page)
  - Fullscreen loading overlay during PDF export
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "jsPDF GState + pdf.text() for vector watermark rendering"
    - "Teleport to body for z-index-independent overlays"

key-files:
  created: []
  modified:
    - src/composables/usePdfExport.ts
    - src/components/FormActions.vue

key-decisions:
  - "Used dynamic import for jsPDF GState constructor to match existing codebase pattern"
  - "z-[60] for loading overlay to sit above PreviewModal z-50"

patterns-established:
  - "addWatermark: module-level async function, called before pdf.save()"
  - "Teleport to body for fullscreen overlays that must escape DialogPortal stacking"

requirements-completed: []

coverage:
  - id: D1
    description: "Tiled diagonal watermark on every PDF page (-45deg, 36pt, gray, opacity 0.3)"
    verification:
      - kind: unit
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: true
    rationale: "Visual adequacy of watermark requires opening the PDF and inspecting"
  - id: D2
    description: "Fullscreen loading overlay during PDF export with spinner and i18n text"
    verification:
      - kind: unit
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: true
    rationale: "Overlay behavior requires interacting with the UI during export"

# Metrics
duration: 3min
completed: 2026-07-04
status: complete
---

# Phase 12 Plan 01: PDF Watermark + Export Loading Summary

**jsPDF vector text watermark on every PDF page and fullscreen Teleport loading overlay during export**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-04T06:04:15Z
- **Completed:** 2026-07-04T06:08:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `addWatermark` function overlays "青青签证" as tiled -45deg vector text on every PDF page (opacity 0.3, 36pt gray, 120x80mm grid)
- Fullscreen semi-transparent loading overlay with Loader2 spinner + i18n text during PDF export, z-[60] above PreviewModal (z-50)

## Task Commits

Each task was committed atomically:

1. **Task 1: usePdfExport.ts 添加水印函数** - `6d87f16` (feat)
2. **Task 2: FormActions.vue 添加导出 Loading 遮罩** - `3b23e95` (feat)

## Files Created/Modified
- `src/composables/usePdfExport.ts` - Added `addWatermark(pdf, text)` async function + `import { siteConfig }` + call before `pdf.save()`
- `src/components/FormActions.vue` - Added `<Teleport to="body">` loading overlay with `v-if="isExporting"`, z-[60], Loader2 spinner, i18n text

## Decisions Made
- Used dynamic `await import('jspdf')` inside `addWatermark` to access `jsPDF.GState` constructor, matching the existing codebase pattern (no static import of large jsPDF bundle)
- Made `addWatermark` async to support the dynamic import; call site uses `await`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Self-Check: PASSED
- `npx tsc --noEmit` passes with no errors
- All 8 Task 1 acceptance criteria verified (import, function def, page loop, angle, GState, fontSize, textColor, call order)
- All 7 Task 2 acceptance criteria verified (Teleport, z-[60], fixed inset-0, v-if, Loader2, i18n text, no new keys)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Phase 12 plan 01 complete. Watermark and loading overlay are functional; visual tuning of watermark density/opacity may be desired after manual inspection.

---
*Phase: 12-pdf*
*Completed: 2026-07-04*
