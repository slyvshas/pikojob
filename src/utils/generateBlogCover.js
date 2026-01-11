/**
 * Generates a beautiful blog cover image using HTML Canvas API
 * Creates a modern, tech-style cover with gradient background and premium styling
 */

// Cache for generated images to avoid regenerating
const imageCache = new Map();

/**
 * Wrap text to fit within a maximum width
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width for each line
 * @returns {string[]} Array of lines
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Get category badge text based on blog category or title keywords
 * @param {string} title - Blog title
 * @param {string} category - Blog category (optional)
 * @returns {string} Badge text
 */
function getBadgeText(title, category) {
  const titleLower = title.toLowerCase();
  
  if (category) {
    const categoryMap = {
      'tutorial': 'TUTORIAL',
      'guide': 'GUIDE',
      'free': 'FREE',
      'tips': 'TIPS',
      'news': 'NEWS',
      'review': 'REVIEW',
      'how-to': 'HOW-TO',
      'course': 'COURSE',
      'career': 'CAREER',
      'tech': 'TECH',
    };
    const mapped = categoryMap[category.toLowerCase()];
    if (mapped) return mapped;
  }
  
  // Detect from title keywords
  if (titleLower.includes('free')) return 'FREE';
  if (titleLower.includes('guide') || titleLower.includes('how to')) return 'GUIDE';
  if (titleLower.includes('tutorial')) return 'TUTORIAL';
  if (titleLower.includes('tips') || titleLower.includes('trick')) return 'TIPS';
  if (titleLower.includes('course') || titleLower.includes('learn')) return 'COURSE';
  if (titleLower.includes('career') || titleLower.includes('job')) return 'CAREER';
  if (titleLower.includes('ai') || titleLower.includes('tech')) return 'TECH';
  if (titleLower.includes('best') || titleLower.includes('top')) return 'PICKS';
  
  return 'ARTICLE';
}

/**
 * Generate a blog cover image as a data URL
 * @param {Object} options - Configuration options
 * @param {string} options.title - Blog title (required)
 * @param {string} options.category - Blog category (optional)
 * @param {string} options.brandName - Brand name for footer (default: 'Growlytic')
 * @param {string} options.gradientStyle - Gradient style: 'blue', 'purple', 'teal' (default: 'blue')
 * @returns {Promise<string>} Data URL of the generated image
 */
