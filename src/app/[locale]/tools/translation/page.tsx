'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Languages,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  FileText,
  File,
  X,
  Printer,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { TranslationResponse } from '@/data/services/tools-service/types';

const INDIAN_LANGUAGES = [
  { code: 'Auto-Detect', label: 'Auto-Detect (22 Indian Languages)' },
  { code: 'English', label: 'English' },
  { code: 'Hindi · हिन्दी', label: 'Hindi · हिन्दी' },
  { code: 'Bengali · বাংলা', label: 'Bengali · বাংলা' },
  { code: 'Tamil · தமிழ்', label: 'Tamil · தமிழ்' },
  { code: 'Telugu · తెలుగు', label: 'Telugu · తెలుగు' },
  { code: 'Marathi · मराठी', label: 'Marathi · मराठी' },
  { code: 'Gujarati · ગુજરાતી', label: 'Gujarati · ગુજરાતી' },
  { code: 'Kannada · ಕನ್ನಡ', label: 'Kannada · ಕನ್ನಡ' },
  { code: 'Malayalam · മലയാളം', label: 'Malayalam · മലയാളം' },
  { code: 'Punjabi · ਪੰਜਾਬੀ', label: 'Punjabi · ਪੰਜਾਬੀ' },
  { code: 'Odia · ଓଡ଼ିଆ', label: 'Odia · ଓଡ଼ିଆ' },
  { code: 'Assamese · অসমীয়া', label: 'Assamese · অসমীয়া' },
  { code: 'Urdu · اردو', label: 'Urdu · اردو' },
  { code: 'Nepali · नेपाली', label: 'Nepali · नेपाली' },
  { code: 'Konkani · कोंकणी', label: 'Konkani · कोंकणी' },
  { code: 'Maithili · मैथिली', label: 'Maithili · मैथिली' },
  { code: 'Dogri · डोगरी', label: 'Dogri · डोगरी' },
  { code: 'Manipuri · মৈতৈলোন্', label: 'Manipuri · মৈতৈলোন্' },
  { code: 'Bodo · बड़ो', label: 'Bodo · बड़ो' },
  { code: 'Santali · संताली', label: 'Santali · संताली' },
  { code: 'Sanskrit · संस्कृतम्', label: 'Sanskrit · संस्कृतम्' },
  { code: 'Kashmiri · کٲشُر', label: 'Kashmiri · کٲشُر' },
  { code: 'Sindhi · سنڌي', label: 'Sindhi · سنڌي' },
];

const TARGET_LANGUAGES = [
  { code: 'English', label: 'English (Supreme & High Court Standard)' },
  { code: 'Hindi · हिन्दी', label: 'Hindi · हिन्दी' },
  { code: 'Bengali · বাংলা', label: 'Bengali · বাংলা' },
  { code: 'Marathi · मराठी', label: 'Marathi · मराठी' },
  { code: 'Tamil · தமிழ்', label: 'Tamil · தமிழ்' },
  { code: 'Telugu · తెలుగు', label: 'Telugu · తెలుగు' },
  { code: 'Gujarati · ગુજરાતી', label: 'Gujarati · ગુજરાતી' },
  { code: 'Kannada · ಕನ್ನಡ', label: 'Kannada · ಕನ್ನಡ' },
  { code: 'Malayalam · മലയാളം', label: 'Malayalam · മലയാളം' },
  { code: 'Punjabi · ਪੰਜਾਬੀ', label: 'Punjabi · ਪੰਜਾਬੀ' },
  { code: 'Odia · ଓଡ଼ିଆ', label: 'Odia · ଓଡ଼ିଆ' },
  { code: 'Assamese · অসমীয়া', label: 'Assamese · অসমীয়া' },
  { code: 'Urdu · اردو', label: 'Urdu · اردو' },
  { code: 'Nepali · नेपाली', label: 'Nepali · नेपाली' },
  { code: 'Konkani · कोंकणी', label: 'Konkani · कोंकणी' },
  { code: 'Maithili · मैथिली', label: 'Maithili · मैथिली' },
  { code: 'Dogri · डोगरी', label: 'Dogri · डोगरी' },
  { code: 'Manipuri · মৈতৈলোন্', label: 'Manipuri · মৈতৈলোন্' },
  { code: 'Bodo · बड़ो', label: 'Bodo · बड़ो' },
  { code: 'Santali · संताली', label: 'Santali · संताली' },
  { code: 'Sanskrit · संस्कृतम्', label: 'Sanskrit · संस्कृतम्' },
  { code: 'Kashmiri · کٲشُر', label: 'Kashmiri · کٲشُر' },
  { code: 'Sindhi · سنڌي', label: 'Sindhi · سنڌي' },
];

interface CustomLanguageDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { code: string; label: string }[];
  placeholder?: string;
}

function CustomLanguageDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select language',
}: CustomLanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => o.code === value);
  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0B2242] mb-1 font-mono">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="w-full flex items-center justify-between rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0B2242] hover:border-[#0B2242] focus:outline-hidden focus:ring-1 focus:ring-[#0B2242] transition-all cursor-pointer text-left shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`size-3.5 text-[#64748B] transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-[#0B2242]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl border border-[#CBD5E1] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.length > 6 && (
            <div className="p-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#94A3B8]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full rounded-md border border-[#CBD5E1] bg-white pl-8 pr-2.5 py-1 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Custom height bounded strictly to 200-300px (max-h-[250px]) */}
          <div className="max-h-[250px] overflow-y-auto divide-y divide-[#F1F5F9] p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.code === value;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      onChange(opt.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAEFF9] text-[#0B2242] font-bold'
                        : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0B2242]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 text-[#0B2242] shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                No languages found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const SAMPLE_VERNACULAR_FIR = `प्रथम सूचना रिपोर्ट (FIR)
थाना: सिविल लाइन्स, जनपद: लखनऊ
मु०अ०सं०: 142/2024
दिनांक: 14 अगस्त 2024, समय: 16:30 बजे

वादी का बयान:
"प्रार्थी रामवीर निवासी ग्राम रामपुर का कथन है कि आज दिनांक 14.08.2024 को लगभग 11 बजे दिन में नामजद विपक्षीगण खसरा संख्या 112/4 रकबा 2 बीघा 4 बिस्वा की भूमि पर लाठी-डंडों से लैस होकर जबरन कब्जा दखल करने के इरादे से आ धमके और जुताई के कार्य में बाधा पहुंचाई। मना करने पर प्रार्थी को जान से मारने की धमकी दी।"

संबद्ध धाराएं:
धारा 147, 447, 506 भारतीय दंड संहिता (IPC)
(समतुल्य: धारा 189, 329, 351 भारतीय न्याय संहिता, 2023)`;

function parseInlineMarkdown(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`)/g);

  return parts.map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      if (part.length >= 4) {
        return (
          <strong key={i} className="font-bold text-[#0B2242]">
            {part.slice(2, -2)}
          </strong>
        );
      }
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      if (part.length >= 2) {
        return (
          <em key={i} className="italic text-[#334155]">
            {part.slice(1, -1)}
          </em>
        );
      }
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#F1F5F9] font-mono text-[11px] text-[#0B2242] border border-[#E2E8F0]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdownText(content: string) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        const numberedMatch = line.match(/^(\s*)(\d+[\.\)])\s+(.*)$/);
        const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)$/);

        if (numberedMatch) {
          const indent = numberedMatch[1].length > 0 ? 'ml-3' : '';
          return (
            <div key={idx} className={`flex items-start gap-2 ${indent}`}>
              <span className="font-bold text-[#0B2242] shrink-0 font-mono text-[11px]">
                {numberedMatch[2]}
              </span>
              <div className="flex-1">
                {parseInlineMarkdown(numberedMatch[3])}
              </div>
            </div>
          );
        }

        if (bulletMatch) {
          const indent = bulletMatch[1].length > 0 ? 'ml-3' : '';
          return (
            <div key={idx} className={`flex items-start gap-2 ${indent}`}>
              <span className="text-[#CAA438] shrink-0 font-bold">•</span>
              <div className="flex-1">
                {parseInlineMarkdown(bulletMatch[3])}
              </div>
            </div>
          );
        }

        return (
          <div key={idx}>
            {parseInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
}

const MAX_PDF_PAGES = 5;

function getPdfPageCountFromArrayBuffer(buffer: ArrayBuffer): number {
  try {
    const binaryString = new TextDecoder('latin1').decode(buffer);
    const countMatches = [...binaryString.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/gi)];
    if (countMatches.length > 0) {
      const counts = countMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n) && n > 0);
      if (counts.length > 0) return Math.max(...counts);
    }
    const genericCounts = [...binaryString.matchAll(/\/Count\s+(\d+)/g)];
    if (genericCounts.length > 0) {
      const nums = genericCounts.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n) && n > 0);
      if (nums.length > 0) return Math.max(...nums);
    }
    const pageMatches = [...binaryString.matchAll(/\/Type\s*\/Page[^s]/g)];
    if (pageMatches.length > 0) return pageMatches.length;
  } catch {
    // Graceful fallback
  }
  return 1;
}

