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
    // Clean any section badges if present so output is clean legal text
    const cleanedPageHtml = pageHtml
      .replace(/<span[^>]*class="[^"]*page-break-badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<div[^>]*class="[^"]*page-break-indicator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

    const blocks = cleanedPageHtml.match(/<(p|h[1-6]|table|blockquote)[\s\S]*?<\/\1>/gi) || [cleanedPageHtml];

    blocks.forEach((block) => {
      // ── TABLES ──
      if (/^<table/i.test(block)) {
        const rows: TableRow[] = [];
        const trMatches = block.match(/<tr[\s\S]*?<\/tr>/gi) || [];

        trMatches.forEach((trStr) => {
          const cells: TableCell[] = [];
          const cellMatches = trStr.match(/<(td|th)[\s\S]*?<\/\1>/gi) || [];

          cellMatches.forEach((cellStr) => {
            const isHeader = /^<th/i.test(cellStr);
            const text = cellStr.replace(/<[^>]+>/g, '').trim();

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
                        size: 22, // 11pt
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

      // ── PARAGRAPHS & HEADINGS ──
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

      // Split into text and tags
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
        else if (!token.startsWith('<')) {
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
                size: isHeading ? 28 : 26, // 14pt for headings, 13pt for court body
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
              after: isHeading ? 180 : 140, // 9pt / 7pt
              line: 360, // 1.5 line spacing (court standard)
            },
            children: runs,
          })
        );
      }
    });
  });

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
 */
export async function downloadDocxFile(html: string, filename: string, title?: string): Promise<void> {
  const doc = buildDocxFromHtml(html, title || filename);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
