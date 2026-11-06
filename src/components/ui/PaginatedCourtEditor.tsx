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
  PanelLeftClose,
  PanelLeftOpen,
  SplitSquareVertical,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import {
  A4_SPECS,
  splitHtmlIntoA4Pages,
  combineA4PagesIntoHtml,
  ensurePleadingHasPageBreaks,
  autoPaginateHtmlByHeight,
} from '@/utils/courtPagingUtils';

export interface PaginatedCourtEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  documentTitle?: string;
  initialPageSize?: 'a4' | 'legal';
  courtLevel?: string;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
}

export {
  splitHtmlIntoA4Pages,
  combineA4PagesIntoHtml,
  ensurePleadingHasPageBreaks,
  autoPaginateHtmlByHeight,
};

// Singleton Quill module registration cache (runs ONCE globally, preventing page-switching lag)
let quillSetupPromise: Promise<any> | null = null;

const ensureQuillConfigured = async () => {
  if (typeof window === 'undefined') return null;
  if ((window as any).__QUILL_INITIALIZED__) return (window as any).Quill;

  if (!quillSetupPromise) {
    quillSetupPromise = (async () => {
      const { Quill } = await import('react-quill-new');
      (window as any).Quill = Quill;

      // 1. Custom Font Families
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
      Quill.register({
        'formats/marginLeft': MarginLeftStyle,
        'formats/marginRight': MarginRightStyle,
        'formats/textIndent': TextIndentStyle,
        'formats/paddingLeft': PaddingLeftStyle,
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

      // 7. Image Resizer Blot Formatter
      try {
        const BlotFormatter = (await import('@enzedonline/quill-blot-formatter2')).default;
        if (!Quill.imports['modules/blotFormatter']) {
          Quill.register('modules/blotFormatter', BlotFormatter);
        }
      } catch {}

      (window as any).__QUILL_INITIALIZED__ = true;
      return Quill;
    })();
  }

  return quillSetupPromise;
};

// Clean HTML export helper without editor artifacts
const getCleanHtml = (element: Element): string => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ql-html-card').forEach((card) => {
    const child = card.firstElementChild;
    if (child) card.replaceWith(child);
  });
  clone.querySelectorAll('.court-page-break, [data-page-break="true"]').forEach((pb) => {
    (pb as HTMLElement).removeAttribute('style');
    pb.innerHTML = '';
  });
  let html = clone.innerHTML;
  html = html
    .replace(/<p(?:\s+[^>]*)?>\s*(<p(?:\s+[^>]*)?>)/gi, '$1')
    .replace(/(<\/p>)\s*<\/p>/gi, '$1');
  return html.trim();
};

