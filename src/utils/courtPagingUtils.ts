// Court Document Paging Utilities
// Split full document HTML into individual discrete A4 page HTML strings
// Accurate physical page layout matching ISO 216 Standard A4 dimensions (210mm x 297mm)

export const A4_SPECS = {
  widthPx: 816,
  heightPx: 1154,
  contentPaddingX: 72,
  contentPaddingY: 64,
  contentWidthPx: 672, // 816 - 2 * 72
  maxContentHeightPx: 970, // Usable vertical printable height in pixels (1154 - 2*64 - 56 header/footer allowance)
  aspectRatio: '210 / 297',
};

export const PAGE_BREAK_MARKER = '<div class="court-page-break" data-page-break="true" contenteditable="false"></div>';
export const SPLIT_MARKER = '<!--COURT_A4_PAGE_SHEET_BREAK-->';

/**
 * Clean block elements from HTML string
 */
export const extractBlocksFromHtml = (html: string): string[] => {
  if (!html || !html.trim()) return ['<p><br></p>'];

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks: string[] = [];
    Array.from(doc.body.children).forEach((child) => {
      blocks.push(child.outerHTML);
    });
    if (blocks.length === 0 && doc.body.innerHTML.trim()) {
      blocks.push(`<p>${doc.body.innerHTML}</p>`);
    }
    return blocks.length > 0 ? blocks : ['<p><br></p>'];
  }

  // Fallback regex matching top-level tags
  const matched = html.match(/<(p|div|h[1-6]|table|blockquote|ul|ol|section)[\s\S]*?<\/\1>/gi);
  if (matched && matched.length > 0) return matched;
  return html.split(/\n\n+/).filter(Boolean).map((p) => `<p>${p.trim()}</p>`);
};

/**
 * Deterministic DOM-based auto-pagination engine.
 * Calculates exact rendered pixel heights of block elements and partitions
 * content into strict A4 pages so text never overflows a single sheet.
 */
export const autoPaginateHtmlByHeight = (
  html: string,
  maxContentHeightPx: number = A4_SPECS.maxContentHeightPx
): string[] => {
  if (!html || !html.trim()) return ['<p><br></p>'];

  // Check if browser environment is available for exact pixel layout measurements
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    let sandbox = document.getElementById('court-pagination-sandbox') as HTMLDivElement | null;
    if (!sandbox) {
      sandbox = document.createElement('div');
      sandbox.id = 'court-pagination-sandbox';
      sandbox.style.position = 'fixed';
      sandbox.style.left = '-9999px';
      sandbox.style.top = '0';
      sandbox.style.width = `${A4_SPECS.contentWidthPx}px`;
      sandbox.style.boxSizing = 'border-box';
      sandbox.style.visibility = 'hidden';
      sandbox.style.pointerEvents = 'none';
      sandbox.style.fontFamily = "'Times New Roman', Georgia, serif";
      sandbox.style.fontSize = '12pt';
      sandbox.style.lineHeight = '1.5';
      sandbox.style.textAlign = 'justify';
      document.body.appendChild(sandbox);
    }

    const blocks = extractBlocksFromHtml(html);
    const pages: string[] = [];
    let currentPageBlocks: string[] = [];
    let currentHeight = 0;

    sandbox.innerHTML = '';

    for (let i = 0; i < blocks.length; i++) {
      const blockHtml = blocks[i];

      // Measure block in sandbox
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = blockHtml;
      const el = tempWrapper.firstElementChild as HTMLElement;
      if (!el) continue;

      sandbox.appendChild(el);
      const elHeight = el.offsetHeight || 28;
      const computed = window.getComputedStyle(el);
      const marginBottom = parseFloat(computed.marginBottom || '0') || 8;
      const totalBlockHeight = elHeight + marginBottom;

      // Check if this is an explicit section break or page break
      const isExplicitBreak =
        el.classList.contains('court-page-break') ||
        el.getAttribute('data-page-break') === 'true' ||
        blockHtml.includes(SPLIT_MARKER);

      if (isExplicitBreak) {
        if (currentPageBlocks.length > 0) {
          pages.push(currentPageBlocks.join('\n'));
          currentPageBlocks = [];
          currentHeight = 0;
          sandbox.innerHTML = '';
        }
        continue;
      }

      // Check for heading orphan prevention (avoid leaving heading alone at the very bottom of the page)
      const isHeading = /^H[1-6]$/i.test(el.tagName);
      const isNearPageEnd = currentHeight + totalBlockHeight > maxContentHeightPx - 60;

      if (isHeading && isNearPageEnd && currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks.join('\n'));
        currentPageBlocks = [blockHtml];
        currentHeight = totalBlockHeight;
        sandbox.innerHTML = '';
        sandbox.appendChild(el);
        continue;
      }

      if (currentHeight + totalBlockHeight <= maxContentHeightPx || currentPageBlocks.length === 0) {
        // Fits comfortably on current sheet
        currentPageBlocks.push(blockHtml);
        currentHeight += totalBlockHeight;
      } else {
        // Exceeds A4 sheet height: send block to next page!
        pages.push(currentPageBlocks.join('\n'));
        currentPageBlocks = [blockHtml];
        currentHeight = totalBlockHeight;
        sandbox.innerHTML = '';
        sandbox.appendChild(el);
      }
    }

    if (currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks.join('\n'));
    }

    sandbox.innerHTML = '';
    return pages.length > 0 ? pages : ['<p><br></p>'];
  }

  // SSR fallback: approximate by line character estimation (approx 90 chars per line, 38 lines per A4 page)
  const CHARS_PER_PAGE = 3200;
  const blocks = extractBlocksFromHtml(html);
  const pages: string[] = [];
  let currentChunk: string[] = [];
  let currentLen = 0;

  for (const b of blocks) {
    const textLen = b.replace(/<[^>]+>/g, '').length + 60;
    if (currentLen + textLen > CHARS_PER_PAGE && currentChunk.length > 0) {
      pages.push(currentChunk.join('\n'));
      currentChunk = [b];
      currentLen = textLen;
    } else {
      currentChunk.push(b);
      currentLen += textLen;
    }
  }

  if (currentChunk.length > 0) {
    pages.push(currentChunk.join('\n'));
  }

  return pages.length > 0 ? pages : ['<p><br></p>'];
};

