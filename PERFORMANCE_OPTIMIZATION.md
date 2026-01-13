# Performance Optimization Guide

This document outlines all the performance improvements implemented to achieve better PageSpeed Insights scores.

## 🎯 Key Improvements

### 1. **Render-Blocking Resources** (Est. 400ms savings)

#### Font Loading Optimization
- ✅ Added `font-display: swap` to Google Fonts
- ✅ Implemented media print trick for non-blocking font loading
- ✅ Added `preconnect` hints for faster DNS resolution

**Implementation in `index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet" media="print" onload="this.media='all'" />
```

#### CSS Delivery
- ✅ Inlined critical CSS in `<head>` for instant first paint
- ✅ Non-critical CSS loaded asynchronously

### 2. **Image Optimization** (Est. 3,028 KiB savings)

#### Created `imageOptimization.js` utility with:
- ✅ Automatic WebP conversion via Supabase transformations
- ✅ Responsive images with proper `srcset` and `sizes` attributes
- ✅ Quality optimization (80% quality for web)
- ✅ Proper dimensions to avoid oversized downloads

**Usage in components:**
```jsx
import { getOptimizedImageUrl, generateSrcSet, getImageSizes } from '../utils/imageOptimization';

<Image
  src={getOptimizedImageUrl(url, { width: 800, quality: 80 })}
  srcSet={generateSrcSet(url, [400, 600, 800, 1200])}
  sizes={getImageSizes('blog-card')}
  loading="lazy"
  decoding="async"
/>
```

### 3. **Caching Strategy** (Est. 2,695 KiB savings)

#### Updated `public/_headers`:
- ✅ Static assets: 1 year cache (`max-age=31536000, immutable`)
- ✅ Images: 1 year cache with immutable flag
- ✅ Fonts: 1 year cache
- ✅ HTML: No cache for index, revalidation required
- ✅ Added security headers (X-Frame-Options, CSP, etc.)

**Note:** Supabase storage caching is controlled server-side. Consider using a CDN like Cloudflare for longer cache times.

### 4. **Code Splitting & Lazy Loading**

#### Vite Configuration (`vite.config.js`):
- ✅ Manual chunk splitting for vendor libraries
- ✅ Separate chunks for React, Chakra UI, Icons, and Supabase
- ✅ Terser minification with console.log removal
- ✅ Disabled source maps in production

#### Route-level Code Splitting (`App.jsx`):
- ✅ Lazy loaded all non-critical routes with React.lazy()
- ✅ Implemented Suspense boundaries with loading states
- ✅ Only Home page loads initially

**Before:**
```jsx
import Blogs from './pages/Blogs.jsx';
<Route path="/blogs" element={<Blogs />} />
```

**After:**
```jsx
const Blogs = lazy(() => import('./pages/Blogs.jsx'));
<Suspense fallback={<PageLoader />}>
  <Route path="/blogs" element={<Blogs />} />
</Suspense>
```

### 5. **Network Optimization**

#### Preconnect Hints:
- ✅ Added preconnect to Supabase storage domain
- ✅ DNS prefetch for Google Fonts
- ✅ DNS prefetch for Google Fonts CDN (gstatic.com)

**Benefits:**
- Establishes early connections
- Reduces DNS lookup time
- Speeds up first API calls

### 6. **LCP (Largest Contentful Paint) Improvements**

#### Optimizations:
- ✅ Reduced element render delay by optimizing critical path
- ✅ Lazy loading with proper `loading="lazy"` on images
- ✅ Added `decoding="async"` for non-blocking image decode
- ✅ Proper image dimensions to prevent layout shift

## 📊 Expected Performance Gains

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Render-blocking resources | 950ms | ~550ms | **400ms faster** |
| Image size | 3,108 KiB | ~80 KiB | **3,028 KiB saved** |
| JavaScript execution | 1.7s | ~1.0s | **~40% faster** |
| Bundle size | 379 KiB | Split chunks | **Better caching** |

## 🚀 Additional Recommendations

### For Further Optimization:

1. **Use a CDN for Supabase Images**
   - Consider Cloudflare or Fastly in front of Supabase storage
   - This will provide better cache control and global edge locations

2. **Convert Blog Cover Images to WebP/AVIF**
   - Manually convert large PNG images to WebP (70-80% smaller)
   - Use tools like Squoosh.app or ImageOptim

3. **Reduce Third-Party Scripts**
   - Review necessity of beehiiv embeds, Google Tag Manager
   - Consider loading these scripts after page load with `setTimeout`

4. **Implement Service Worker**
   - Cache static assets offline
   - Implement stale-while-revalidate strategy

5. **Database Query Optimization**
   - Add indexes on frequently queried columns
   - Use `select()` with specific columns instead of `*`
   - Implement pagination for blog posts

6. **Consider Image CDN**
   - Use Cloudinary, Imgix, or Cloudflare Images
   - Automatic format detection and optimization

## 🔧 How to Test

### Local Testing:
```bash
npm run build
npm run preview
```

### Lighthouse:
```bash
npx lighthouse https://growlytic.app --view
```

### PageSpeed Insights:
Visit: https://pagespeed.web.dev/analysis?url=https://growlytic.app

## 📝 Maintenance

### Regular Tasks:
1. **Monitor bundle size** - Run `npm run build` and check output
2. **Review Lighthouse scores** - Weekly checks
3. **Update dependencies** - Keep packages up to date
4. **Compress new images** - Before uploading to Supabase

### Bundle Analysis:
Uncomment in `vite.config.js`:
```js
visualizer({ open: true, gzipSize: true, brotliSize: true })
```

Then run `npm run build` to see bundle composition.

## 🐛 Troubleshooting

### Issue: Images still loading slowly
**Solution:** Ensure Supabase storage bucket has proper CORS settings and consider CDN

### Issue: Font flash on load
**Solution:** Font display swap is working as intended. Consider system font stack or preloading critical fonts

### Issue: Lazy routes causing loading flicker
**Solution:** Implement route prefetching on hover or intersection observer

## 📚 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance Guide](https://vitejs.dev/guide/build.html#chunking-strategy)
- [React Lazy & Suspense](https://react.dev/reference/react/lazy)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
