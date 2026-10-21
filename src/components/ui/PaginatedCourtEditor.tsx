'use client';

import React, { useEffect, useRef, useState, useCallback, useId } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import DocumentRuler from './DocumentRuler';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  Scissors,
  Bookmark,
  RotateCcw,
  RotateCw,
  Sparkles,
  Layers,
  PlusSquare,
  Trash2,
  ChevronDown,
  FilePlus2,
} from 'lucide-react';

export interface PaginatedCourtEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  documentTitle?: string;
  initialPageSize?: 'a4' | 'legal';
  courtLevel?: string;
}

import {
  splitHtmlIntoA4Pages,
  combineA4PagesIntoHtml,
  ensurePleadingHasPageBreaks,
} from '@/utils/courtPagingUtils';

export {
  splitHtmlIntoA4Pages,
  combineA4PagesIntoHtml,
  ensurePleadingHasPageBreaks,
};

// Clean HTML export without internal editor wrapper artifacts
const getCleanExportHtml = (editorInner: Element): string => {
  const clone = editorInner.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ql-html-card').forEach((card) => {
    const child = card.firstElementChild;
    if (child) {
      card.replaceWith(child);
    }
  });

  clone.querySelectorAll('.court-page-break, [data-page-break="true"]').forEach((pb) => {
    (pb as HTMLElement).removeAttribute('style');
    pb.innerHTML = '';
  });

  let html = clone.innerHTML;
  html = html.replace(/<p(?:\s+[^>]*)?>\s*(<p(?:\s+[^>]*)?>)/gi, '$1').replace(/(<\/p>)\s*<\/p>/gi, '$1');
  return html;
};