export default function TranslationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('Auto-Detect');
  const [targetLang, setTargetLang] = useState('English');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pageLimitError, setPageLimitError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'translated' | 'extracted'>('translated');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setInputMode('file');
      setPageLimitError(null);
      setPdfPageCount(null);

      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isImg) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }

      if (isPdf) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result instanceof ArrayBuffer) {
            const count = getPdfPageCountFromArrayBuffer(event.target.result);
            setPdfPageCount(count);
            if (count > MAX_PDF_PAGES) {
              setPageLimitError(
                `Your PDF has ${count} pages. To ensure fast, accurate judicial translation and prevent token timeouts, we can only translate up to ${MAX_PDF_PAGES} pages at a time. Please upload a PDF extract of up to ${MAX_PDF_PAGES} pages.`
              );
            }
          }
        };
        reader.readAsArrayBuffer(file);
      }

      // CRITICAL: NEVER read binary PDF as text!
      // Only plain text files (.txt) are read as text; for PDFs and images, clear inputText.
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setInputText(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setInputText('');
      }
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const textToSend = inputMode === 'text' ? inputText : '';
      const fileToSend = inputMode === 'file' ? (selectedFile || undefined) : undefined;

      const res = await toolsService.translateLegalDocument(
        textToSend,
        sourceLang,
        targetLang,
        fileToSend,
      );
      setTranslationResult(res);
      setActiveTab('translated');
    } catch (err: any) {
      alert('Translation error: ' + (err.message || 'Failed to translate document'));
    } finally {
      setLoading(false);
    }
  };

  const textToCopyOrDownload = activeTab === 'translated'
    ? (translationResult?.translatedText || '')
    : (translationResult?.extractedVernacularText || '');

  const handleCopy = () => {
    if (textToCopyOrDownload) {
      const cleanText = textToCopyOrDownload.replace(/\*\*/g, '');
      navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (textToCopyOrDownload) {
      const cleanText = textToCopyOrDownload.replace(/\*\*/g, '');
      const element = document.createElement('a');
      const file = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${activeTab === 'translated' ? 'Certified_Legal_Translation' : 'Extracted_Vernacular_Text'}_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded bg-[#0B2242] text-white">
              <Languages className="size-4 text-[#CAA438]" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242]">
              Linguistic Forensics · 22 Indian Languages
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-merriweather text-[#0B2242]">
            Legal Vernacular Translation & Document OCR
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Convert vernacular court orders, police FIRs, revenue records, and dictations into structured English while preserving citations and sections.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#0B2242] bg-[#EAEFF9] border border-[#CBD5E1] px-3.5 py-1.5 rounded-full font-medium">
          <ShieldCheck className="size-4 text-[#0B2242]" />
          <span>High Court Certified Translation Standard</span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Input (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-fit space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <CustomLanguageDropdown
              label="Source Language"
              value={sourceLang}
              onChange={setSourceLang}
              options={INDIAN_LANGUAGES}
            />

            <CustomLanguageDropdown
              label="Target Language"
              value={targetLang}
              onChange={setTargetLang}
              options={TARGET_LANGUAGES}
            />
          </div>

          {/* Mode Switcher: Paste Text vs Upload File / Scan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2242] font-mono">
                Input Method
              </span>
              {selectedFile && inputMode === 'file' && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  File Ready
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-white text-[#0B2242] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B2242]'
                }`}
              >
                <FileText className="size-3.5" />
                <span>Paste / Type Text</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  inputMode === 'file'
                    ? 'bg-white text-[#0B2242] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B2242]'
                }`}
              >
                <Upload className="size-3.5" />
                <span>Upload PDF / Scan</span>
                {selectedFile && <span className="size-1.5 rounded-full bg-emerald-500" />}
              </button>
            </div>
          </div>

          {/* MODE 1: Text Input Mode */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste FIR, court order extract, revenue deed, or vernacular pleading text..."
                className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 font-mono text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden leading-relaxed min-h-[160px] max-h-[250px] resize-y"
              />
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>{inputText.length} characters</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(SAMPLE_VERNACULAR_FIR);
                  }}
                  className="text-xs text-[#0B2242] hover:underline font-medium cursor-pointer"
                >
                  Load Sample Vernacular FIR
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: File Upload Mode (PDF / Scan) */}
          {inputMode === 'file' && (
            <div>
              {!selectedFile ? (
                <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0B2242] rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 bg-[#F8FAFC] hover:bg-white group">
                  <div className="size-11 rounded-full bg-[#EAEFF9] flex items-center justify-center text-[#0B2242] group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B2242] hover:underline">Click to upload document</span>
                    <span className="text-xs text-[#64748B]"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Supports PDF (.pdf) or Scanned Image (PNG, JPG, WEBP)</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,image/*,.txt"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type.includes('pdf')
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type.includes('pdf') ? (
                          <FileText className="size-5" />
                        ) : (
                          <ImageIcon className="size-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0B2242] truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Document'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        setPdfPageCount(null);
                        setPageLimitError(null);
                      }}
                      className="size-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {filePreview && (
                    <div className="rounded-lg border border-[#CBD5E1] overflow-hidden max-h-40 bg-black/5">
                      <img src={filePreview} alt="Document Scan" className="w-full h-auto object-contain max-h-40" />
                    </div>
                  )}

                  {pageLimitError ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-amber-950">Document Exceeds Limit ({pdfPageCount} Pages):</span>
                        <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">{pageLimitError}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B2242] bg-white border border-[#CBD5E1] px-2.5 py-1 rounded-md hover:bg-gray-50 cursor-pointer shadow-xs">
                            Upload Smaller Extract
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".pdf,image/*,.txt"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-[#0B2242] bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>
                          Document ready for AI OCR & Translation
                          {pdfPageCount ? ` (${pdfPageCount} page${pdfPageCount > 1 ? 's' : ''} · Max ${MAX_PDF_PAGES})` : ''}
                        </span>
                      </span>
                      <label className="text-[11px] font-bold text-[#0B2242] hover:underline cursor-pointer">
                        Change
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,image/*,.txt"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleTranslate}
            disabled={
              loading ||
              (inputMode === 'text' && !inputText.trim()) ||
              (inputMode === 'file' && (!selectedFile || Boolean(pageLimitError)))
            }
            className="w-full rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
            ) : pageLimitError ? (
              <AlertTriangle className="size-4 text-amber-400" />
            ) : (
              <Languages className="size-4 text-[#CAA438]" />
            )}
            <span>
              {loading
                ? 'Processing Document & Translating...'
                : pageLimitError
                ? `Exceeds ${MAX_PDF_PAGES}-Page Limit (Please Upload Extract)`
                : 'Translate Legal Document'}
            </span>
          </button>
        </div>

        {/* Right Column: Output (7 cols) */}
        <div className="lg:col-span-7">
          {translationResult ? (
            <div className="rounded-xl border border-[#CBD5E1] bg-white shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
              {/* Top Banner: Detected Language & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="font-mono text-xs text-[#64748B]">Detected Source: </span>
                  <span className="rounded bg-[#EAEFF9] px-2.5 py-0.5 font-bold font-mono text-xs text-[#0B2242]">
                    {translationResult.detectedLanguage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:bg-[#F1F5F9] cursor-pointer"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0B2242] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15345E] cursor-pointer"
                  >
                    <Download className="size-3.5 text-[#CAA438]" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>

              {/* Output Tab Switcher: Certified Translation vs Extracted Text */}
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('translated')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'translated'
                      ? 'bg-[#0B2242] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0B2242] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Languages className="size-3.5 text-[#CAA438]" />
                  <span>Certified {translationResult.targetLanguage || 'English'} Translation</span>
                </button>

                {translationResult.extractedVernacularText && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('extracted')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'extracted'
                        ? 'bg-[#0B2242] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0B2242] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <FileText className="size-3.5 text-[#CAA438]" />
                    <span>Extracted Source Text ({translationResult.detectedLanguage})</span>
                  </button>
                )}
              </div>

              {/* Preserved Entities Chips */}
              {translationResult.preservedEntities && translationResult.preservedEntities.length > 0 && (
                <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                  <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0B2242] mb-2">
                    Preserved Evidentiary Legal Entities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {translationResult.preservedEntities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white border border-[#CBD5E1] px-2.5 py-1 text-[11px] font-mono text-[#0B2242]"
                      >
                        <span className="text-[#64748B] font-semibold">{ent.type}: </span>
                        <span className="font-bold">{ent.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Preview Box */}
              <div>
                <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider mb-2">
                  {activeTab === 'translated'
                    ? `Certified ${translationResult.targetLanguage || 'English'} Judicial Translation`
                    : `Extracted Original Text (${translationResult.detectedLanguage})`}
                </h3>
                <div className="rounded-lg border border-[#CBD5E1] bg-white p-5 font-mono text-xs leading-relaxed text-[#1E293B] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {renderMarkdownText(
                    activeTab === 'translated'
                      ? translationResult.translatedText
                      : (translationResult.extractedVernacularText || '')
                  )}
                </div>
              </div>

              {/* Counsel Review Note */}
              {translationResult.counselReviewNote && (
                <div className="rounded-lg bg-[#FFFDF5] border border-[#CAA438]/40 p-4">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-[#CAA438]" />
                    <span>Advocate Review & Statutory Note</span>
                  </h4>
                  <div className="text-xs text-[#475569] leading-relaxed font-sans">
                    {renderMarkdownText(translationResult.counselReviewNote)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
              <Languages className="mx-auto size-10 text-[#CBD5E1]" />
              <h3 className="mt-4 font-merriweather font-bold text-[#0B2242] text-base">
                No Translation Generated Yet
              </h3>
              <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto">
                Paste vernacular legal text or upload a document/FIR scan and click &ldquo;Translate Legal Document&rdquo; to produce a certified English translation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