export async function generateBlogCover({
  title,
  category = '',
  brandName = 'Growlytic',
  gradientStyle = 'blue'
}) {
  // Check cache first
  const cacheKey = `${title}-${category}-${gradientStyle}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  return new Promise((resolve) => {
    // Create canvas with OG-image dimensions
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Define gradient colors based on style
    const gradients = {
      blue: {
        start: '#0a0f1a',    // Deep dark blue
        mid: '#1a2744',      // Navy blue
        end: '#2d1b69',      // Deep purple-blue
        accent: '#3b82f6',   // Bright blue accent
        accentLight: '#60a5fa',
        glow: 'rgba(59, 130, 246, 0.4)',
        textGlow: 'rgba(96, 165, 250, 0.8)',
      },
      purple: {
        start: '#0f0a1a',    // Deep dark purple
        mid: '#1f1635',      // Rich purple
        end: '#4c1d95',      // Violet
        accent: '#a855f7',   // Purple accent
        accentLight: '#c084fc',
        glow: 'rgba(168, 85, 247, 0.4)',
        textGlow: 'rgba(192, 132, 252, 0.8)',
      },
      teal: {
        start: '#0a1a1a',    // Deep dark teal
        mid: '#0d3331',      // Rich teal
        end: '#134e4a',      // Deep teal
        accent: '#14b8a6',   // Teal accent
        accentLight: '#2dd4bf',
        glow: 'rgba(20, 184, 166, 0.4)',
        textGlow: 'rgba(45, 212, 191, 0.8)',
      },
    };
    
    const colors = gradients[gradientStyle] || gradients.blue;
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(0.4, colors.mid);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add animated-like mesh gradient effect
    const drawMeshGradient = (x, y, radius, color, opacity) => {
      const meshGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      meshGradient.addColorStop(0, color.replace('0.4', String(opacity)));
      meshGradient.addColorStop(0.5, color.replace('0.4', String(opacity * 0.5)));
      meshGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = meshGradient;
      ctx.fillRect(0, 0, width, height);
    };
    
    // Multiple glow spots for depth
    drawMeshGradient(width * 0.8, height * 0.15, 350, colors.glow, 0.6);
    drawMeshGradient(width * 0.2, height * 0.85, 300, colors.glow, 0.4);
    drawMeshGradient(width * 0.5, height * 0.5, 400, colors.glow, 0.2);
    
    // Subtle noise/grain texture
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < width; i += 4) {
      for (let j = 0; j < height; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
    ctx.globalAlpha = 1;
    
    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw premium card container
    const cardPadding = 50;
    const cardX = cardPadding;
    const cardY = cardPadding;
    const cardWidth = width - cardPadding * 2;
    const cardHeight = height - cardPadding * 2;
    const cornerRadius = 28;
    
    // Card glow effect (outer)
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Card background with glass effect
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.clip();
    
    // Glass background
    const glassGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
    glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
    ctx.fillStyle = glassGradient;
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
    
    ctx.restore();
    
    // Card border with gradient
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.stroke();
    
    // Accent line at top (glowing)
    const accentGradient = ctx.createLinearGradient(cardX + 40, cardY, cardX + 250, cardY);
    accentGradient.addColorStop(0, colors.accent);
    accentGradient.addColorStop(0.5, colors.accentLight);
    accentGradient.addColorStop(1, colors.accent);
    
    ctx.strokeStyle = accentGradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(cardX + 45, cardY);
    ctx.lineTo(cardX + 220, cardY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw badge with glow
    const badgeText = getBadgeText(title, category);
    const badgePadding = { x: 18, y: 10 };
    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + badgePadding.x * 2;
    const badgeHeight = 34;
    const badgeX = cardX + 45;
    const badgeY = cardY + 55;
    
    // Badge glow
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText(badgeText, badgeX + badgePadding.x, badgeY + badgeHeight / 2 + 1);
    
    // Draw title with enhanced styling
    const titleX = cardX + 45;
    const titleY = badgeY + badgeHeight + 45;
    const maxTitleWidth = cardWidth - 90;
    
    // Calculate optimal font size based on title length
    let fontSize = 54;
    if (title.length > 80) fontSize = 38;
    else if (title.length > 60) fontSize = 42;
    else if (title.length > 40) fontSize = 48;
    
    ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    
    const lines = wrapText(ctx, title, maxTitleWidth);
    const lineHeight = fontSize * 1.25;
    const maxLines = 4;
    
    // Draw each line with effects
    lines.slice(0, maxLines).forEach((line, index) => {
      let displayLine = line;
      if (index === maxLines - 1 && lines.length > maxLines) {
        displayLine = line.slice(0, -3) + '...';
      }
      
      const y = titleY + index * lineHeight;
      
      // Multiple shadow layers for depth and glow
      // Outer glow
      ctx.shadowColor = colors.textGlow;
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillText(displayLine, titleX, y);
      
      // Medium glow
      ctx.shadowColor = colors.accent;
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillText(displayLine, titleX, y);
      
      // Soft shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayLine, titleX, y);
      
      // Main text with subtle gradient effect
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Create gradient for text
      const textGradient = ctx.createLinearGradient(titleX, y, titleX, y + fontSize);
      textGradient.addColorStop(0, '#ffffff');
      textGradient.addColorStop(0.5, '#f8fafc');
      textGradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = textGradient;
      ctx.fillText(displayLine, titleX, y);
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Decorative elements
    // Small accent dots
    const dotY = titleY + lines.slice(0, maxLines).length * lineHeight + 30;
    ctx.fillStyle = colors.accent;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(titleX + i * 20, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw branding at bottom with improved styling
    const brandY = cardY + cardHeight - 45;
    
    // Brand container background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(cardX + 35, brandY - 20, 200, 40, 20);
    ctx.fill();
    
    // Brand logo circle with glow
    const logoSize = 32;
    const logoX = cardX + 50;
    
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, brandY, logoSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Logo letter
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName.charAt(0).toUpperCase(), logoX + logoSize / 2, brandY);
    
    // Brand name with glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(brandName, logoX + logoSize + 14, brandY);
    
    // Website URL on right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('growlytic.app', cardX + cardWidth - 45, brandY);
    
    // Decorative corner accent (bottom right)
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(cardX + cardWidth - 80, cardY + cardHeight);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 80);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png', 0.92);
    
    // Cache the result
    imageCache.set(cacheKey, dataUrl);
    
    resolve(dataUrl);
  });
}

/**
 * React hook-friendly function to generate cover with loading state
 * @param {string} title - Blog title
 * @param {string} category - Blog category
 * @returns {Promise<string>} Data URL
 */
export async function generateCoverForBlog(title, category = '') {
  if (!title) return null;
  
  // Rotate through gradient styles based on title hash for variety
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const styles = ['blue', 'purple', 'teal'];
  const gradientStyle = styles[hash % styles.length];
  
  return generateBlogCover({
    title,
    category,
    gradientStyle,
  });
}

/**
 * Clear the image cache (useful for memory management)
 */
export function clearCoverCache() {
  imageCache.clear();
}

export default generateBlogCover;
