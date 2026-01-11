/**
 * Blog Content Normalizer
 * 
 * Transforms raw or poorly formatted text content (e.g., from Google Sheets)
 * into clean, semantic HTML for better rendering.
 */

/**
 * Estimate reading time based on word count
 * Average reading speed: 200-250 words per minute
 */
export const calculateReadingTime = (content) => {
  if (!content) return 0;
  
  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate minutes (assuming 200 words per minute for comfortable reading)
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes); // At least 1 minute
};

/**
 * Check if content is already HTML formatted
 */
const isHTMLContent = (content) => {
  if (!content) return false;
  // Check for common HTML tags
  const htmlPattern = /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|code|table|br|img|a)[^>]*>/i;
  return htmlPattern.test(content);
};

/**
 * Detect if a line looks like a heading
 */
const detectHeadingLevel = (line) => {
  const trimmed = line.trim();
  
  // Markdown-style headings
  if (trimmed.startsWith('######')) return { level: 6, text: trimmed.slice(6).trim() };
  if (trimmed.startsWith('#####')) return { level: 5, text: trimmed.slice(5).trim() };
  if (trimmed.startsWith('####')) return { level: 4, text: trimmed.slice(4).trim() };
  if (trimmed.startsWith('###')) return { level: 3, text: trimmed.slice(3).trim() };
  if (trimmed.startsWith('##')) return { level: 2, text: trimmed.slice(2).trim() };
  if (trimmed.startsWith('#')) return { level: 1, text: trimmed.slice(1).trim() };
  
  // All caps short lines (likely headings)
  if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\d]+$/.test(trimmed)) {
    return { level: 2, text: titleCase(trimmed) };
  }
  
  // Short lines ending with colon (section headers)
  if (trimmed.length < 60 && trimmed.endsWith(':') && !trimmed.includes('.')) {
    return { level: 3, text: trimmed.slice(0, -1) };
  }
  
  return null;
};

/**
 * Convert string to title case
 */
const titleCase = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Detect if a line is a list item
 */
const detectListItem = (line) => {
  const trimmed = line.trim();
  
  // Numbered list: 1. , 1) , (1)
  const numberedMatch = trimmed.match(/^(\d+[\.\)]\s*|\(\d+\)\s*)/);
  if (numberedMatch) {
    return { type: 'ol', text: trimmed.slice(numberedMatch[0].length) };
  }
  
  // Bullet list: - , * , • , ▪ , ◦
  const bulletMatch = trimmed.match(/^([-*•▪◦]\s+)/);
  if (bulletMatch) {
    return { type: 'ul', text: trimmed.slice(bulletMatch[0].length) };
  }
  
  return null;
};

/**
 * Detect if a line is a blockquote
 */
const detectBlockquote = (line) => {
  const trimmed = line.trim();
  
  // Lines starting with > (markdown style)
  if (trimmed.startsWith('>')) {
    return trimmed.slice(1).trim();
  }
  
  // Lines wrapped in quotes
  const quoteMatch = trimmed.match(/^[""](.+)[""]$/);
  if (quoteMatch) {
    return quoteMatch[1];
  }
  
  return null;
};

/**
 * Escape HTML special characters
 */
const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Process inline formatting (bold, italic, links)
 */
const processInlineFormatting = (text) => {
  let result = escapeHTML(text);
  
  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // URLs: auto-link plain URLs
  result = result.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  return result;
};

/**
 * Normalize plain text content into semantic HTML
 */
export const normalizeContent = (content) => {
  if (!content) return '';
  
  // If content is already HTML, enhance it
  if (isHTMLContent(content)) {
    return enhanceHTMLContent(content);
  }
  
  // Process plain text
  const lines = content.split(/\r?\n/);
  const result = [];
  let currentList = null;
  let currentBlockquote = [];
  
  const flushList = () => {
    if (currentList) {
      result.push(`</${currentList.type}>`);
      currentList = null;
    }
  };
  
  const flushBlockquote = () => {
    if (currentBlockquote.length > 0) {
      result.push(`<blockquote>${currentBlockquote.join('<br>')}</blockquote>`);
      currentBlockquote = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines (but they separate paragraphs)
    if (!trimmed) {
      flushList();
      flushBlockquote();
      continue;
    }
    
    // Check for blockquote
    const blockquoteText = detectBlockquote(line);
    if (blockquoteText) {
      flushList();
      currentBlockquote.push(processInlineFormatting(blockquoteText));
      continue;
    }
    flushBlockquote();
    
    // Check for heading
    const heading = detectHeadingLevel(line);
    if (heading) {
      flushList();
      result.push(`<h${heading.level}>${processInlineFormatting(heading.text)}</h${heading.level}>`);
      continue;
    }
    
    // Check for list item
    const listItem = detectListItem(line);
    if (listItem) {
      if (!currentList || currentList.type !== listItem.type) {
        flushList();
        currentList = { type: listItem.type };
        result.push(`<${listItem.type}>`);
      }
      result.push(`<li>${processInlineFormatting(listItem.text)}</li>`);
      continue;
    }
    
    // Regular paragraph
    flushList();
    result.push(`<p>${processInlineFormatting(trimmed)}</p>`);
  }
  
  flushList();
  flushBlockquote();
  
  return result.join('\n');
};

/**
 * Enhance existing HTML content with better structure
 */
const enhanceHTMLContent = (content) => {
  let result = content;
  
  // Wrap loose text nodes in paragraphs (basic approach)
  // Split by block elements and wrap text
  
  // Ensure images have loading="lazy"
  result = result.replace(/<img(?![^>]*loading)/g, '<img loading="lazy"');
  
  // Add target="_blank" to external links
  result = result.replace(/<a(?![^>]*target)([^>]*href=["']https?:)/g, '<a target="_blank" rel="noopener noreferrer"$1');
  
  // Wrap tables in responsive container (handled by CSS)
  
  return result;
};

/**
 * Extract plain text from HTML for reading time calculation
 */
export const stripHTML = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Truncate text to a certain number of words
 */
export const truncateWords = (text, wordCount = 30) => {
  const words = text.split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};