export default function PaginatedCourtEditor({
  value,
  onChange,
  placeholder = 'Type or review your certified court pleading here...',
  documentTitle = 'Certified Court Pleading',
  initialPageSize = 'a4',
  courtLevel = 'High Court',
}: PaginatedCourtEditorProps) {
  const editorId = useId().replace(/:/g, '');
  const toolbarMountRef = useRef<HTMLDivElement>(null);
  const activeEditorMountRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedValue = useRef<string>('');
  const isInternalChange = useRef<boolean>(false);

  // Exact ISO 216 Standard A4 Dimensions (210mm x 297mm)
  // Exact 1 : sqrt(2) Aspect Ratio (1 : 1.41421356)
  // At 96 DPI: 816px width x 1154px height (816 * 1.41421356 = 1154.0px)
  const a4Specs = {
    widthPx: 816,
    heightPx: 1154,
    aspectRatio: '210 / 297',
  };

  const [zoom, setZoom] = useState<number>(100);
  const [margins, setMargins] = useState({ marginLeft: 0, marginRight: 0, textIndent: 0 });
  const [toolbarHeight, setToolbarHeight] = useState(0);

  // Discrete A4 pages array: each item is 1 authentic A4 sheet
  const [pages, setPages] = useState<string[]>(() => {
    const initial = splitHtmlIntoA4Pages(value);
    return initial.length > 0 ? initial : ['<p><br></p>'];
  });
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Sync latest onChange ref
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync external value changes into pages state
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (value !== undefined && value !== lastEmittedValue.current) {
      const parsedPages = splitHtmlIntoA4Pages(value);
      setPages(parsedPages);
      if (activePageIndex >= parsedPages.length) {
        setActivePageIndex(Math.max(0, parsedPages.length - 1));
      }
    }
  }, [value, activePageIndex]);

  // Save current active Quill content back into pages state
  const syncCurrentPageContent = useCallback(() => {
    if (quillInstance.current && activeEditorMountRef.current) {
      const editorInner = activeEditorMountRef.current.querySelector('.ql-editor');
      if (editorInner) {
        const cleanHtml = getCleanExportHtml(editorInner);
        return cleanHtml;
      }
    }
    return null;
  }, []);

  // Initialize and bind Quill instance to the active A4 page sheet
  useEffect(() => {
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const initActiveQuill = async () => {
      if (typeof window === 'undefined' || !activeEditorMountRef.current) return;

      // Clean up previous instance cleanly
      if (quillInstance.current) {
        try {
          quillInstance.current.off('text-change');
          quillInstance.current.off('selection-change');
        } catch (_) {}
        quillInstance.current = null;
      }

      activeEditorMountRef.current.innerHTML = '';

      try {
        const { Quill } = await import('react-quill-new');
        (window as any).Quill = Quill;

        // 1. Custom Font Families (Standard Court Fonts)
        const Font = Quill.import('formats/font') as any;
        Font.whitelist = ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier-new', 'georgia'];
        Quill.register(Font, true);

        // 2. Custom Font Sizes
        const SizeStyle = Quill.import('attributors/style/size') as any;
        SizeStyle.whitelist = ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '32px'];
        Quill.register(SizeStyle, true);

        // 3. Line Spacing
        const Parchment = Quill.import('parchment') as any;
        const LineHeightStyle = new Parchment.StyleAttributor('lineHeight', 'line-height', {
          scope: Parchment.Scope.BLOCK,
          whitelist: ['1.0', '1.15', '1.5', '2.0', '2.5'],
        });
        Quill.register({ 'formats/lineHeight': LineHeightStyle }, true);

        // 4. Custom List Styles
        const ListStyleAttributor = new Parchment.StyleAttributor('listStyle', 'list-style-type', {
          scope: Parchment.Scope.BLOCK,
          whitelist: ['decimal', 'decimal-paren', 'decimal-nested', 'roman-alpha', 'upper-alpha', 'upper-roman'],
        });
        Quill.register({ 'formats/listStyle': ListStyleAttributor }, true);

        // 5. Margin Attributors for Ruler
        const MarginLeftStyle = new Parchment.StyleAttributor('marginLeft', 'margin-left', { scope: Parchment.Scope.BLOCK });
        const MarginRightStyle = new Parchment.StyleAttributor('marginRight', 'margin-right', { scope: Parchment.Scope.BLOCK });
        const TextIndentStyle = new Parchment.StyleAttributor('textIndent', 'text-indent', { scope: Parchment.Scope.BLOCK });
        const PaddingLeftStyle = new Parchment.StyleAttributor('paddingLeft', 'padding-left', { scope: Parchment.Scope.BLOCK });
        const ListGapStyle = new Parchment.StyleAttributor('listGap', '--list-gap', { scope: Parchment.Scope.BLOCK });
        Quill.register({
          'formats/marginLeft': MarginLeftStyle,
          'formats/marginRight': MarginRightStyle,
          'formats/textIndent': TextIndentStyle,
          'formats/paddingLeft': PaddingLeftStyle,
          'formats/listGap': ListGapStyle,
        }, true);

        // 6. HtmlCard Blot
        const BlockEmbed = Quill.import('blots/block/embed') as any;
        class HtmlCardBlot extends BlockEmbed {
          static blotName = 'htmlCard';
          static tagName = 'div';
          static className = 'ql-html-card';
          static create(val: string) {
            const node = super.create() as HTMLElement;
            node.setAttribute('contenteditable', 'false');
            node.innerHTML = val;
            return node;
          }
          static value(node: HTMLElement) {
            return node.innerHTML;
          }
        }
        if (!Quill.imports['formats/htmlCard']) {
          Quill.register(HtmlCardBlot, true);
        }

        // 7. Blot Formatter for Resizing Images
        const BlotFormatter = (await import('@enzedonline/quill-blot-formatter2')).default;
        if (!Quill.imports['modules/blotFormatter']) {
          Quill.register('modules/blotFormatter', BlotFormatter);
        }

        if (!mounted) return;

        // Initialize Quill with comprehensive rich-text toolbar
        const quill = new Quill(activeEditorMountRef.current, {
          theme: 'snow',
          placeholder,
          bounds: document.body,
          modules: {
            toolbar: {
              container: [
                [{ font: Font.whitelist }],
                [{ size: SizeStyle.whitelist }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ lineHeight: LineHeightStyle.whitelist }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ align: [] }],
                [{ list: 'ordered' }, { listStyle: ['decimal', 'decimal-paren', 'decimal-nested', 'roman-alpha', 'upper-alpha', 'upper-roman'] }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['blockquote', 'link', 'image'],
                ['clean'],
              ],
            },
            history: { delay: 1000, maxStack: 100, userOnly: true },
            blotFormatter: {},
          },
        });

        quillInstance.current = quill;

        // Mount toolbar into top sticky container
        const generatedToolbar = activeEditorMountRef.current.parentElement?.querySelector('.ql-toolbar');
        if (generatedToolbar && toolbarMountRef.current) {
          toolbarMountRef.current.innerHTML = '';
          toolbarMountRef.current.appendChild(generatedToolbar);
        }

        // Load active page content
        const currentPageContent = pages[activePageIndex] || '<p><br></p>';
        quill.clipboard.dangerouslyPasteHTML(currentPageContent);

        // Keyboard Shortcut: Ctrl+Enter / Cmd+Enter inserts a new A4 sheet
        quill.keyboard.addBinding({
          key: 13,
          shortKey: true,
          handler: () => {
            handleAddNewPage();
            return false;
          },
        });

        // Listen for changes
        quill.on('text-change', () => {
          if (!activeEditorMountRef.current) return;
          const editorInner = activeEditorMountRef.current.querySelector('.ql-editor');
          if (editorInner) {
            const cleanHtml = getCleanExportHtml(editorInner);
            setPages((prevPages) => {
              const updated = [...prevPages];
              updated[activePageIndex] = cleanHtml;
              const combined = combineA4PagesIntoHtml(updated);
              lastEmittedValue.current = combined;
              isInternalChange.current = true;
              if (onChangeRef.current) onChangeRef.current(combined);
              return updated;
            });
          }
        });

        // Sync toolbar styles on selection
        quill.on('selection-change', (range: any) => {
          if (range && toolbarMountRef.current) {
            const formats = quill.getFormat(range);
            const sizePicker = toolbarMountRef.current.querySelector('.ql-picker.ql-size') as HTMLElement | null;
            if (sizePicker && formats.size) sizePicker.style.setProperty('--active-size', `"${formats.size}"`);

            const fontPicker = toolbarMountRef.current.querySelector('.ql-picker.ql-font') as HTMLElement | null;
            if (fontPicker && formats.font) fontPicker.style.setProperty('--active-font', `"${formats.font}"`);

            const lhPicker = toolbarMountRef.current.querySelector('.ql-picker.ql-lineHeight') as HTMLElement | null;
            if (lhPicker && formats.lineHeight) lhPicker.style.setProperty('--active-line-height', `"${formats.lineHeight}"`);
          }
        });

        // ResizeObserver on toolbar
        if (toolbarMountRef.current) {
          resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              setToolbarHeight(entry.target.getBoundingClientRect().height);
            }
          });
          resizeObserver.observe(toolbarMountRef.current);
          setToolbarHeight(toolbarMountRef.current.getBoundingClientRect().height);
        }
      } catch (err) {
        console.error('Failed to initialize A4 Court Page Editor:', err);
      }
    };

    initActiveQuill();

    return () => {
      mounted = false;
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [activePageIndex]); // Re-bind Quill whenever active page changes

  // Switch to another page sheet cleanly
  const handleSelectPage = (targetIndex: number) => {
    if (targetIndex === activePageIndex) return;
    const currentHtml = syncCurrentPageContent();
    if (currentHtml !== null) {
      setPages((prev) => {
        const updated = [...prev];
        updated[activePageIndex] = currentHtml;
        return updated;
      });
    }
    setActivePageIndex(targetIndex);
  };

  // Add a brand new exact A4 sheet
  const handleAddNewPage = () => {
    const currentHtml = syncCurrentPageContent();
    setPages((prev) => {
      const updated = [...prev];
      if (currentHtml !== null) {
        updated[activePageIndex] = currentHtml;
      }
      const insertAt = activePageIndex + 1;
      updated.splice(insertAt, 0, '<p><br></p>');
      const combined = combineA4PagesIntoHtml(updated);
      lastEmittedValue.current = combined;
      isInternalChange.current = true;
      if (onChangeRef.current) onChangeRef.current(combined);
      return updated;
    });
    setActivePageIndex((prev) => prev + 1);
  };

  // Delete the current A4 page sheet
  const handleDeletePage = (indexToDelete: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      const combined = combineA4PagesIntoHtml(updated);
      lastEmittedValue.current = combined;
      isInternalChange.current = true;
      if (onChangeRef.current) onChangeRef.current(combined);
      return updated;
    });
    if (activePageIndex >= indexToDelete) {
      setActivePageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  // Auto-partition into 11 discrete A4 court pleading sheets
  const handleAutoPaginateSections = () => {
    const currentHtml = syncCurrentPageContent();
    const fullDoc = currentHtml !== null
      ? combineA4PagesIntoHtml(pages.map((p, idx) => (idx === activePageIndex ? currentHtml : p)))
      : combineA4PagesIntoHtml(pages);

    const partitionedPages = splitHtmlIntoA4Pages(fullDoc);
    setPages(partitionedPages);
    setActivePageIndex(0);
    const combined = combineA4PagesIntoHtml(partitionedPages);
    lastEmittedValue.current = combined;
    isInternalChange.current = true;
    if (onChangeRef.current) onChangeRef.current(combined);
  };

  // Undo / Redo actions
  const handleUndo = () => {
    if (quillInstance.current) quillInstance.current.history?.undo();
  };
  const handleRedo = () => {
    if (quillInstance.current) quillInstance.current.history?.redo();
  };

  return (
    <div className={`google-docs-court-editor-${editorId} flex flex-col w-full bg-[#EAEFF4] border border-[#CBD5E1] rounded-xl overflow-hidden shadow-sm`}>
      {/* ─────────────────────────────────────────────────────────────
          SCOPED A4 SHEET TYPOGRAPHY & DESK WORKSPACE CSS
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        /* Global Reset inside editor container */
        .google-docs-court-editor-${editorId} * {
          box-sizing: border-box;
        }

        /* Toolbar Custom Styling */
        .google-docs-court-editor-${editorId} .ql-toolbar.ql-snow {
          border: none !important;
          background: #F8FAFC !important;
          padding: 6px 12px !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 2px !important;
        }

        .google-docs-court-editor-${editorId} .ql-toolbar .ql-formats {
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 1px !important;
        }

        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-size {
          width: 68px !important;
        }
        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font {
          width: 145px !important;
        }

        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
          content: "Times New Roman" !important;
          font-family: 'Times New Roman', serif !important;
        }

        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-size .ql-picker-label::before {
          content: var(--active-size, "13pt") !important;
        }

        /* ─────────────────────────────────────────────────────────────
           THE LAXMAN-REKHA: RIGID, MATHEMATICAL ISO 216 A4 SHEET (210 x 297 mm)
           WIDTH: 816px | HEIGHT: 1154px | RATIO: 1 : 1.41421356 (EXACT)
           NO PAGE MAY EVER DEVIATE FROM THIS DIMENSION
        ───────────────────────────────────────────────────────────── */
        .google-docs-court-editor-${editorId} .court-a4-page-sheet {
          width: ${a4Specs.widthPx}px !important;
          height: ${a4Specs.heightPx}px !important;
          min-height: ${a4Specs.heightPx}px !important;
          max-height: ${a4Specs.heightPx}px !important;
          aspect-ratio: 210 / 297 !important;
          background: #FFFFFF !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08) !important;
          margin: 0 auto 32px auto !important;
          box-sizing: border-box !important;
          position: relative !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 2px !important;
        }

        /* Quill Container inside active sheet */
        .google-docs-court-editor-${editorId} .ql-container.ql-snow {
          border: none !important;
          font-family: 'Times New Roman', Georgia, serif !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .google-docs-court-editor-${editorId} .ql-editor {
          height: 100% !important;
          padding: 64px 72px !important;
          font-family: 'Times New Roman', Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          text-align: justify !important;
          box-sizing: border-box !important;
          outline: none !important;
          overflow-y: auto !important;
        }

        /* Inactive Page Static Body */
        .google-docs-court-editor-${editorId} .a4-static-content {
          height: 100% !important;
          padding: 64px 72px !important;
          font-family: 'Times New Roman', Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          text-align: justify !important;
          box-sizing: border-box !important;
          overflow-y: auto !important;
        }

        /* Zero Page Break Badge clutter */
        .google-docs-court-editor-${editorId} .court-page-break,
        .google-docs-court-editor-${editorId} .page-break-indicator,
        .google-docs-court-editor-${editorId} .page-break-badge,
        .google-docs-court-editor-${editorId} .page-break-line {
          display: none !important;
        }

        /* Paragraph & Heading Spacing */
        .google-docs-court-editor-${editorId} p {
          margin-bottom: 8pt !important;
        }
        .google-docs-court-editor-${editorId} h1,
        .google-docs-court-editor-${editorId} h2,
        .google-docs-court-editor-${editorId} h3 {
          font-family: 'Times New Roman', Georgia, serif !important;
          color: #000000 !important;
          font-weight: bold !important;
          text-align: center !important;
          margin-top: 14pt !important;
          margin-bottom: 8pt !important;
        }

        /* Tables inside Sheet */
        .google-docs-court-editor-${editorId} table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 12pt 0 !important;
        }
        .google-docs-court-editor-${editorId} th,
        .google-docs-court-editor-${editorId} td {
          border: 1px solid #64748B !important;
          padding: 6pt 10pt !important;
        }
        .google-docs-court-editor-${editorId} th {
          background: #F1F5F9 !important;
          font-weight: bold !important;
        }

        /* PRINT STYLES: Strict A4 Sheet Separation */
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 15mm 20mm 20mm;
          }
          .google-docs-court-editor-${editorId} .no-print-bar {
            display: none !important;
          }
          .google-docs-court-editor-${editorId} {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .google-docs-court-editor-${editorId} .court-desk-viewport {
            background: transparent !important;
            padding: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .google-docs-court-editor-${editorId} .court-a4-page-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            width: 100% !important;
            height: 100% !important;
            min-height: unset !important;
            max-height: unset !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .google-docs-court-editor-${editorId} .ql-editor,
          .google-docs-court-editor-${editorId} .a4-static-content {
            padding: 0 !important;
            overflow: visible !important;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 1: GOOGLE DOCS TOP CONTROL STRIP
      ───────────────────────────────────────────────────────────── */}
      <div className="no-print-bar bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Document Title & A4 Page Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-[#0B2242]">
            <FileText className="size-4 text-[#CAA438]" />
            <span className="font-merriweather truncate max-w-[220px] sm:max-w-xs">{documentTitle}</span>
          </div>

          <span className="inline-flex items-center gap-1 bg-[#0B2242]/10 text-[#0B2242] px-2 py-0.5 rounded text-[11px] font-mono font-bold">
            A4 Standard (210 × 297 mm · Exact 1:1.414)
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center rounded-md border border-[#CBD5E1] bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleUndo}
              className="p-1 hover:bg-[#F1F5F9] text-slate-700 hover:text-[#0B2242] rounded transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              className="p-1 hover:bg-[#F1F5F9] text-slate-700 hover:text-[#0B2242] rounded transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>

          {/* + ADD NEW A4 SHEET (Ctrl + Enter) */}
          <button
            type="button"
            onClick={handleAddNewPage}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0B2242] text-white text-xs font-bold hover:bg-[#15345E] transition-all cursor-pointer shadow-xs"
            title="Add a brand new exact A4 sheet (Ctrl + Enter)"
          >
            <PlusSquare className="size-3.5 text-[#CAA438]" />
            <span>+ New Page</span>
          </button>

          {/* Auto-Paginate 11 Sections */}
          <button
            type="button"
            onClick={handleAutoPaginateSections}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0B2242] hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-2xs"
            title="Partition all 11 court sections onto individual A4 sheets"
          >
            <Layers className="size-3 text-[#CAA438]" />
            <span className="hidden sm:inline">Paginate Sections</span>
          </button>

          {/* Zoom Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#CBD5E1] rounded-md px-1.5 py-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(75, z - 10))}
              className="text-[#64748B] hover:text-[#0B2242] p-0.5 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="size-3" />
            </button>
            <span className="font-mono text-[11px] font-bold text-[#0B2242] w-8 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="text-[#64748B] hover:text-[#0B2242] p-0.5 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="size-3" />
            </button>
          </div>

          {/* Page Counter Badge */}
          <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#0B2242] bg-[#EAEFF9] px-2.5 py-1 rounded-md border border-[#CBD5E1]">
            <Bookmark className="size-3 text-[#CAA438]" />
            <span>Sheet {activePageIndex + 1} of {pages.length}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 2: FULL RICH TEXT TOOLBAR (Sticky at Top)
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={toolbarMountRef}
        className="no-print-bar bg-[#F8FAFC] border-b border-[#CBD5E1] sticky top-0 z-30 shadow-2xs flex items-center min-h-[42px]"
      />

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 3: MARGIN RULER (Aligned 1:1 with 816px A4 Paper Sheet)
      ───────────────────────────────────────────────────────────── */}
      <div className="court-ruler-container no-print-bar bg-white border-b border-[#CBD5E1] px-4 py-0.5 overflow-hidden flex justify-center">
        <div style={{ width: `${a4Specs.widthPx * (zoom / 100)}px`, maxWidth: '100%' }}>
          <DocumentRuler
            marginLeft={margins.marginLeft}
            marginRight={margins.marginRight}
            textIndent={margins.textIndent}
            onChange={(newMargins) => {
              if (quillInstance.current) {
                if (newMargins.marginLeft !== undefined) {
                  quillInstance.current.format('marginLeft', `${newMargins.marginLeft}%`);
                }
                if (newMargins.marginRight !== undefined) {
                  quillInstance.current.format('marginRight', `${newMargins.marginRight}%`);
                }
                if (newMargins.textIndent !== undefined) {
                  quillInstance.current.format('textIndent', `${newMargins.textIndent}%`);
                }
              }
              setMargins((prev) => ({ ...prev, ...newMargins }));
            }}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 4: DESK WORKSPACE WITH RIGID, STACKED A4 PAPER SHEETS
          EVERY SINGLE SHEET IS AN EXACT 816px x 1154px (210 x 297 mm) A4 CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="court-desk-viewport w-full py-8 px-4 overflow-y-auto flex flex-col items-center min-h-[750px] max-h-[82vh]">
        <div
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex flex-col items-center"
        >
          {pages.map((pageHtml, index) => {
            const isActive = activePageIndex === index;
            return (
              <div
                key={index}
                id={`court-a4-page-${index + 1}`}
                onClick={() => handleSelectPage(index)}
                className={`court-a4-page-sheet cursor-pointer transition-all ${
                  isActive
                    ? 'ring-2 ring-[#0B2242] shadow-2xl'
                    : 'hover:ring-1 hover:ring-slate-400 opacity-95 hover:opacity-100'
                }`}
                style={{
                  width: `${a4Specs.widthPx}px`,
                  height: `${a4Specs.heightPx}px`,
                  minHeight: `${a4Specs.heightPx}px`,
                  maxHeight: `${a4Specs.heightPx}px`,
                  aspectRatio: a4Specs.aspectRatio,
                }}
              >
                {/* Floating Page Number Pill on top-right outside print */}
                <div className="no-print-bar absolute top-3 right-4 z-10 flex items-center gap-2 select-none pointer-events-none">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold tracking-wider ${
                    isActive ? 'bg-[#0B2242] text-white shadow-xs' : 'bg-slate-200/90 text-slate-600'
                  }`}>
                    Page {index + 1} of {pages.length}
                  </span>
                </div>

                {/* Sheet Body: Quill Mount or Static Rich Text */}
                <div className="flex-1 w-full h-full overflow-hidden relative">
                  {isActive ? (
                    <div ref={activeEditorMountRef} className="h-full w-full" />
                  ) : (
                    <div
                      className="a4-static-content select-text h-full w-full"
                      dangerouslySetInnerHTML={{
                        __html: pageHtml && pageHtml.trim() ? pageHtml : '<p class="text-slate-300 italic pt-6">Empty A4 Court Sheet. Click here to begin typing...</p>',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* + Add New Page Button at bottom of desk */}
          <div className="no-print-bar my-6 flex justify-center">
            <button
              type="button"
              onClick={handleAddNewPage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0B2242] text-white font-bold text-xs hover:bg-[#15345E] shadow-md transition-all cursor-pointer"
            >
              <PlusSquare className="size-4 text-[#CAA438]" />
              <span>+ Add New A4 Sheet (Sheet {pages.length + 1})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