export default function PaginatedCourtEditor({
  value,
  onChange,
  placeholder = 'Type or review your certified court pleading here...',
  documentTitle = 'Certified Court Pleading',
  initialPageSize = 'a4',
  courtLevel = 'High Court',
  saveStatus,
}: PaginatedCourtEditorProps) {
  const editorId = useId().replace(/:/g, '');
  const toolbarMountRef = useRef<HTMLDivElement>(null);
  const activeEditorMountRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedValue = useRef<string>('');
  const isInternalChange = useRef<boolean>(false);
  const isSpilloverProcessing = useRef<boolean>(false);

  // Exact ISO 216 Dimensions
  const pageSizeSpecs = {
    widthPx: A4_SPECS.widthPx,
    heightPx: initialPageSize === 'legal' ? 1344 : A4_SPECS.heightPx,
    maxContentHeightPx: initialPageSize === 'legal' ? 1160 : A4_SPECS.maxContentHeightPx,
    aspectRatio: initialPageSize === 'legal' ? '8.5 / 14' : A4_SPECS.aspectRatio,
  };

  const [zoom, setZoom] = useState<number>(100);
  const [margins, setMargins] = useState({ marginLeft: 0, marginRight: 0, textIndent: 0 });
  const [showOutline, setShowOutline] = useState<boolean>(true);
  const [saveIndicator, setSaveIndicator] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const effectiveSaveStatus = saveStatus ?? saveIndicator;

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
        return getCleanHtml(editorInner);
      }
    }
    return null;
  }, []);

  /**
   * CRITICAL GOOGLE DOCS AUTOMATIC OVERFLOW SPILLOVER ENGINE
   * When text in the active A4 sheet exceeds maxContentHeightPx:
   * 1. Detect which block element crosses the bottom threshold
   * 2. Move overflowing elements onto the NEXT A4 page
   * 3. If no next page exists, automatically create a new sheet!
   * 4. Keep typing cursor seamless
   */
  const checkAndHandleContentOverflow = useCallback(() => {
    if (isSpilloverProcessing.current || !activeEditorMountRef.current || !quillInstance.current) {
      return;
    }

    const editorInner = activeEditorMountRef.current.querySelector('.ql-editor') as HTMLElement | null;
    if (!editorInner) return;

    // Check if the content height exceeds the rigid A4 boundary
    const scrollHeight = editorInner.scrollHeight;
    const maxHeight = pageSizeSpecs.maxContentHeightPx;

    if (scrollHeight <= maxHeight) return;

    isSpilloverProcessing.current = true;

    try {
      // Find all direct children blocks of .ql-editor
      const childNodes = Array.from(editorInner.children) as HTMLElement[];
      const overflowingBlocks: string[] = [];

      for (let i = childNodes.length - 1; i >= 0; i--) {
        const node = childNodes[i];
        const bottomEdge = node.offsetTop + node.offsetHeight;

        // If this element extends beyond the A4 page boundary
        if (bottomEdge > maxHeight && childNodes.length > 1) {
          overflowingBlocks.unshift(node.outerHTML);
          node.remove();
        } else {
          break;
        }
      }

      if (overflowingBlocks.length > 0) {
        const remainingHtml = getCleanHtml(editorInner);
        const overflowHtml = overflowingBlocks.join('\n');

        setPages((prevPages) => {
          const updated = [...prevPages];
          updated[activePageIndex] = remainingHtml;

          const nextPageIndex = activePageIndex + 1;
          if (nextPageIndex < updated.length) {
            // Prepend overflowing blocks to the next page
            updated[nextPageIndex] = overflowHtml + '\n' + updated[nextPageIndex];
          } else {
            // Append brand new A4 page sheet
            updated.push(overflowHtml);
          }

          const combined = combineA4PagesIntoHtml(updated);
          lastEmittedValue.current = combined;
          isInternalChange.current = true;
          if (onChangeRef.current) onChangeRef.current(combined);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Auto-overflow check notice:', err);
    } finally {
      setTimeout(() => {
        isSpilloverProcessing.current = false;
      }, 50);
    }
  }, [activePageIndex, pageSizeSpecs.maxContentHeightPx]);

  // Initialize and bind Quill instance to active A4 sheet
  useEffect(() => {
    let mounted = true;

    const initActiveQuill = async () => {
      if (typeof window === 'undefined' || !activeEditorMountRef.current) return;

      const Quill = await ensureQuillConfigured();
      if (!mounted || !Quill) return;

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
        const quill = new Quill(activeEditorMountRef.current, {
          theme: 'snow',
          placeholder,
          bounds: document.body,
          modules: {
            toolbar: {
              container: [
                [{ font: ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier-new', 'georgia'] }],
                [{ size: ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '32px'] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ lineHeight: ['1.0', '1.15', '1.5', '2.0', '2.5'] }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['blockquote', 'link'],
                ['clean'],
              ],
            },
            history: { delay: 600, maxStack: 100, userOnly: true },
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
            handleInsertPageBreak();
            return false;
          },
        });

        // Listen for live changes
        quill.on('text-change', () => {
          setSaveIndicator('unsaved');

          if (!activeEditorMountRef.current) return;
          const editorInner = activeEditorMountRef.current.querySelector('.ql-editor');
          if (editorInner) {
            const cleanHtml = getCleanHtml(editorInner);
            setPages((prevPages) => {
              const updated = [...prevPages];
              updated[activePageIndex] = cleanHtml;
              const combined = combineA4PagesIntoHtml(updated);
              lastEmittedValue.current = combined;
              isInternalChange.current = true;
              if (onChangeRef.current) onChangeRef.current(combined);
              return updated;
            });

            // Check for content overflow in real-time
            checkAndHandleContentOverflow();
          }
        });
      } catch (err) {
        console.error('Failed to initialize Quill on A4 sheet:', err);
      }
    };

    initActiveQuill();

    return () => {
      mounted = false;
    };
  }, [activePageIndex]);

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

    // Smooth scroll page into view
    setTimeout(() => {
      const targetEl = document.getElementById(`court-a4-page-${targetIndex + 1}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
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

  // Insert Page Break at current cursor (splits content onto new page)
  const handleInsertPageBreak = () => {
    if (!quillInstance.current) {
      handleAddNewPage();
      return;
    }

    const range = quillInstance.current.getSelection();
    if (!range) {
      handleAddNewPage();
      return;
    }

    const currentHtml = syncCurrentPageContent();
    if (!currentHtml) {
      handleAddNewPage();
      return;
    }

    // Split content at cursor position
    const totalLength = quillInstance.current.getLength();
    const splitIndex = range.index;

    // Get HTML after cursor
    const beforeDelta = quillInstance.current.getContents(0, splitIndex);
    const afterDelta = quillInstance.current.getContents(splitIndex, totalLength - splitIndex);

    // Create temp containers to extract HTML
    const tempQuillContainer = document.createElement('div');
    const QuillClass = (window as any).Quill;
    if (QuillClass) {
      const tempQ = new QuillClass(tempQuillContainer);
      tempQ.setContents(beforeDelta);
      const beforeHtml = getCleanHtml(tempQuillContainer.querySelector('.ql-editor') || tempQuillContainer);

      tempQ.setContents(afterDelta);
      const afterHtml = getCleanHtml(tempQuillContainer.querySelector('.ql-editor') || tempQuillContainer);

      setPages((prev) => {
        const updated = [...prev];
        updated[activePageIndex] = beforeHtml || '<p><br></p>';
        updated.splice(activePageIndex + 1, 0, afterHtml || '<p><br></p>');
        const combined = combineA4PagesIntoHtml(updated);
        lastEmittedValue.current = combined;
        isInternalChange.current = true;
        if (onChangeRef.current) onChangeRef.current(combined);
        return updated;
      });

      setActivePageIndex((prev) => prev + 1);
    } else {
      handleAddNewPage();
    }
  };

  // Delete an A4 page sheet
  const handleDeletePage = (indexToDelete: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  // Auto-partition whole document using deterministic DOM height calculation
  const handleAutoPaginateSections = () => {
    const currentHtml = syncCurrentPageContent();
    const fullDoc =
      currentHtml !== null
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
          SCOPED A4 SHEET TYPOGRAPHY & WORKSPACE CSS
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .google-docs-court-editor-${editorId} * {
          box-sizing: border-box;
        }

        /* Google Docs Clean Toolbar Styling */
        .google-docs-court-editor-${editorId} .ql-toolbar.ql-snow {
          border: none !important;
          background: #F8FAFC !important;
          padding: 6px 14px !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 3px !important;
        }

        .google-docs-court-editor-${editorId} .ql-toolbar .ql-formats {
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 1px !important;
        }

        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font {
          width: 145px !important;
        }
        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
        .google-docs-court-editor-${editorId} .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
          content: "Times New Roman" !important;
          font-family: 'Times New Roman', serif !important;
        }

        /* ─────────────────────────────────────────────────────────────
           THE LAXMAN-REKHA: RIGID MATHEMATICAL A4 SHEET (210 x 297 mm)
           WIDTH: 816px | HEIGHT: 1154px | RATIO: 1 : 1.414 (EXACT)
        ───────────────────────────────────────────────────────────── */
        .google-docs-court-editor-${editorId} .court-a4-page-sheet {
          width: ${pageSizeSpecs.widthPx}px !important;
          height: ${pageSizeSpecs.heightPx}px !important;
          min-height: ${pageSizeSpecs.heightPx}px !important;
          max-height: ${pageSizeSpecs.heightPx}px !important;
          aspect-ratio: ${pageSizeSpecs.aspectRatio} !important;
          background: #FFFFFF !important;
          box-shadow: 0 1px 3px rgba(60,64,67,0.15), 0 4px 8px 3px rgba(60,64,67,0.15) !important;
          margin: 0 auto 28px auto !important;
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
          padding: 48px 72px !important;
          font-family: 'Times New Roman', Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          text-align: justify !important;
          box-sizing: border-box !important;
          outline: none !important;
          overflow-y: hidden !important; /* Zero ugly scrollbars inside sheet */
        }

        /* Inactive Page Static Body */
        .google-docs-court-editor-${editorId} .a4-static-content {
          height: 100% !important;
          padding: 48px 72px !important;
          font-family: 'Times New Roman', Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          text-align: justify !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        .google-docs-court-editor-${editorId} .court-page-break,
        .google-docs-court-editor-${editorId} .page-break-indicator,
        .google-docs-court-editor-${editorId} .page-break-badge,
        .google-docs-court-editor-${editorId} .page-break-line {
          display: none !important;
        }

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
          margin-top: 12pt !important;
          margin-bottom: 8pt !important;
        }

        .google-docs-court-editor-${editorId} table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 10pt 0 !important;
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

        /* PRINT STYLES: Multi-Page A4 Sheet Separation without Browser Header/Footer */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important; /* Zero margin suppresses browser default header (date, time, title) and footer (url, page count) */
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
            overflow: visible !important;
            width: 100% !important;
          }
          .google-docs-court-editor-${editorId} .no-print-bar,
          .google-docs-court-editor-${editorId} .no-print,
          .google-docs-court-editor-${editorId} .no-print-area {
            display: none !important;
          }
          .google-docs-court-editor-${editorId} {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            width: 100% !important;
          }
          .google-docs-court-editor-${editorId} .court-workspace-container {
            height: auto !important;
            min-height: unset !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
          }
          .google-docs-court-editor-${editorId} .court-desk-viewport {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            min-height: unset !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
          }
          .google-docs-court-editor-${editorId} .court-desk-viewport > div {
            transform: none !important;
            display: block !important;
            width: 100% !important;
          }
          .google-docs-court-editor-${editorId} .court-a4-page-sheet {
            display: flex !important;
            flex-direction: column !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            padding: 22mm 18mm 20mm 22mm !important;
            box-sizing: border-box !important;
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            background: white !important;
          }
          .google-docs-court-editor-${editorId} .court-a4-page-sheet:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .google-docs-court-editor-${editorId} .ql-editor,
          .google-docs-court-editor-${editorId} .a4-static-content {
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 1: GOOGLE DOCS TOP CONTROL STRIP
      ───────────────────────────────────────────────────────────── */}
      <div className="no-print-bar bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Document Title & Auto-Save Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#0B2242]">
            <FileText className="size-4 text-[#CAA438]" />
            <span className="font-merriweather truncate max-w-[200px] sm:max-w-xs">{documentTitle}</span>
          </div>

          {/* Cloud Auto-Save Status Pill */}
          <div className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {effectiveSaveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Saved to cloud</span>
              </>
            ) : effectiveSaveStatus === 'saving' ? (
              <>
                <RotateCw className="size-3 text-[#CAA438] animate-spin" />
                <span className="text-[#CAA438] font-semibold">Saving to cloud...</span>
              </>
            ) : (
              <>
                <Clock className="size-3 text-amber-500" />
                <span className="text-amber-600 font-semibold">Editing (pause to auto-save)</span>
              </>
            )}
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 bg-[#0B2242]/10 text-[#0B2242] px-2 py-0.5 rounded text-[11px] font-mono font-bold">
            {initialPageSize === 'legal' ? 'Legal Standard' : 'A4 Standard (210 × 297 mm)'}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Outline Sidebar */}
          <button
            type="button"
            onClick={() => setShowOutline(!showOutline)}
            className="p-1 hover:bg-[#F1F5F9] text-slate-700 hover:text-[#0B2242] rounded border border-[#CBD5E1] bg-white transition-colors cursor-pointer shadow-2xs"
            title={showOutline ? 'Hide Page Navigator' : 'Show Page Navigator'}
          >
            {showOutline ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
          </button>

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

          {/* Split / Page Break Button */}
          <button
            type="button"
            onClick={handleInsertPageBreak}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0B2242] hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-2xs"
            title="Insert Page Break at cursor (Ctrl+Enter)"
          >
            <SplitSquareVertical className="size-3 text-[#CAA438]" />
            <span className="hidden sm:inline">Page Break</span>
          </button>

          {/* + ADD NEW A4 SHEET */}
          <button
            type="button"
            onClick={handleAddNewPage}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0B2242] text-white text-xs font-bold hover:bg-[#15345E] transition-all cursor-pointer shadow-xs"
            title="Add a brand new exact A4 sheet"
          >
            <PlusSquare className="size-3.5 text-[#CAA438]" />
            <span>+ New Sheet</span>
          </button>

          {/* Auto-Paginate Whole Document */}
          <button
            type="button"
            onClick={handleAutoPaginateSections}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0B2242] hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-2xs"
            title="Auto-paginate document across A4 sheets based on height"
          >
            <Layers className="size-3 text-[#CAA438]" />
            <span className="hidden sm:inline">Re-Paginate</span>
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
        <div style={{ width: `${pageSizeSpecs.widthPx * (zoom / 100)}px`, maxWidth: '100%' }}>
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
          LEVEL 4: WORKSPACE (With optional left page outline + desk)
      ───────────────────────────────────────────────────────────── */}
      <div className="court-workspace-container flex w-full" style={{ minHeight: '720px', height: 'calc(100vh - 220px)', maxHeight: '1200px', overflow: 'hidden' }}>
        {/* Left: Google Docs Style Page Thumbnails Navigator */}
        {showOutline && (
          <div className="no-print-bar w-56 border-r border-[#CBD5E1] bg-[#F8FAFC] p-3 overflow-y-auto shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8F0]">
              <span className="font-mono text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                Sheets ({pages.length})
              </span>
              <button
                type="button"
                onClick={handleAddNewPage}
                className="text-[#0B2242] hover:text-[#15345E] p-0.5"
                title="Add Page"
              >
                <PlusSquare className="size-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {pages.map((p, idx) => {
                const isActive = activePageIndex === idx;
                const snippet = p.replace(/<[^>]+>/g, '').trim().slice(0, 40) || 'Empty Sheet';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPage(idx)}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white border-2 border-[#0B2242] shadow-xs'
                        : 'bg-white/70 hover:bg-white border border-[#E2E8F0]'
                    }`}
                  >
                    <div className="w-7 h-9 border border-slate-300 rounded bg-white shrink-0 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600 shadow-2xs">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`block text-xs font-bold truncate ${isActive ? 'text-[#0B2242]' : 'text-slate-700'}`}>
                        Page {idx + 1}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        {snippet}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: DESK WORKSPACE WITH EXACT A4 PAPER SHEETS */}
        <div className="court-desk-viewport flex-1 py-10 px-6 overflow-y-auto flex flex-col items-center" style={{ background: '#E8EAED' }}>
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
                      : 'hover:ring-1 hover:ring-slate-400 opacity-98 hover:opacity-100'
                  }`}
                  style={{
                    width: `${pageSizeSpecs.widthPx}px`,
                    height: `${pageSizeSpecs.heightPx}px`,
                    minHeight: `${pageSizeSpecs.heightPx}px`,
                    maxHeight: `${pageSizeSpecs.heightPx}px`,
                    aspectRatio: pageSizeSpecs.aspectRatio,
                  }}
                >
                  {/* Page Top Header (subtle matter title & court name) */}
                  <div className="no-print-bar px-16 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 select-none">
                    <span className="truncate max-w-sm uppercase tracking-wider font-semibold">
                      {courtLevel} · {documentTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500">
                        Page {index + 1} of {pages.length}
                      </span>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeletePage(index, e)}
                          className="hover:text-red-600 p-0.5 rounded transition-colors"
                          title="Delete this page"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
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

                  {/* Page Bottom Footer with Centered Page Number */}
                  <div className="no-print-bar no-print px-16 py-3 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 font-serif select-none">
                    <span>— Page {index + 1} of {pages.length} —</span>
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
    </div>
  );
}
