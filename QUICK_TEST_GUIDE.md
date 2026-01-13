# 🚀 Quick Test Guide

Run this guide after deploying to verify all optimizations are working.

## ⚡ 1-Minute Quick Check

### Open DevTools (F12) → Network Tab

**✅ What to verify:**

1. **CSS is not render-blocking**
   - Filter by "CSS"
   - Main CSS should NOT have red "blocking" label
   - Should load with media="print" then switch to "all"

2. **Fonts load asynchronously**
   - Filter by "Font"
   - Fonts should load AFTER initial paint
   - Should be cached on repeat visit (from disk cache)

3. **Images are optimized**
   - Filter by "Img"
   - Blog images should be:
     - WebP format (look for `.webp` or `format=webp` in URL)
     - ~200-400 KB instead of 1-3 MB
     - Lazy loaded (not all load at once)

4. **JavaScript is split**
   - Filter by "JS"
   - Should see multiple chunks:
     - `react-vendor-[hash].js`
     - `chakra-vendor-[hash].js`
     - `icons-[hash].js`
     - `supabase-[hash].js`
   - Initial page should be ~50 KB

---

## 🔍 2-Minute Lighthouse Test

### In Chrome DevTools:

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Desktop
   - ✅ Navigation
4. Click "Analyze page load"

**✅ Target Scores:**
- Performance: **90+** (Desktop), **80+** (Mobile)
- LCP: **< 2.5s**
- FID: **< 100ms**
- CLS: **< 0.1**

---

## 📊 5-Minute PageSpeed Insights

### Test both mobile and desktop:

```
https://pagespeed.web.dev/analysis?url=https://growlytic.app
```

**✅ Check for improvements in:**

1. **Opportunities (Should be mostly green)**
   - ✅ Render-blocking resources: ~150ms (was 950ms)
   - ✅ Image formats: Minimal issues (was 3,028 KiB)
   - ✅ Properly sized images: Most images correct size
   - ✅ Unused JavaScript: < 100 KiB (was 447 KiB)

2. **Diagnostics (Should be improved)**
   - ✅ JavaScript execution time: ~1.0s (was 1.7s)
   - ✅ Minimize main-thread work: ~1.5s (was 2.5s)
   - ✅ Reduce network payloads: Much smaller

3. **Cache Headers (Should be green)**
   - ✅ Static assets: 1 year cache
   - ✅ Images: 1 year cache
   - ✅ Fonts: 1 year cache

---

## 🧪 10-Minute Deep Test

### 1. Test Homepage (`/`)
```bash
# Clear cache (Cmd+Shift+R or Ctrl+Shift+R)
# Open DevTools → Network
# Check:
✅ Initial bundle < 100 KB
✅ No render-blocking CSS
✅ Fonts load async
✅ Fast LCP (< 2s)
```

### 2. Test Blogs Page (`/blogs`)
```bash
# Navigate to /blogs
# Check Network tab:
✅ Blogs.jsx loads as separate chunk
✅ Images use srcset with multiple sizes
✅ Images load as WebP
✅ Loading="lazy" on below-fold images
```

### 3. Test Individual Blog (`/blogs/[slug]`)
```bash
# Click on a blog post
# Check:
✅ BlogDetail.jsx loads as separate chunk
✅ Cover image is optimized
✅ Responsive images work on resize
```

### 4. Test Repeat Visit
```bash
# Refresh the page (normal F5, not hard refresh)
# Check Network tab:
✅ Most assets from disk cache
✅ Cache-Control headers: max-age=31536000
✅ Load time < 500ms
```

---

## 🎯 Visual Checks

### 1. No Layout Shift
- ✅ Page doesn't "jump" during load
- ✅ Images have proper dimensions
- ✅ Fonts don't cause reflow

### 2. Smooth Loading
- ✅ Content appears progressively
- ✅ No flash of unstyled content (FOUC)
- ✅ Spinner shows while route loads

