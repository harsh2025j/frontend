"use client";
import React, { useEffect, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorId = React.useId().replace(/:/g, '');
    const containerRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);
    const onChangeRef = useRef(onChange);
    const lastEmittedValue = useRef<string>('');

    // Always keep the latest onChange handler without triggering re-renders
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        let mounted = true;

        const initEditor = async () => {
            if (typeof window === 'undefined' || !containerRef.current || quillInstance.current) return;

            try {
                // Import Quill from the installed react-quill-new package
                const { Quill } = await import('react-quill-new');

                // Bind window.Quill for plugins
                (window as any).Quill = Quill;

                // --- 1. Custom Fonts ---
                const Font = Quill.import('formats/font') as any;
                Font.whitelist = ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier-new', 'georgia'];
                Quill.register(Font, true);

                // --- 2. Custom Font Sizes (Inline Styles) ---
                const SizeStyle = Quill.import('attributors/style/size') as any;
                SizeStyle.whitelist = ['10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'];
                Quill.register(SizeStyle, true);

                // --- 3. Custom Line Height ---
                const Parchment = Quill.import('parchment') as any;
                const lineHeightConfig = {
                    scope: Parchment.Scope.BLOCK,
                    whitelist: ['1.0', '1.15', '1.5', '2.0', '2.5']
                };
                const LineHeightStyle = new Parchment.StyleAttributor('lineHeight', 'line-height', lineHeightConfig);
                Quill.register({ 'formats/lineHeight': LineHeightStyle }, true);

                // Define Custom List Style Format (to emulate Google Docs dropdowns)
                const ListStyleAttributor = new Parchment.StyleAttributor('listStyle', 'list-style-type', {
                    scope: Parchment.Scope.BLOCK,
                    whitelist: ['decimal', 'decimal-paren', 'decimal-nested', 'roman-alpha', 'upper-alpha', 'upper-roman']
                });
                Quill.register({ 'formats/listStyle': ListStyleAttributor }, true);

                // Use quill-blot-formatter, which is fully compatible with Quill 2.0
                const BlotFormatter = (await import('quill-blot-formatter')).default;

                if (!Quill.imports['modules/blotFormatter']) {
                    Quill.register('modules/blotFormatter', BlotFormatter);
                }

                if (!mounted) return;

                // Initialize raw Quill
                const quill = new Quill(containerRef.current, {
                    theme: 'snow',
                    placeholder: placeholder || 'Write your content here...',
                    bounds: document.body,
                    modules: {
                        toolbar: {
                            container: [
                                // Font and Size
                                [{ 'font': Font.whitelist }],
                                [{ 'size': SizeStyle.whitelist }],

                                // Headers
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                                // Basic formatting
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],

                                // Line height
                                [{ 'lineHeight': LineHeightStyle.whitelist }],

                                // Scripts
                                [{ 'script': 'sub' }, { 'script': 'super' }],

                                // Lists and Alignment
                                [{ 'list': 'ordered' }, { 'listStyle': ['decimal', 'decimal-paren', 'decimal-nested', 'roman-alpha', 'upper-alpha', 'upper-roman'] }, { 'list': 'bullet' }],
                                [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],

                                // Media and clean
                                ['blockquote', 'link', 'image', 'video'],
                                ['clean']
                            ],
                            handlers: {
                                'listStyle': function (this: any, value: string) {
                                    if (value) {
                                        localStorage.setItem('legaltech_last_list_style', value);
                                        this.quill.format('list', 'ordered');
                                        this.quill.format('listStyle', value);
                                    } else {
                                        this.quill.format('listStyle', false);
                                    }
                                },
                                'list': function (this: any, value: string) {
                                    if (value === 'ordered') {
                                        const formats = this.quill.getFormat();
                                        const isAlreadyOrdered = formats.list === 'ordered';
                                        if (isAlreadyOrdered) {
                                            this.quill.format('list', false);
                                            this.quill.format('listStyle', false);
                                        } else {
                                            this.quill.format('list', 'ordered');
                                            const activeStyle = localStorage.getItem('legaltech_last_list_style') || 'decimal';
                                            this.quill.format('listStyle', activeStyle);
                                        }
                                    } else if (value === 'bullet') {
                                        this.quill.format('list', 'bullet');
                                        this.quill.format('listStyle', false);
                                    } else {
                                        this.quill.format('list', false);
                                        this.quill.format('listStyle', false);
                                    }
                                }
                            }
                        },
                        // Enable the Blot Formatter for image/video resizing
                        blotFormatter: {}
                    },
                });

                quillInstance.current = quill;

                const updateToolbarLabels = () => {
                    if (!containerRef.current) return;
                    const range = quill.getSelection();
                    let targetNode: Element | null = null;

                    if (range) {
                        const [leaf] = quill.getLeaf(range.index);
                        if (leaf && leaf.domNode) {
                            targetNode = leaf.domNode instanceof Element ? leaf.domNode : leaf.domNode.parentElement;
                        }
                    }

                    if (!targetNode) {
                        const qlEditor = containerRef.current.querySelector('.ql-editor');
                        targetNode = qlEditor;
                    }

                    if (!targetNode) return;

                    const computedStyle = window.getComputedStyle(targetNode);

                    // 1. Font Size
                    const pxSize = parseFloat(computedStyle.fontSize);
                    const fontSizeStr = !isNaN(pxSize) ? `${Math.round(pxSize)}px` : '14px';

                    // 2. Font Family
                    let fontName = 'Sans Serif';
                    const computedFont = computedStyle.fontFamily.toLowerCase();
                    if (computedFont.includes('georgia')) {
                        fontName = 'Georgia';
                    } else if (computedFont.includes('courier')) {
                        fontName = 'Courier New';
                    } else if (computedFont.includes('times')) {
                        fontName = 'Times New Roman';
                    } else if (computedFont.includes('arial')) {
                        fontName = 'Arial';
                    }

                    // 3. Line Height
                    let lineHeightStr = '1.6';
                    const lhPx = parseFloat(computedStyle.lineHeight);
                    const fsPx = parseFloat(computedStyle.fontSize);
                    if (!isNaN(lhPx) && !isNaN(fsPx) && fsPx > 0) {
                        const ratio = lhPx / fsPx;
                        lineHeightStr = ratio.toFixed(2);
                        if (lineHeightStr.endsWith('.00')) {
                            lineHeightStr = lineHeightStr.substring(0, lineHeightStr.length - 3);
                        } else if (lineHeightStr.endsWith('0')) {
                            lineHeightStr = lineHeightStr.substring(0, lineHeightStr.length - 1);
                        }
                    }

                    const toolbarModule = quill.getModule('toolbar') as any;
                    const toolbarContainer = toolbarModule?.container || containerRef.current?.parentElement;
                    if (toolbarContainer) {
                        const sizePicker = toolbarContainer.querySelector('.ql-picker.ql-size') as HTMLElement | null;
                        if (sizePicker) {
                            sizePicker.style.setProperty('--active-size', `"${fontSizeStr}"`);
                        }

                        const fontPicker = toolbarContainer.querySelector('.ql-picker.ql-font') as HTMLElement | null;
                        if (fontPicker) {
                            fontPicker.style.setProperty('--active-font', `"${fontName}"`);
                        }

                        const lhPicker = toolbarContainer.querySelector('.ql-picker.ql-lineHeight') as HTMLElement | null;
                        if (lhPicker) {
                            lhPicker.style.setProperty('--active-line-height', `"${lineHeightStr}"`);
                        }
                    }
                };

                // Set initial value
                if (value) {
                    const clipboard = quill.getModule('clipboard') as any;
                    clipboard.dangerouslyPasteHTML(value);
                }

                // Initial update
                setTimeout(updateToolbarLabels, 100);

                // Listen for changes natively
                quill.on('text-change', () => {
                    if (containerRef.current) {
                        const editorInner = containerRef.current.querySelector('.ql-editor');
                        if (editorInner && onChangeRef.current) {
                            const newHtml = editorInner.innerHTML;
                            lastEmittedValue.current = newHtml;
                            onChangeRef.current(newHtml);
                        }
                    }
                    updateToolbarLabels();
                });

                quill.on('selection-change', () => {
                    updateToolbarLabels();
                });

                const editorInner = containerRef.current?.querySelector('.ql-editor');
                if (editorInner) {
                    editorInner.addEventListener('click', updateToolbarLabels);
                    editorInner.addEventListener('keyup', updateToolbarLabels);
                }

            } catch (err) {
                console.error("Failed to initialize Editor:", err);
            }
        };

        initEditor();

        return () => {
            mounted = false;
        };
    }, []); // Only run once on mount

    // Update content from external changes safely
    useEffect(() => {
        if (quillInstance.current && containerRef.current) {
            // Only update if the value from props is different from the last value we emitted
            // This prevents the editor from re-rendering and losing cursor position on every keystroke
            if (value !== undefined && value !== lastEmittedValue.current) {
                const currentContent = containerRef.current.querySelector('.ql-editor')?.innerHTML || '';
                if (value !== currentContent) {
                    const clipboard = quillInstance.current.getModule('clipboard');
                    const selection = quillInstance.current.getSelection();

                    clipboard.dangerouslyPasteHTML(value);

                    if (selection) {
                        quillInstance.current.setSelection(selection);
                    }
                }
            }
        }
    }, [value]);

    return (
        <div className={`bg-white editor-container-${editorId}`}>
            <style>
                {`
                .ql-container.ql-snow {
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    min-height: 350px;
                }
                .ql-editor {
                    min-height: 350px;
                    font-size: 14px;
                    font-family: Arial, sans-serif;
                    line-height: 1.15;
                    color: #000;
                }
                
                /* --- Google Docs-like Continuous Numbering --- */
                /* Hide Quill's native ordered list numbers to prevent double rendering */
                .ql-editor li[data-list="ordered"] > .ql-ui:before,
                .ql-editor li[data-list="bullet"] > .ql-ui {
                    display: none !important;
                }
                
                /* Reset custom counters globally at editor level to maintain continuous numbering */
                .ql-editor {
                    counter-reset: gdocs-list-0 gdocs-list-1 gdocs-list-2 gdocs-list-3;
                }
                
                /* Automatically restart lists at 1 after any heading */
                .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
                    counter-set: gdocs-list-0 0 gdocs-list-1 0 gdocs-list-2 0 gdocs-list-3 0;
                }
                
                /* Completely hide native browser markers to prevent overlap */
                .ql-editor li {
                    list-style-type: none !important;
                }
                .ql-editor li::marker {
                    content: none !important;
                }

                /* Restore bullet markers for Quill unordered lists */
                .ql-editor li[data-list="bullet"] {
                    position: relative;
                }
                .ql-editor li[data-list="bullet"]:not([class*="ql-indent-"])::before {
                    content: "\\2022";
                    position: absolute;
                    left: 0;
                    width: 1.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                .ql-editor li.ql-indent-1[data-list="bullet"]::before {
                    content: "\\25E6";
                    position: absolute;
                    left: 0;
                    width: 4.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                .ql-editor li.ql-indent-2[data-list="bullet"]::before {
                    content: "\\25AA";
                    position: absolute;
                    left: 0;
                    width: 7.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                .ql-editor li.ql-indent-3[data-list="bullet"]::before {
                    content: "\\25AA";
                    position: absolute;
                    left: 0;
                    width: 10.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                .ql-editor li.ql-indent-4[data-list="bullet"]::before,
                .ql-editor li.ql-indent-5[data-list="bullet"]::before {
                    content: "\\25AA";
                    position: absolute;
                    left: 0;
                    width: 13.2em;
                    text-align: right;
                    white-space: nowrap;
                }

                  /* Reset sub-levels when a top-level list item appears */
                .ql-editor li[data-list="ordered"]:not([class*="ql-indent-"]) {
                    counter-set: gdocs-list-1 0 gdocs-list-2 0 gdocs-list-3 0;
                    counter-increment: gdocs-list-0;
                    position: relative;
                }
                .ql-editor li[data-list="ordered"]:not([class*="ql-indent-"])::before {
                    content: counter(gdocs-list-0, decimal) ". ";
                    position: absolute;
                    left: 0;
                    width: 1.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                
                /* Indent Level 1 (i, ii, iii) */
                .ql-editor li.ql-indent-1[data-list="ordered"] {
                    counter-set: gdocs-list-2 0 gdocs-list-3 0;
                    counter-increment: gdocs-list-1;
                    position: relative;
                }
                .ql-editor li.ql-indent-1[data-list="ordered"]::before {
                    content: counter(gdocs-list-1, lower-roman) ". ";
                    position: absolute;
                    left: 0;
                    width: 4.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                
                /* Indent Level 2 (a, b, c) */
                .ql-editor li.ql-indent-2[data-list="ordered"] {
                    counter-set: gdocs-list-3 0;
                    counter-increment: gdocs-list-2;
                    position: relative;
                }
                .ql-editor li.ql-indent-2[data-list="ordered"]::before {
                    content: counter(gdocs-list-2, lower-alpha) ". ";
                    position: absolute;
                    left: 0;
                    width: 7.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                
                /* Indent Level 3+ Fallback */
                .ql-editor li.ql-indent-3[data-list="ordered"],
                .ql-editor li.ql-indent-4[data-list="ordered"] {
                    counter-increment: gdocs-list-3;
                    position: relative;
                }
                .ql-editor li.ql-indent-3[data-list="ordered"]::before {
                    content: counter(gdocs-list-3, decimal) ". ";
                    position: absolute;
                    left: 0;
                    width: 10.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                .ql-editor li.ql-indent-4[data-list="ordered"]::before {
                    content: counter(gdocs-list-3, decimal) ". ";
                    position: absolute;
                    left: 0;
                    width: 13.2em;
                    text-align: right;
                    white-space: nowrap;
                }
                
                .ql-editor p {
                    margin-bottom: 0.5em;
                }
                .ql-toolbar.ql-snow {
                    border: 1px solid #e5e7eb;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8f9fa;
                    padding: 8px;
                    position: sticky;
                    top: 64px;
                    z-index: 30;
                }
                .ql-editor img {
                    max-width: 100% !important;
                    height: auto !important;
                }
                .ql-editor iframe, .ql-editor video {
                    max-width: 100% !important;
                    aspect-ratio: 16 / 9;
                    height: auto !important;
                }
                
                /* --- Custom Font Families --- */
                .ql-font-arial { font-family: Arial, sans-serif; }
                .ql-font-times-new-roman { font-family: 'Times New Roman', Times, serif; }
                .ql-font-courier-new { font-family: 'Courier New', Courier, monospace; }
                .ql-font-georgia { font-family: Georgia, serif; }
                
                /* Toolbar dropdown labels for custom fonts */
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content: "Arial"; font-family: Arial, sans-serif; }
                
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before { content: "Times New Roman"; font-family: 'Times New Roman', Times, serif; }
                
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="courier-new"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="courier-new"]::before { content: "Courier New"; font-family: 'Courier New', Courier, monospace; }
                
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before { content: "Georgia"; font-family: Georgia, serif; }
                
                /* Default dropdown labels when no custom value is selected */
                .ql-snow .ql-picker.ql-font .ql-picker-label::before {
                    content: var(--active-font, "Sans Serif") !important;
                }
                .ql-snow .ql-picker.ql-font .ql-picker-item::before {
                    content: "Sans Serif";
                }
                
                /* --- Toolbar dropdown labels for sizes --- */
                .ql-snow .ql-picker.ql-size { width: 65px; }
                ${['10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'].map(size => `
                .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${size}"]::before,
                .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"]::before { content: "${size}"; }
                `).join('\n')}
                .ql-snow .ql-picker.ql-size .ql-picker-label::before {
                    content: var(--active-size, "14px") !important;
                }
                .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: "14px"; } 

                /* --- Toolbar dropdown for Line Height --- */
                .ql-snow .ql-picker.ql-lineHeight { width: 65px; }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label::before {
                    content: var(--active-line-height, "1.6") !important;
                }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item::before { content: "Line"; }
                
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label[data-value="1.0"]::before,
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item[data-value="1.0"]::before { content: "1.0"; }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label[data-value="1.15"]::before,
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item[data-value="1.15"]::before { content: "1.15"; }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label[data-value="1.5"]::before,
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item[data-value="1.5"]::before { content: "1.5"; }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label[data-value="2.0"]::before,
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item[data-value="2.0"]::before { content: "2.0"; }
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-label[data-value="2.5"]::before,
                .ql-snow .ql-picker.ql-lineHeight .ql-picker-item[data-value="2.5"]::before { content: "2.5"; }
                
                /* --- Custom List Style Overrides (Dropdown Selections) --- */
                
                /* decimal: 1., a., i. */
                .ql-editor li[style*="decimal"]:not([style*="paren"]):not([style*="nested"])[data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, decimal) ". "; }
                .ql-editor li[style*="decimal"]:not([style*="paren"]):not([style*="nested"])[data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-1, lower-alpha) ". "; }
                .ql-editor li[style*="decimal"]:not([style*="paren"]):not([style*="nested"])[data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-2, lower-roman) ". "; }
                .ql-editor li[style*="decimal"]:not([style*="paren"]):not([style*="nested"])[data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-3, decimal) ". "; }

                /* decimal-paren: 1), a), i) */
                .ql-editor li[style*="decimal-paren"][data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, decimal) ") "; }
                .ql-editor li[style*="decimal-paren"][data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-1, lower-alpha) ") "; }
                .ql-editor li[style*="decimal-paren"][data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-2, lower-roman) ") "; }
                .ql-editor li[style*="decimal-paren"][data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-3, decimal) ") "; }

                /* decimal-nested: 1., 1.1., 1.1.1. */
                .ql-editor li[style*="decimal-nested"][data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, decimal) ". "; }
                .ql-editor li[style*="decimal-nested"][data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-0, decimal) "." counter(gdocs-list-1, decimal) ". "; }
                .ql-editor li[style*="decimal-nested"][data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-0, decimal) "." counter(gdocs-list-1, decimal) "." counter(gdocs-list-2, decimal) ". "; }
                .ql-editor li[style*="decimal-nested"][data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-0, decimal) "." counter(gdocs-list-1, decimal) "." counter(gdocs-list-2, decimal) "." counter(gdocs-list-3, decimal) ". "; }

                /* roman-alpha: 1., i., a., 1. (Legal/custom request) */
                .ql-editor li[style*="roman-alpha"][data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, decimal) ". "; }
                .ql-editor li[style*="roman-alpha"][data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-1, lower-roman) ". "; }
                .ql-editor li[style*="roman-alpha"][data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-2, lower-alpha) ". "; }
                .ql-editor li[style*="roman-alpha"][data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-3, decimal) ". "; }

                /* upper-alpha: A., a., i. */
                .ql-editor li[style*="upper-alpha"][data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, upper-alpha) ". "; }
                .ql-editor li[style*="upper-alpha"][data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-1, lower-alpha) ". "; }
                .ql-editor li[style*="upper-alpha"][data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-2, lower-roman) ". "; }
                .ql-editor li[style*="upper-alpha"][data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-3, decimal) ". "; }

                /* upper-roman: I., A., 1. */
                .ql-editor li[style*="upper-roman"][data-list="ordered"]:not([class*="ql-indent-"])::before { content: counter(gdocs-list-0, upper-roman) ". "; }
                .ql-editor li[style*="upper-roman"][data-list="ordered"].ql-indent-1::before { content: counter(gdocs-list-1, upper-alpha) ". "; }
                .ql-editor li[style*="upper-roman"][data-list="ordered"].ql-indent-2::before { content: counter(gdocs-list-2, decimal) ". "; }
                .ql-editor li[style*="upper-roman"][data-list="ordered"].ql-indent-3::before { content: counter(gdocs-list-3, lower-alpha) ". "; }

                /* Google Docs Style "Split Button" UI for Dropdowns */
                .ql-snow .ql-picker.ql-listStyle {
                    width: 15px;
                    margin-left: -5px;
                }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-label {
                    padding: 0;
                    border: none;
                }
                /* Hide native label text so it only shows Quill's built-in dropdown SVG arrow */
                .ql-snow .ql-picker.ql-listStyle .ql-picker-label::before {
                    display: none;
                }

                /* Visual Grid for Dropdown Menus */
                .ql-snow .ql-picker.ql-listStyle .ql-picker-options {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                    padding: 10px;
                    width: 260px;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border-radius: 4px;
                    margin-top: 5px;
                }
                /* Only show the grid when Quill adds the .ql-expanded class (when user clicks) */
                .ql-snow .ql-picker.ql-listStyle.ql-expanded .ql-picker-options {
                    display: grid !important;
                }
                
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item {
                    width: 70px;
                    height: 70px;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    display: block;
                    padding: 0;
                }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item:hover {
                    border-color: #2563eb;
                    background-color: #eff6ff;
                }
                /* Hide the text in grid items */
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item::before {
                    display: none !important;
                }

                /* SVG Backgrounds */
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="decimal"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3E1.%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2239%22%3Ea.%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2228%22%20y%3D%2257%22%3Ei.%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="decimal-paren"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3E1)%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2239%22%3Ea)%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2228%22%20y%3D%2257%22%3Ei)%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="decimal-nested"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3E1.%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2214%22%20y%3D%2239%22%3E1.1.%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2257%22%3E1.1.1.%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="roman-alpha"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3E1.%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2239%22%3Ei.%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2228%22%20y%3D%2257%22%3Ea.%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="upper-alpha"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3EA.%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2239%22%3Ea.%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2228%22%20y%3D%2257%22%3Ei.%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                .ql-snow .ql-picker.ql-listStyle .ql-picker-item[data-value="upper-roman"] { background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20text%20%7B%20font-family%3A%20sans-serif%3B%20font-size%3A%2010px%3B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20line%20%7B%20stroke%3A%20%23d1d5db%3B%20stroke-width%3A%202.5%3B%20stroke-linecap%3A%20round%3B%20%7D%0A%20%20%20%20path%20%7B%20fill%3A%20%234b5563%3B%20%7D%0A%20%20%20%20.outline%20%7B%20fill%3A%20none%3B%20stroke%3A%20%234b5563%3B%20stroke-width%3A%201.5%3B%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Ctext%20x%3D%228%22%20y%3D%2221%22%3EI.%3C%2Ftext%3E%3Cline%20x1%3D%2222%22%20y1%3D%2218%22%20x2%3D%2260%22%20y2%3D%2218%22%2F%3E%3Ctext%20x%3D%2218%22%20y%3D%2239%22%3EA.%3C%2Ftext%3E%3Cline%20x1%3D%2232%22%20y1%3D%2236%22%20x2%3D%2260%22%20y2%3D%2236%22%2F%3E%3Ctext%20x%3D%2228%22%20y%3D%2257%22%3E1.%3C%2Ftext%3E%3Cline%20x1%3D%2242%22%20y1%3D%2254%22%20x2%3D%2260%22%20y2%3D%2254%22%2F%3E%0A%3C%2Fsvg%3E'); }
                
                /* --- Public Detail Page Styles Override --- */
                .ql-editor {
                    font-family: Georgia, serif, sans-serif !important;
                    color: #333 !important;
                    line-height: 1.6 !important;
                    font-size: 1.125rem !important;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    word-break: break-word;
                    width: 100%;
                }
                
                .ql-editor h1,
                .ql-editor h2,
                .ql-editor h3,
                .ql-editor h4,
                .ql-editor h5,
                .ql-editor h6 {
                    color: #0A2342 !important;
                    font-weight: 700 !important;
                    margin-top: 2rem !important;
                    margin-bottom: 1rem !important;
                    line-height: 1.3 !important;
                }
                .ql-editor h1 { font-size: 2.25rem !important; }
                .ql-editor h2 { font-size: 1.875rem !important; border-bottom: 2px solid #e5e7eb !important; padding-bottom: 0.5rem !important; }
                .ql-editor h3 { font-size: 1.5rem !important; }
                .ql-editor h4 { font-size: 1.25rem !important; }

                .ql-editor p {
                    margin-bottom: 1.5rem !important;
                }

                .ql-editor a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                    text-underline-offset: 4px !important;
                    word-break: break-all !important;
                }
                .ql-editor a:hover {
                    color: #1e40af !important;
                }

                .ql-editor blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    padding-left: 1rem !important;
                    font-style: italic !important;
                    color: #555 !important;
                    margin-bottom: 1.5rem !important;
                    background-color: #f9fafb !important;
                    padding: 1rem !important;
                    border-radius: 0 0.5rem 0.5rem 0 !important;
                }

                .ql-editor table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-bottom: 2rem !important;
                    font-size: 1rem !important;
                }
                .ql-editor th,
                .ql-editor td {
                    border: 1px solid #d1d5db !important;
                    padding: 0.75rem 1rem !important;
                    text-align: left !important;
                }
                .ql-editor th {
                    background-color: #f3f4f6 !important;
                    font-weight: 600 !important;
                    color: #111 !important;
                }
                .ql-editor tr:nth-child(even) {
                    background-color: #f9fafb !important;
                }

                .ql-editor pre {
                    background-color: #1f2937 !important;
                    color: #f3f4f6 !important;
                    padding: 1rem !important;
                    border-radius: 0.5rem !important;
                    overflow-x: auto !important;
                    margin-bottom: 1.5rem !important;
                }
                .ql-editor code {
                    font-family: monospace !important;
                    background-color: #f3f4f6 !important;
                    padding: 0.2rem 0.4rem !important;
                    border-radius: 0.25rem !important;
                    font-size: 0.9em !important;
                }
                .ql-editor pre code {
                    background-color: transparent !important;
                    padding: 0 !important;
                    color: inherit !important;
                }

                /* Responsive editor font sizing and spacing for mobile viewports */
                @media (max-width: 640px) {
                    .ql-editor {
                        font-size: 1rem !important;
                        line-height: 1.6 !important;
                    }
                    .ql-editor h1 { font-size: 1.75rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                    .ql-editor h2 { font-size: 1.5rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                    .ql-editor h3 { font-size: 1.25rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                    .ql-editor h4, .ql-editor h5, .ql-editor h6 { font-size: 1.125rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                    .ql-editor p, .ql-editor li, .ql-editor span { font-size: 1rem !important; line-height: 1.6 !important; }
                }
                `}
            </style>
            <div ref={containerRef} />
        </div>
    );
};

export default RichTextEditor;