/**
 * Split full document HTML into individual discrete A4 page HTML strings.
 * Seamlessly normalizes legacy drafts and applies height-based auto-pagination.
 */
export const splitHtmlIntoA4Pages = (html?: string): string[] => {
  if (!html || !html.trim()) {
    return ['<p><br></p>'];
  }

  // 1. Sanitize legacy historical break markup from older drafts
  let sanitized = html
    .replace(/<span[^>]*class="[^"]*page-break-badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<div[^>]*class="[^"]*page-break-indicator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<hr[^>]*class="[^"]*court-page-break[^"]*"[^>]*\/?>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>/gi, SPLIT_MARKER)
    .replace(/<div[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>/gi, SPLIT_MARKER);

  sanitized = sanitized
    .replace(new RegExp(`(${SPLIT_MARKER})\\s*<\\/div>`, 'gi'), '$1')
    .replace(new RegExp(`<div[^>]*>\\s*(${SPLIT_MARKER})`, 'gi'), '$1');

  // If explicit page break markers exist
  if (sanitized.includes(SPLIT_MARKER)) {
    const rawPages = sanitized.split(SPLIT_MARKER);
    const cleaned = rawPages
      .map((p) => p.replace(/^\s*<\/div>/, '').replace(/<div[^>]*>\s*$/, '').trim())
      .filter((p, idx) => p.length > 0 || idx === 0);

    // If any individual page is excessively long, auto-paginate that page too
    const finalPages: string[] = [];
    cleaned.forEach((pageContent) => {
      const subPages = autoPaginateHtmlByHeight(pageContent);
      finalPages.push(...subPages);
    });

    return finalPages.length > 0 ? finalPages : ['<p><br></p>'];
  }

  // 2. Check for official court section headings (Writ Petition 11 Sections)
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

    const finalPages: string[] = [];
    cleaned.forEach((p) => {
      finalPages.push(...autoPaginateHtmlByHeight(p));
    });
    return finalPages.length > 0 ? finalPages : ['<p><br></p>'];
  }

  // 3. Fallback: Measure and partition full HTML dynamically into A4 pages
  return autoPaginateHtmlByHeight(sanitized);
};

/**
 * Combine individual A4 page HTML strings into a clean unified document HTML string
 */
export const combineA4PagesIntoHtml = (pages: string[]): string => {
  return pages
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(`\n${PAGE_BREAK_MARKER}\n`);
};

/**
 * Legacy helper for external consumers
 */
export const ensurePleadingHasPageBreaks = (content?: string): string => {
  if (!content) return '';
  const pages = splitHtmlIntoA4Pages(content);
  return combineA4PagesIntoHtml(pages);
};
