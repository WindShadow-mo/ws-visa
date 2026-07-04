---
status: testing
phase: 12-pdf
source: [12-VERIFICATION.md]
started: 2026-07-04T00:00:00Z
updated: 2026-07-04T00:00:00Z
---

## Current Test

number: 1
name: Watermark visual inspection
expected: |
  Export PDF and open in viewer. Every page should show tiled -45° "青青签证" watermark in light gray, low opacity. Watermark should be visible but not interfere with reading body text.
awaiting: user response

## Tests

### 1. Watermark visual inspection
expected: |
  Export PDF and open in viewer. Every page should show tiled -45° "青青签证" watermark in light gray (rgb 180,180,180), opacity 0.3, font size 36pt. spacingX=120mm, spacingY=80mm. Watermark visible but not interfering with reading.
result: [pending]

### 2. Loading overlay interaction
expected: |
  Click export button. Full-screen semi-transparent overlay appears with centered spinning Loader2 icon and text "正在生成..." (zh-CN) / "Generating..." (en). Overlay z-index is above PreviewModal (z-[60] > z-50). Cannot click other elements during export.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
