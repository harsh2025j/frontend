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
                        toolbar: [
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],
                            ['link', 'image', 'video'],
                            ['clean']
                        ],
                        // Enable the Blot Formatter for image/video resizing
                        blotFormatter: {}
                    },
                });

                quillInstance.current = quill;

                // Set initial value
                if (value) {
                    const clipboard = quill.getModule('clipboard');
                    clipboard.dangerouslyPasteHTML(value);
                }

                // Listen for changes natively
                quill.on('text-change', () => {
                    if (containerRef.current) {
                        const editorInner = containerRef.current.querySelector('.ql-editor');
                        if (editorInner && onChangeRef.current) {
                            onChangeRef.current(editorInner.innerHTML);
                        }
                    }
                });

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
            const currentContent = containerRef.current.querySelector('.ql-editor')?.innerHTML || '';
            if (value && value !== currentContent) {
                const clipboard = quillInstance.current.getModule('clipboard');
                const selection = quillInstance.current.getSelection();

                clipboard.dangerouslyPasteHTML(value);

                if (selection) {
                    quillInstance.current.setSelection(selection);
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
                    font-size: 16px;
                }
                .ql-toolbar.ql-snow {
                    border: 1px solid #e5e7eb;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f9fafb;
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
                `}
            </style>
            <div ref={containerRef} />
        </div>
    );
};

export default RichTextEditor;
