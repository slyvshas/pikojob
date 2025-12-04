# Ezoic Integration Guide for Growlytic

## ✅ What's Been Done

### Step 1: Header Scripts ✓
Added Ezoic privacy scripts and header script to `index.html`:
- Privacy consent management scripts
- Main Ezoic header script
- Initialized `window.ezstandalone` object

### Step 2: Ads.txt ✓
Already configured at `/public/ads.txt` with your Google AdSense publisher ID.

### Step 3: Ad Component Created ✓
Created reusable `EzoicAd` component at `/src/components/EzoicAd.jsx`

## 📋 Next Steps - Create Ad Placements in Ezoic Dashboard

Before you can display ads, you need to create ad placements in your Ezoic dashboard:

1. **Go to Ezoic Dashboard**
   - Visit: https://www.ezoic.com/
   - Login to your account

2. **Create Ad Placements**
   - Navigate to: **Monetization** → **Ad Placements** (or similar)
   - Click **"Create New Placement"**
   - You'll get placement IDs (e.g., 101, 102, 103, etc.)
   - Recommended placements:
     - **Header Ad** (top of page)
     - **Sidebar Ad** (desktop)
     - **In-Content Ad** (between content)
     - **Footer Ad** (bottom of page)

3. **Note Your Placement IDs**
   - Write down the placement IDs Ezoic gives you
   - You'll use these IDs in the next step

## 🎨 How to Add Ads to Your Pages

Once you have placement IDs from Ezoic, here's how to add ads:

### Import the Component
```jsx
import EzoicAd from '../components/EzoicAd'
```

### Add Ads to Your Pages

#### Example 1: Simple Ad
```jsx
<EzoicAd placementId={101} />
```

#### Example 2: Ad with Custom Margin
```jsx
<EzoicAd placementId={102} marginY={8} />
```

#### Example 3: Desktop-Only Sidebar Ad
```jsx
<EzoicAd 
  placementId={103} 
  display={{ base: 'none', md: 'block' }}
/>
```

### Recommended Placements

#### Home Page (`/src/pages/Home.jsx`)
```jsx
// Add near the top of your render
return (
  <Box>
    {/* Header Ad */}
    <EzoicAd placementId={101} />
    
    {/* Your existing content */}
    
    {/* Mid-content Ad */}
    <EzoicAd placementId={102} marginY={8} />
    
    {/* Your more content */}
    
    {/* Footer Ad */}
    <EzoicAd placementId={103} />
  </Box>
)
```

#### Blog/Article Pages (`/src/pages/BlogDetail.jsx`)
```jsx
// After title/header
<EzoicAd placementId={104} />

// Between content sections
<EzoicAd placementId={105} marginY={6} />

// Before comments/bottom
<EzoicAd placementId={106} />
```

#### Job Listings (`/src/pages/JobList.jsx`)
```jsx
// Top of listings
<EzoicAd placementId={107} />

// Every 5-10 job cards, add:
{index % 5 === 0 && <EzoicAd placementId={108} marginY={4} />}
```

## 🚀 Testing Your Integration

### 1. Local Testing
- Run your dev server: `npm run dev`
- Open browser DevTools → Console
- Look for Ezoic script loading
- Check for errors

### 2. Production Testing
After deployment:
- Visit: https://growlytic.app
- Check browser console for Ezoic messages
- Ads may take 24-48 hours to start showing

### 3. Verify in Ezoic Dashboard
- Check if Ezoic detects your site
- Verify placements are showing up
- Monitor ad performance

## ⚠️ Important Notes

### Performance Best Practices
1. **Don't overload pages with ads** - 2-4 ads per page is optimal
2. **Use multiple placements efficiently** - Pass multiple IDs to one `showAds()` call:
   ```jsx
   // Instead of multiple components, you can use:
   useEffect(() => {
     window.ezstandalone.cmd.push(function() {
       window.ezstandalone.showAds(101, 102, 103)
     })
   }, [])
   ```

3. **Don't style the placeholder div** - Let Ezoic handle sizing
4. **Mobile vs Desktop** - Use Chakra's `display` prop to show/hide ads

### Troubleshooting

**Ads not showing?**
- Wait 24-48 hours after setup
- Check Ezoic dashboard is approved
- Verify placement IDs are correct
- Check browser console for errors
- Make sure ads.txt is accessible: https://growlytic.app/ads.txt

**Console errors?**
- Ensure Ezoic scripts load before your React app
- Check placement IDs exist in Ezoic dashboard
- Verify no ad blockers are interfering

## 📊 Example Implementation

Here's a complete example for your Home page:

```jsx
import { Box, Container, VStack } from '@chakra-ui/react'
import EzoicAd from '../components/EzoicAd'
import { /* your other imports */ } from '...'

const Home = () => {
  return (
    <Box>
      <Container maxW="container.xl">
        {/* Top Ad - Header */}
        <EzoicAd placementId={101} />
        
        <VStack spacing={8}>
          {/* Your hero section */}
          <HeroSection />
          
          {/* Mid-page Ad */}
          <EzoicAd placementId={102} marginY={6} />
          
          {/* Your features */}
          <FeaturesSection />
          
          {/* Your content */}
          <ContentSection />
          
          {/* Bottom Ad - Footer */}
          <EzoicAd placementId={103} />
        </VStack>
      </Container>
    </Box>
  )
}

export default Home
```

## 🔧 Need Help?

If you need assistance with:
- Creating specific ad placements
- Optimizing ad positions
- Troubleshooting issues

Contact Ezoic support or ask me to help implement ads on specific pages!

## 📝 Checklist

- [x] Ezoic header scripts added to index.html
- [x] ads.txt file configured
- [x] EzoicAd component created
- [ ] Create placements in Ezoic dashboard
- [ ] Add ads to Home page
- [ ] Add ads to Blog pages
- [ ] Add ads to Job listings
- [ ] Deploy to production
- [ ] Verify ads.txt: https://growlytic.app/ads.txt
- [ ] Wait 24-48 hours for ads to appear
- [ ] Monitor performance in Ezoic dashboard