### 3. Images
- ✅ Clear and sharp
- ✅ Load smoothly
- ✅ No pixelation on resize

---

## 🐛 Common Issues & Fixes

### Issue: "Fonts still blocking render"
**Check:**
- View page source
- Look for: `media="print" onload="this.media='all'"`
- Should be there on Google Fonts link

**Fix if missing:**
```html
<link href="..." rel="stylesheet" media="print" onload="this.media='all'" />
```

---

### Issue: "Images still huge"
**Check:**
- Network tab → Image URL
- Should contain: `/render/image/` (not `/object/`)
- Should have: `?width=800&quality=80&format=webp`

**Fix if missing:**
- Verify `imageOptimization.js` is imported
- Check Supabase storage configuration

---

### Issue: "Bundle not split"
**Check:**
- Network tab → JS files
- Should see multiple `vendor-` files

**Fix if missing:**
```bash
npm run build
# Check build output for chunks
```

---

### Issue: "No cache headers"
**Check:**
- Network tab → Select any asset
- Headers tab → Look for `Cache-Control`

**Fix if missing:**
- Verify `public/_headers` exists
- Check Netlify deployment

---

## 📱 Mobile Testing

### Test on actual device:

1. **Open Chrome DevTools**
   - Device mode (Ctrl+Shift+M)
   - Select "iPhone 12 Pro"
   - Throttle network to "Fast 3G"

2. **Run Lighthouse Mobile**
   - Should still get 80+ score

3. **Test on real phone**
   - Visit site on your phone
   - Should feel fast and responsive

---

## 🎬 Before/After Quick Comparison

### Homepage Load:

**Before:**
```
Network: 379 KB initial
Time: 4.5s to interactive
LCP: 3.0s
```

**After (Expected):**
```
Network: ~50 KB initial ✅
Time: 1.8s to interactive ✅
LCP: 1.5s ✅
```

### Blogs Page:

**Before:**
```
Images: 3.1 MB total
Format: PNG
Load: All at once
```

**After (Expected):**
```
Images: ~350 KB total ✅
Format: WebP ✅
Load: Lazy loaded ✅
```

---

## ✅ Final Checklist

### Must Pass:
- [ ] PageSpeed Mobile: 75+
- [ ] PageSpeed Desktop: 85+
- [ ] LCP: < 2.5s
- [ ] Images are WebP
- [ ] Fonts load async
- [ ] Bundle is split

### Nice to Have:
- [ ] PageSpeed Mobile: 80+
- [ ] PageSpeed Desktop: 90+
- [ ] LCP: < 2.0s
- [ ] All images cached
- [ ] No console errors

---

## 🎉 Success Criteria

### You've succeeded if:

1. ✅ **Network tab shows:**
   - Split JS bundles
   - WebP images
   - Cached resources on repeat

2. ✅ **Lighthouse shows:**
   - Performance 80+ (Mobile)
   - Performance 90+ (Desktop)
   - Green Core Web Vitals

3. ✅ **PageSpeed Insights shows:**
   - Most opportunities green
   - Improved metrics vs before
   - Passing Core Web Vitals

4. ✅ **Real user experience:**
   - Page loads feel instant
   - Smooth scrolling
   - No layout shifts

---

## 📞 Need Help?

### If scores are lower than expected:

1. **Check build output:**
   ```bash
   npm run build
   # Look for chunk sizes
   ```

2. **Verify deployment:**
   ```bash
   # Check if _headers file deployed
   curl -I https://growlytic.app/assets/index-xxx.js
   # Should show Cache-Control header
   ```

3. **Review documentation:**
   - [PERFORMANCE_SUMMARY.md](PERFORMANCE_SUMMARY.md)
   - [BEFORE_AFTER_COMPARISON.md](BEFORE_AFTER_COMPARISON.md)

---

**Pro Tip:** Run tests from different locations and devices for accurate results!

**Remember:** PageSpeed scores can vary ±5 points between runs. Run 3 times and take average.
