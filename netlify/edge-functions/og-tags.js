import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discord',
  'Pinterest',
  'redditbot',
  'Googlebot',
  'bingbot',
  'Applebot',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a dynamic OG image URL using a free service
 * This creates an image on-the-fly based on the blog title
 */
function generateDynamicOgImage(title, category = '') {
  // Using og-image.vercel.app - a free, open-source OG image generator
  // Alternatively, you can use services like:
  // - https://og.tailgraph.com
  // - https://imgproxy.net
  // - Deploy your own: https://github.com/vercel/og-image
  
  const encodedTitle = encodeURIComponent(title);
  const badge = category ? encodeURIComponent(category.toUpperCase()) : 'ARTICLE';
  
  // Using a simple generator that creates clean OG images
  // Format: dark background, white text, with title
  return `https://og.tailgraph.com/og?fontFamily=Inter&title=${encodedTitle}&titleTailwind=font-bold%20text-white%20text-5xl&titleFontFamily=Inter&text=${badge}&textTailwind=text-blue-400%20font-medium%20text-xl%20mt-4&textFontFamily=Inter&logoUrl=https%3A%2F%2Fgrowlytic.app%2Ffavicon.png&logoTailwind=w-12%20h-12&bgUrl=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1557683316-973673baf926%3Fw%3D1200%26h%3D630%26fit%3Dcrop&bgTailwind=bg-gradient-to-br%20from-slate-900%20via-blue-950%20to-indigo-900&footer=growlytic.app&footerTailwind=text-slate-400`;
}

function generateHtml(blog, url) {
  const title = escapeHtml(blog?.title || 'Growlytic');
  const description = escapeHtml(blog?.excerpt || 'Career resources, tech articles, and professional development guides.');
  
  // Use original cover image, or generate dynamic OG image based on title
  const image = blog?.cover_image_url || generateDynamicOgImage(blog?.title || 'Growlytic', blog?.category);
  
  const author = escapeHtml(blog?.author_name || 'Growlytic');
  const publishedDate = blog?.published_at ? new Date(blog.published_at).toISOString() : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} | Growlytic</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="${author}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:site_name" content="Growlytic">
  <meta property="og:locale" content="en_US">
  ${publishedDate ? `<meta property="article:published_time" content="${publishedDate}">` : ''}
  ${author ? `<meta property="article:author" content="${author}">` : ''}
  ${blog?.category ? `<meta property="article:section" content="${escapeHtml(blog.category)}">` : ''}
  
  <!-- Twitter / X.com -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${title}">
  <meta name="twitter:site" content="@growlytic">
  <meta name="twitter:creator" content="@growlytic">${author ? `
  <meta name="twitter:label1" content="Written by">
  <meta name="twitter:data1" content="${author}">` : ''}${blog?.category ? `
  <meta name="twitter:label2" content="Filed under">
  <meta name="twitter:data2" content="${escapeHtml(blog.category)}">` : ''}>
  
  <!-- Canonical -->
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Read more at: <a href="${url}">${url}</a></p>
</body>
</html>`;
}

function generateDefaultHtml(url) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>Growlytic - Career Resources & Tech Articles</title>
  <meta name="title" content="Growlytic - Career Resources & Tech Articles">
  <meta name="description" content="Career resources, tech articles, and professional development guides to advance your career.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="Growlytic - Career Resources & Tech Articles">
  <meta property="og:description" content="Career resources, tech articles, and professional development guides to advance your career.">
  <meta property="og:image" content="https://growlytic.app/og-image.png">
  <meta property="og:image:secure_url" content="https://growlytic.app/og-image.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Growlytic">
  
  <!-- Twitter / X.com -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="Growlytic - Career Resources & Tech Articles">
  <meta name="twitter:description" content="Career resources, tech articles, and professional development guides to advance your career.">
  <meta name="twitter:image" content="https://growlytic.app/og-image.png">
  <meta name="twitter:site" content="@growlytic">
  <meta name="twitter:creator" content="@growlytic">
</head>
<body>
  <h1>Growlytic</h1>
  <p>Career resources, tech articles, and professional development guides.</p>
</body>
</html>`;
}

export default async function handler(request, context) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  
  // Only intercept for bots
  if (!isBot(userAgent)) {
    return context.next();
  }
  
  // Check if this is a blog post URL
  const blogMatch = url.pathname.match(/^\/blogs\/([^\/]+)\/?$/);
  
  if (!blogMatch) {
    // Return default OG tags for non-blog pages
    return new Response(generateDefaultHtml(url.toString()), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  
  const slug = blogMatch[1];
  
  try {
    // Fetch blog data from Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: blog, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, cover_image_url, author_name, published_at, category')
      .eq('slug', slug)
      .single();
    
    if (error || !blog) {
      console.error('Blog not found:', slug, error);
      return new Response(generateDefaultHtml(url.toString()), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    return new Response(generateHtml(blog, url.toString()), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    
  } catch (err) {
    console.error('Error fetching blog:', err);
    return new Response(generateDefaultHtml(url.toString()), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

export const config = {
  path: ['/*'],
};
