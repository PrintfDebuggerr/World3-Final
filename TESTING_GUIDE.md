# Testing Guide: Desktop Zoom & Scale Fix

## Quick Test Checklist

### 1. Browser Zoom Test (Chrome/Edge/Firefox)
Open the Duel Mode and test at these zoom levels:

- [ ] **100%** - Should look perfect, baseline reference
- [ ] **110%** - Should scale down slightly, everything visible
- [ ] **125%** - Should scale down more, no overflow
- [ ] **150%** - Should scale significantly, grids still side-by-side
- [ ] **175%** - Should be compact but fully functional
- [ ] **200%** - Should be very compact but still usable

**How to zoom:**
- Windows: `Ctrl` + `+` / `Ctrl` + `-` / `Ctrl` + `0` (reset)
- Mac: `Cmd` + `+` / `Cmd` + `-` / `Cmd` + `0` (reset)

### 2. Display Scale Test (Windows)
Test with Windows display scaling:

- [ ] **100%** (native resolution)
- [ ] **125%** (recommended for 1920x1080)
- [ ] **150%** (recommended for 4K)

**How to change:**
1. Right-click desktop → Display settings
2. Change "Scale and layout" percentage
3. Refresh browser

### 3. Resolution Test
Test on different screen resolutions:

- [ ] **1920x1080** (Full HD) - Optimal
- [ ] **1680x1050** - Should scale slightly
- [ ] **1536x864** - Should scale more
- [ ] **1440x900** (MacBook Air) - Should scale appropriately
- [ ] **1366x768** (Common laptop) - Should be compact but functional
- [ ] **1280x720** - Should scale significantly

### 4. Visual Checks

For each zoom/scale level, verify:

#### ✅ Layout
- [ ] Both player grids are visible side-by-side
- [ ] No horizontal scrolling required
- [ ] No vertical scrolling in game area
- [ ] Grids are centered horizontally
- [ ] Grids are centered vertically

#### ✅ Grid Elements
- [ ] All 6 rows visible for both players
- [ ] Letter cells are properly sized
- [ ] Spacing between cells is consistent
- [ ] Colors (green/yellow/gray) display correctly
- [ ] Text is readable (not too small)

#### ✅ UI Components
- [ ] Header with room code visible
- [ ] Player names and avatars visible
- [ ] Progress bars (0/6) visible and not overlapping
- [ ] Progress bar indicators working
- [ ] Keyboard fully visible at bottom
- [ ] Keyboard keys are clickable
- [ ] Instructions text visible

#### ✅ Interactions
- [ ] Can type letters using keyboard
- [ ] Can click letter cells (if interactive)
- [ ] Can press Enter to submit
- [ ] Can press Backspace to delete
- [ ] No elements overlap when typing
- [ ] Error messages display correctly

### 5. Edge Cases

Test these specific scenarios:

- [ ] **Narrow window** - Resize browser width to ~1000px
- [ ] **Short window** - Resize browser height to ~600px
- [ ] **Both narrow and short** - Small window at high zoom
- [ ] **Ultrawide monitor** - 2560x1080 or wider
- [ ] **Portrait orientation** - Rotate display (if possible)

### 6. Mobile Verification

**IMPORTANT:** Verify mobile layout is unchanged:

- [ ] Open on mobile device (or use DevTools mobile emulation)
- [ ] Layout should be exactly as before
- [ ] No new scaling applied
- [ ] Touch interactions work normally
- [ ] Keyboard appears correctly

**How to test mobile:**
1. Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Select iPhone/Android device
3. Test in both portrait and landscape

### 7. Performance Check

- [ ] Smooth transitions when zooming
- [ ] No layout jank or flickering
- [ ] No lag when typing
- [ ] Animations run smoothly (60fps)
- [ ] No console errors

### 8. Browser Compatibility

Test in multiple browsers:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Edge** (latest)
- [ ] **Safari** (if on Mac)

## Expected Behavior

### At 100% Zoom (1920x1080)
- Grids should be comfortably sized
- Letter cells: ~3rem (48px)
- Good spacing between elements
- Easy to read and interact with

### At 125% Zoom
- Grids scale down to ~88% of original
- Letter cells: ~2.6rem (42px)
- Still comfortable to use
- No overflow

### At 150% Zoom
- Grids scale down to ~82% of original
- Letter cells: ~2.4rem (38px)
- Compact but functional
- Everything visible

### At 200% Zoom
- Grids scale down to ~75% of original
- Letter cells: ~2.2rem (35px)
- Very compact
- Still usable

## Common Issues to Watch For

❌ **Horizontal overflow** - Grids should never require horizontal scrolling
❌ **Vertical overflow** - Game area should fit without scrolling
❌ **Overlapping elements** - Progress bars shouldn't overlap grids
❌ **Keyboard overflow** - Keyboard should always be fully visible
❌ **Text too small** - Text should remain readable at all zoom levels
❌ **Grids stacking** - Grids should always be side-by-side on desktop
❌ **Misalignment** - Elements should stay centered

## Reporting Issues

If you find any issues, note:
1. Browser and version
2. Screen resolution
3. Zoom level or display scale
4. Screenshot of the issue
5. Steps to reproduce

## Success Criteria

✅ All 6 rows visible for both players at all zoom levels
✅ No horizontal or vertical scrolling required
✅ Layout stays centered
✅ All UI elements visible and functional
✅ Smooth transitions
✅ Mobile layout unchanged
✅ Works in all major browsers
