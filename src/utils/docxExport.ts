import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { splitHtmlIntoA4Pages } from '@/utils/courtPagingUtils';

/**
 * Parses an HTML string (formatted court pleading) into genuine OpenXML Paragraphs & Tables
 * with authentic page breaks matching the on-screen discrete A4 pages 1:1.
 */
export function buildDocxFromHtml(html: string, title: string = 'Court Pleading'): Document {
  const pages = splitHtmlIntoA4Pages(html);
  const children: (Paragraph | Table)[] = [];

  pages.forEach((pageHtml, pageIndex) => {
    // 1. Explicit OpenXML Page Break between discrete A4 sheets
    if (pageIndex > 0) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
          spacing: { before: 0, after: 0, line: 240 },
        })
      );
    }

    // 2. Parse blocks in this specific page
    const cleanedPageHtml = pageHtml
      .replace(/<span[^>]*class="[^"]*page-break-badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<div[^>]*class="[^"]*page-break-indicator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

    // DOM Parser for Browser & RegEx fallback for SSR
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedPageHtml, 'text/html');
      const bodyChildren = Array.from(doc.body.children);

      const elementsToProcess = bodyChildren.length > 0 ? bodyChildren : [doc.body];

      elementsToProcess.forEach((element) => {
        // Table element
        if (element.tagName.toLowerCase() === 'table') {
          const rows: TableRow[] = [];
          const trElements = Array.from(element.querySelectorAll('tr'));

          trElements.forEach((tr) => {
            const cells: TableCell[] = [];
            const cellElements = Array.from(tr.querySelectorAll('th, td'));

            cellElements.forEach((cell) => {
              const isHeader = cell.tagName.toLowerCase() === 'th';
              const text = cell.textContent?.trim() || '';

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                      spacing: { before: 60, after: 60, line: 280 },
                      children: [
                        new TextRun({
                          text,
                          bold: isHeader,
                          font: 'Times New Roman',
                          size: 22,
                        }),
                      ],
                    }),
                  ],
                  shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: '64748B' },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: '64748B' },
                    left: { style: BorderStyle.SINGLE, size: 4, color: '64748B' },
                    right: { style: BorderStyle.SINGLE, size: 4, color: '64748B' },
                  },
                })
              );
            });

            if (cells.length > 0) {
              rows.push(new TableRow({ children: cells }));
            }
          });

          if (rows.length > 0) {
            children.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows,
              })
            );
          }
          return;
        }

        // Paragraph / Heading / Div element
        const tag = element.tagName.toLowerCase();
        const isHeading = /^h[1-6]$/.test(tag);
        let align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.JUSTIFIED;

        const styleAlign = (element as HTMLElement).style?.textAlign;
        const className = element.className || '';

        if (styleAlign === 'center' || className.includes('ql-align-center') || isHeading) {
          align = AlignmentType.CENTER;
        } else if (styleAlign === 'right' || className.includes('ql-align-right')) {
          align = AlignmentType.RIGHT;
        } else if (styleAlign === 'left' || className.includes('ql-align-left')) {
          align = AlignmentType.LEFT;
        }

        const runs: TextRun[] = [];

        // Helper to recursively parse node children (strong, em, text, br)
        const parseNodes = (node: Node, bold = isHeading, italic = false, underline = false) => {
          node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const txt = child.textContent || '';
              if (txt.length > 0) {
                runs.push(
                  new TextRun({
                    text: txt,
                    bold,
                    italics: italic,
                    underline: underline ? {} : undefined,
                    font: 'Times New Roman',
                    size: isHeading ? 28 : 26,
                  })
                );
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const el = child as HTMLElement;
              const childTag = el.tagName.toLowerCase();
              if (childTag === 'br') {
                runs.push(new TextRun({ break: 1 }));
              } else {
                const isB = bold || childTag === 'strong' || childTag === 'b';
                const isI = italic || childTag === 'em' || childTag === 'i';
                const isU = underline || childTag === 'u';
                parseNodes(child, isB, isI, isU);
              }
            }
          });
        };

        parseNodes(element);

        if (runs.length > 0) {
          children.push(
            new Paragraph({
              alignment: align,
              spacing: {
                after: isHeading ? 180 : 140,
                line: 360,
              },
              children: runs,
            })
          );
        } else {
          children.push(
            new Paragraph({
              alignment: align,
              spacing: { after: 140, line: 360 },
              children: [new TextRun({ text: '' })],
            })
          );
        }
      });
    } else {
      // Regex fallback for SSR
      const blocks = cleanedPageHtml.match(/<(p|div|h[1-6]|table|blockquote)[\s\S]*?<\/\1>/gi) || [cleanedPageHtml];

      blocks.forEach((block) => {
        let align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.JUSTIFIED;
        if (block.includes('ql-align-center') || /text-align:\s*center/i.test(block)) {
          align = AlignmentType.CENTER;
        } else if (block.includes('ql-align-right') || /text-align:\s*right/i.test(block)) {
          align = AlignmentType.RIGHT;
        } else if (block.includes('ql-align-left') || /text-align:\s*left/i.test(block)) {
          align = AlignmentType.LEFT;
        }

        const isHeading = /^<h[1-6]/i.test(block);
        const innerContent = block.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
        const runs: TextRun[] = [];

        const tokens = innerContent.split(/(<[^>]+>)/g);
        let isBold = isHeading;
        let isItalic = false;
        let isUnderline = false;

        tokens.forEach((token) => {
          if (/^<strong\b|^<b\b/i.test(token)) isBold = true;
          else if (/^<\/strong\b|^<\/b\b/i.test(token)) isBold = false;
          else if (/^<em\b|^<i\b/i.test(token)) isItalic = true;
          else if (/^<\/em\b|^<\/i\b/i.test(token)) isItalic = false;
          else if (/^<u\b/i.test(token)) isUnderline = true;
          else if (/^<\/u\b/i.test(token)) isUnderline = false;
          else if (/^<br\b/i.test(token)) {
            runs.push(new TextRun({ break: 1 }));
          } else if (!token.startsWith('<')) {
            const text = token
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&ndash;/g, '–')
              .replace(/&mdash;/g, '—')
              .replace(/&#39;/g, "'");

            if (text.length > 0) {
              runs.push(
                new TextRun({
                  text,
                  bold: isBold,
                  italics: isItalic,
                  underline: isUnderline ? {} : undefined,
                  font: 'Times New Roman',
                  size: isHeading ? 28 : 26,
                })
              );
            }
          }
        });

        if (runs.length > 0) {
          children.push(
            new Paragraph({
              alignment: align,
              spacing: {
                after: isHeading ? 180 : 140,
                line: 360,
              },
              children: runs,
            })
          );
        } else {
          children.push(
            new Paragraph({
              alignment: align,
              spacing: { after: 140, line: 360 },
              children: [new TextRun({ text: '' })],
            })
          );
        }
      });
    }
  });

  // Guarantee at least one paragraph exists to prevent OpenXML schema error
  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title || 'Certified Court Pleading',
            font: 'Times New Roman',
            bold: true,
            size: 28,
          }),
        ],
      })
    );
  }

  return new Document({
    title,
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // 210mm (Exact ISO 216 A4 standard)
              height: 16838, // 297mm (Exact ISO 216 A4 standard)
            },
            margin: {
              top: 1080, // 0.75 inch (19mm court standard)
              bottom: 1080,
              left: 1080,
              right: 1080,
            },
          },
        },
        children,
      },
    ],
  });
}

/**
 * Triggers a native download of the generated .docx file in the browser.
 * Uses Packer.toBase64String and Uint8Array binary reconstruction to ensure
 * 100% valid zip binary streams that modern browsers cannot corrupt.
 */
export async function downloadDocxFile(html: string, filename: string, title?: string): Promise<void> {
  const doc = buildDocxFromHtml(html, title || filename);
  const base64 = await Packer.toBase64String(doc);

  // Decode base64 to pure binary Uint8Array
  const binaryString = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const docxBlob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const baseName = filename.replace(/\.docx$/i, '').replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const safeFilename = `${baseName || 'Court_Pleading'}.docx`;

  const url = URL.createObjectURL(docxBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = safeFilename;
  a.setAttribute('download', safeFilename);
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  }, 5000);
}
