// Court Document Paging Utilities
// Split full document HTML into individual discrete A4 page HTML strings
// Fully backward compatible: seamlessly normalizes and handles older drafts
export const splitHtmlIntoA4Pages = (html?: string): string[] => {
  if (!html || !html.trim()) {
    return ['<p><br></p>'];
  }

  // 1. Sanitize legacy historical break markup from older drafts:
  // - Handles nested <div class="court-page-break">...<div class="page-break-indicator">...
  // - Handles legacy <hr class="court-page-break">
  // - Handles standalone page-break-badge, page-break-indicator
  const SPLIT_MARKER = '<!--COURT_A4_PAGE_SHEET_BREAK-->';

  let sanitized = html
    .replace(/<span[^>]*class="[^"]*page-break-badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<div[^>]*class="[^"]*page-break-indicator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<hr[^>]*class="[^"]*court-page-break[^"]*"[^>]*\/?>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>/gi, SPLIT_MARKER);

  // Clean any stray orphan </div> or <br> immediately touching the split marker
  sanitized = sanitized
    .replace(new RegExp(`(${SPLIT_MARKER})\\s*<\\/div>`, 'gi'), '$1')
    .replace(new RegExp(`<div[^>]*>\\s*(${SPLIT_MARKER})`, 'gi'), '$1');

  // If explicit page break markers exist (or were normalized from legacy drafts)
  if (sanitized.includes(SPLIT_MARKER)) {
    const rawPages = sanitized.split(SPLIT_MARKER);
    const cleaned = rawPages
      .map((p) => p.replace(/^\s*<\/div>/, '').replace(/<div[^>]*>\s*$/, '').trim())
      .filter((p, idx) => p.length > 0 || idx === 0);
    return cleaned.length > 0 ? cleaned : ['<p><br></p>'];
  }

  // 2. If no explicit breaks exist (older unpaginated drafts or text imports),
  // automatically partition across all 11 standardized court pleading sections
  let withSectionBreaks = sanitized;
  const sectionPatterns = [
    /(<p[^>]*>(?:<strong>\s*)?\[SECTION\s*(?:2|3|4|5|6|7|8|9|10|11)\b)/gi,
    /(<p[^>]*class="ql-align-center"[^>]*>\s*<strong>\s*(?:INDEX|CHRONOLOGICAL|LIST OF DATES|APPLICATION FOR INTERIM|MEMORANDUM OF|AFFIDAVIT IN SUPPORT|VAKALATNAMA)\b)/gi,
  ];

  for (const pat of sectionPatterns) {
    withSectionBreaks = withSectionBreaks.replace(pat, (m) => `${SPLIT_MARKER}${m}`);
  }

  if (withSectionBreaks.includes(SPLIT_MARKER)) {
    const rawPages = withSectionBreaks.split(SPLIT_MARKER);
    const cleaned = rawPages
      .map((p) => p.trim())
      .filter((p, idx) => p.length > 0 || idx === 0);
    return cleaned.length > 0 ? cleaned : ['<p><br></p>'];
  }

  // 3. Fallback: If draft is an extremely long legacy document (>18 paragraphs) with 0 breaks and 0 section tags,
  // chunk every ~15 paragraphs into distinct A4 sheets so it never overflows a single sheet
  const paragraphs = sanitized.match(/<p[\s\S]*?<\/p>/gi);
  if (paragraphs && paragraphs.length > 18) {
    const chunkedPages: string[] = [];
    const PARAGRAPHS_PER_PAGE = 15;
    for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_PAGE) {
      chunkedPages.push(paragraphs.slice(i, i + PARAGRAPHS_PER_PAGE).join('\n'));
    }
    return chunkedPages;
  }

  return [sanitized.trim()];
};

// Combine individual A4 page HTML strings into a clean unified document HTML string
export const combineA4PagesIntoHtml = (pages: string[]): string => {
  const pageBreakMarker = '<div class="court-page-break" data-page-break="true" contenteditable="false"></div>';
  return pages.map((p) => p.trim()).filter((p) => p.length > 0).join(`\n${pageBreakMarker}\n`);
};

// Legacy helper for external consumers
export const ensurePleadingHasPageBreaks = (content?: string): string => {
  if (!content) return '';
  const pages = splitHtmlIntoA4Pages(content);
  return combineA4PagesIntoHtml(pages);
};
