# Google Analytics Setup Guide

This guide will help you set up Google Analytics for your Piko Jobs website.

## Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Follow the setup wizard to create your account and property
4. Choose "Web" as your platform
5. Enter your website details:
   - Website name: "Piko Jobs"
   - Website URL: Your website URL
   - Industry category: "Jobs & Careers"
   - Reporting time zone: Your timezone

## Step 2: Get Your Measurement ID

1. After creating your property, you'll be given a Measurement ID
2. It will look like `G-XXXXXXXXXX` (where X represents letters/numbers)
3. Copy this ID - you'll need it for the next step

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Google Analytics Measurement ID:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## Step 4: Update the Analytics Configuration

1. Open `src/lib/analytics.js`
2. The file is already configured to use the environment variable
3. Make sure your `.env` file is in the project root

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Open your browser's developer tools
3. Go to the Network tab
4. Navigate through your website
5. You should see requests to Google Analytics (google-analytics.com)

## Step 6: Deploy and Verify

1. Build your project: `npm run build`
2. Deploy to your hosting platform
3. Visit your live website
4. Check Google Analytics Real-Time reports to confirm data is being collected

## What's Being Tracked

The following events are automatically tracked:

### Page Views
- All page navigation is tracked automatically
- Includes the full URL path and search parameters

### User Engagement
- Time spent on each page
- Page leave events
- User engagement metrics

### Custom Events (Available for use)
- **Job Events**: View, Apply, Save, Search
- **Authentication Events**: Login, Logout, Register
- **Course Events**: View, Enroll, Complete
- **Blog Events**: View, Share, Comment

## Using Analytics Hooks in Components

You can use the provided hooks to track specific events:

```jsx
import { useJobTracking, useAuthTracking } from '../hooks/useAnalytics';

function JobCard({ job }) {
  const { trackJobView, trackJobApply } = useJobTracking();
  
  const handleApply = () => {
    trackJobApply(job.id, job.title);
    // Your apply logic here
  };
  
  useEffect(() => {
    trackJobView(job.id, job.title);
  }, [job.id]);
  
  return (
    // Your component JSX
  );
}
```

## Privacy Considerations

- Analytics only runs in production mode
- No personal data is sent to Google Analytics
- Consider adding a privacy policy to your website
- You may want to add a cookie consent banner for GDPR compliance

## Troubleshooting

### No data appearing in Google Analytics?
1. Check that your Measurement ID is correct
2. Ensure you're testing on the live website (not localhost)
3. Check browser console for any errors
4. Verify that the `.env` file is properly configured

### Development vs Production
- Analytics only runs in production mode (`NODE_ENV === 'production'`)
- This prevents development data from polluting your analytics
- Test on your live website to see real data

## Additional Configuration

You can customize the analytics configuration in `src/lib/analytics.js`:

- Add custom dimensions
- Configure enhanced ecommerce tracking
- Set up conversion goals
- Add custom user properties

For more advanced features, refer to the [Google Analytics 4 documentation](https://developers.google.com/analytics/devguides/collection/ga4). 