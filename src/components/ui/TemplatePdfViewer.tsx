'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Download,
  FileText,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { LegalDocTemplate } from '@/data/services/tools-service/types';

export interface TemplatePdfViewerProps {
  template: LegalDocTemplate;
  onUseTemplate?: () => void;
  subCategoryName?: string;
}

interface SpecimenPageContent {
  pageNumber: number;
  headerTitle: string;
  paragraphs: Array<{
    type: 'title' | 'preamble' | 'parties' | 'recitals' | 'clause' | 'signature' | 'witness' | 'schedule';
    text?: string;
    items?: Array<{ label?: string; text: string }>;
  }>;
}

/**
 * Generate multi-page legal specimen content (1 to 4 pages)
 * formatted with authentic Indian legal blanks: ____________________ [Role]
 */
function generateMultiPageSpecimen(template: LegalDocTemplate): SpecimenPageContent[] {
  const totalPages = Math.max(1, template.pageCount || 1);
  const title = template.title.toUpperCase();
  const titleLower = template.title.toLowerCase();

  // 1-PAGE ACKNOWLEDGEMENT / SPECIMEN
  if (totalPages === 1 || titleLower.includes('acknowledg')) {
    if (titleLower.includes('mortgag') || titleLower.includes('possession')) {
      return [
        {
          pageNumber: 1,
          headerTitle: title,
          paragraphs: [
            { type: 'title', text: title },
            {
              type: 'preamble',
              text: 'I, ____________________ [Mortgagee], residing at ____________________ [Address], hereby acknowledge that ____________________ of ____________________ [Address] is entitled to redeem the property and premises comprised in mortgage deed dated ____________________ and made between ____________________ and ____________________ [Parties];',
            },
            {
              type: 'clause',
              text: 'WHICH security is now vested in me upon a payment to me or my successors in title of principal monies, interest, and costs for the time being owing on the security of the said mortgage.',
            },
            {
              type: 'signature',
              items: [
                { label: 'Signature', text: '____________________ [Mortgagee]' },
                { label: 'Date', text: '____________________, 20___' },
              ],
            },
          ],
        },
      ];
    }

    if (titleLower.includes('legacy') || titleLower.includes('executor')) {
      return [
        {
          pageNumber: 1,
          headerTitle: title,
          paragraphs: [
            { type: 'title', text: title },
            {
              type: 'parties',
              items: [
                { label: 'Name', text: '____________________ [Executor]' },
                { label: 'Address', text: '____________________' },
                { label: 'Testator', text: '____________________' },
                { label: 'Legatee', text: '____________________' },
              ],
            },
            {
              type: 'clause',
              text: 'I, ____________________, the executor of testator deceased hereby acknowledge that the legacy Rs. ____________________ payable to legatee by the virtue of the will provided in the probate registry on ____________________ is still due and owing from me with interest at the rate of ________ percent per annum.',
            },
            {
              type: 'signature',
              items: [
                { label: 'Signature', text: '____________________ [Executor]' },
                { label: 'Date', text: '____________________, 20___' },
              ],
            },
          ],
        },
      ];
    }

    // Default 1-page debt / general acknowledgement
    return [
      {
        pageNumber: 1,
        headerTitle: title,
        paragraphs: [
          { type: 'title', text: title },
          {
            type: 'preamble',
            text: 'I hereby acknowledge that a sum of Rs. ____________________ /- (Rupees in words ________________________________________ ) is lawfully due from me to Shri / Smt. ____________________, S/o / W/o ____________________, residing at ____________________.',
          },
          {
            type: 'clause',
            text: 'The said liability has been incurred towards ________________________________________ and I hereby confirm that the said amount is outstanding and undisputed as on this date.',
          },
          {
            type: 'signature',
            items: [
              { label: 'Signature', text: 'Sd/- ____________________' },
              { label: 'Name', text: 'S/o. Shri ____________________' },
              { label: 'Address', text: '____________________' },
              { label: 'Date', text: '____________________, 20___' },
            ],
          },
        ],
      },
    ];
  }

  // 2-PAGE SPECIMEN (Arbitration, Standard Agreement, Deed)
  if (totalPages === 2) {
    return [
      {
        pageNumber: 1,
        headerTitle: `${title} · PAGE 1`,
        paragraphs: [
          { type: 'title', text: title },
          {
            type: 'preamble',
            text: 'THIS AGREEMENT is entered into on this _____ day of ____________, 20___ at ____________________, India;',
          },
          {
            type: 'parties',
            items: [
              { label: '1. FIRST PARTY', text: '____________________ [First Party / Principal Name], residing at / having registered office at ____________________ [Address], (hereinafter referred to as the "FIRST PARTY");' },
              { label: '2. SECOND PARTY', text: '____________________ [Second Party / Contractor Name], residing at / having registered office at ____________________ [Address], (hereinafter referred to as the "SECOND PARTY").' },
            ],
          },
          {
            type: 'recitals',
            items: [
              { text: 'WHEREAS the First Party is engaged in the business of ____________________ and entered into Contract Ref No. ____________________ dated ____________________;' },
              { text: 'AND WHEREAS commercial differences and claims have arisen between the parties regarding performance and payment of Rs. ____________________ /-' },
              { text: 'AND WHEREAS the parties have mutually covenanted to record their definitive terms and procedure for dispute resolution under Indian law.' },
            ],
          },
          {
            type: 'clause',
            text: '1. SCOPE & REFERENCE: The parties agree to refer and determine all claims and controversies regarding ____________________ strictly in accordance with the covenants herein.',
          },
          {
            type: 'clause',
            text: '2. FINANCIAL CONSIDERATION: The agreed valuation / commercial consideration under this deed shall be Rs. ____________________ /- payable through designated banking tranches.',
          },
        ],
      },
      {
        pageNumber: 2,
        headerTitle: `${title} · PAGE 2`,
        paragraphs: [
          {
            type: 'clause',
            text: '3. APPOINTMENT OF ARBITRATOR / AUTHORITY: The disputes shall be adjudicated by independent sole arbitrator ____________________ [Name of Arbitrator] in accordance with the Arbitration and Conciliation Act, 1996.',
          },
          {
            type: 'clause',
            text: '4. SEAT AND VENUE: The legal seat and place of arbitration / proceedings shall be ____________________ [Seat, e.g. New Delhi], and proceedings shall be in English.',
          },
          {
            type: 'clause',
            text: '5. FINALITY OF DECISION: The reasoned award or decision rendered thereunder shall be final, conclusive, and binding on both parties and their legal successors.',
          },
          {
            type: 'preamble',
            text: 'IN WITNESS WHEREOF the First Party and the Second Party have set their respective hands and seals on the day and year first above written.',
          },
          {
            type: 'signature',
            items: [
              { label: 'FIRST PARTY', text: 'Signature: ____________________ [First Party]' },
              { label: 'SECOND PARTY', text: 'Signature: ____________________ [Second Party]' },
            ],
          },
          {
            type: 'witness',
            items: [
              { text: '1. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
              { text: '2. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
            ],
          },
        ],
      },
    ];
  }

  // 3-PAGE SPECIMEN (Power of Attorney, Statutory Notice, Lease Financing)
  if (totalPages === 3) {
    return [
      {
        pageNumber: 1,
        headerTitle: `${title} · PAGE 1`,
        paragraphs: [
          { type: 'title', text: title },
          {
            type: 'preamble',
            text: 'THIS INDENTURE is made and executed on this _____ day of ____________, 20___ at ____________________, India;',
          },
          {
            type: 'parties',
            items: [
              { label: '1. PRINCIPAL / EXECUTANT', text: '____________________ [Principal Name], S/o / D/o ____________________, residing at ____________________ (hereinafter called the "PRINCIPAL");' },
              { label: '2. ATTORNEY / AGENT', text: '____________________ [Attorney Name], S/o / D/o ____________________, residing at ____________________ (hereinafter called the "ATTORNEY").' },
            ],
          },
          {
            type: 'recitals',
            items: [
              { text: 'WHEREAS the Principal is the sole, lawful and absolute owner of property bearing No. ____________________, situated at ____________________ admeasuring ____________________ sq. meters;' },
              { text: 'AND WHEREAS the Principal is unable to personally manage, supervise, and attend to statutory registry matters due to ____________________ [Reason, e.g. overseas employment];' },
              { text: 'AND WHEREAS the Principal desires to appoint the Attorney as true and lawful agent for administrative and court representations.' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        headerTitle: `${title} · PAGE 2`,
        paragraphs: [
          {
            type: 'clause',
            text: 'NOW KNOW YE ALL BY THESE PRESENTS that I, the Principal, do hereby nominate, constitute and appoint the Attorney to do the following acts, deeds, and things in my name and on my behalf:',
          },
          {
            type: 'clause',
            text: '1. PROPERTY MANAGEMENT: To manage, control, lease, and look after the said property, demand and collect monthly rents, and issue valid stamped receipts thereof.',
          },
          {
            type: 'clause',
            text: '2. MUNICIPAL & TAX FILINGS: To pay all rates, taxes, electricity and water charges, and represent the Principal before Municipal Corporation and Tax Authorities.',
          },
          {
            type: 'clause',
            text: '3. COURT LITIGATION & ADVOCATES: To institute, defend, sign plaints, written statements, affidavits, caveats, and appoint advocates to represent in all competent courts.',
          },
          {
            type: 'clause',
            text: '4. SUB-REGISTRAR APPEARANCE: To present deeds, conveyances, and agreements before the Sub-Registrar of Assurances and admit execution thereof on behalf of Principal.',
          },
        ],
      },
      {
        pageNumber: 3,
        headerTitle: `${title} · PAGE 3`,
        paragraphs: [
          {
            type: 'clause',
            text: '5. GENERAL RATIFICATION: I, the Principal, hereby agree to ratify and confirm all lawful acts, deeds, matters, and things done by the said Attorney by virtue of these presents.',
          },
          {
            type: 'preamble',
            text: 'IN WITNESS WHEREOF I, the Principal, have set and subscribed my hand and seal on the date and year first above written.',
          },
          {
            type: 'signature',
            items: [
              { label: 'PRINCIPAL', text: 'Signature: ____________________ [Principal]' },
              { label: 'ATTORNEY (Specimen)', text: 'Signature: ____________________ [Attorney]' },
            ],
          },
          {
            type: 'witness',
            items: [
              { text: '1. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
              { text: '2. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
            ],
          },
        ],
      },
    ];
  }

  // 4-PAGE SPECIMEN (Construction Contract, Master Service Agreement, Partnership Deed)
  return [
    {
      pageNumber: 1,
      headerTitle: `${title} · PAGE 1`,
      paragraphs: [
        { type: 'title', text: title },
        {
          type: 'preamble',
          text: 'THIS CONSTRUCTION AGREEMENT is made on this _____ day of ____________, 20___ at ____________________, India;',
        },
        {
          type: 'parties',
          items: [
            { label: '1. OWNER', text: '____________________ [Owner Name], residing at ____________________ (hereinafter called the "OWNER") of the ONE PART;' },
            { label: '2. BUILDER / CONTRACTOR', text: '____________________ [Builder / Contractor Name], having office at ____________________ (hereinafter called the "BUILDER") of the OTHER PART.' },
          ],
        },
        {
          type: 'recitals',
          items: [
            { text: 'WHEREAS the Owner is the absolute owner of Plot No. ____________________, Khasra No. ____________________, situated at ____________________ admeasuring ____________________ sq. meters;' },
            { text: 'AND WHEREAS the Owner has obtained sanctioned building plans approved by Architect ____________________ [Architect Name];' },
            { text: 'AND WHEREAS the Builder has agreed to erect and construct the building for an agreed contract sum of Rs. ____________________ /-' },
          ],
        },
      ],
    },
    {
      pageNumber: 2,
      headerTitle: `${title} · PAGE 2`,
      paragraphs: [
        {
          type: 'clause',
          text: '1. WORK SPECIFICATIONS: The Builder shall construct the building in strict conformity with architectural drawings, elevations, and structural specifications set out in Schedule A.',
        },
        {
          type: 'clause',
          text: '2. COMMENCEMENT & MILESTONES: Construction shall commence within ____________________ days of this agreement and reach plinth level within ____________________ months.',
        },
        {
          type: 'clause',
          text: '3. CONTRACT SUM & PAYMENT TRANCHES: Total consideration of Rs. ____________________ /- shall be paid in progressive tranches upon issuance of Architect Completion Certificates.',
        },
        {
          type: 'clause',
          text: '4. ARCHITECT SUPERVISION: The appointed Architect ____________________ shall inspect construction at all stages and verify standard merchantable material quality.',
        },
      ],
    },
    {
      pageNumber: 3,
      headerTitle: `${title} · PAGE 3`,
      paragraphs: [
        {
          type: 'clause',
          text: '5. DELAY & LIQUIDATED DAMAGES: If the Builder fails to deliver possession within ____________________ months, liquidated damages of Rs. ____________________ /- per week of delay shall apply.',
        },
        {
          type: 'clause',
          text: '6. STATUTORY LABOUR COMPLIANCES: The Builder shall comply with Contract Labour (Regulation and Abolition) Act, 1970 and indemnify the Owner against worker compensation claims.',
        },
        {
          type: 'clause',
          text: '7. ARBITRATION & JURISDICTION: Disputes arising out of this contract shall be settled by arbitration under Arbitration and Conciliation Act, 1996 with seat at ____________________.',
        },
      ],
    },
    {
      pageNumber: 4,
      headerTitle: `${title} · PAGE 4`,
      paragraphs: [
        {
          type: 'schedule',
          text: 'SCHEDULE A: SUMMARY OF MILESTONES & SPECIFICATIONS\n- Tranche 1: Advance upon signing deed: Rs. ____________________ /-\n- Tranche 2: Foundation & Plinth cast: Rs. ____________________ /-\n- Tranche 3: RCC Roof Slab completion: Rs. ____________________ /-\n- Tranche 4: Final Handover & Fit-out: Rs. ____________________ /-\n- Retention Money: 5% held for 6 months defect liability period.',
        },
        {
          type: 'preamble',
          text: 'IN WITNESS WHEREOF the Owner and the Builder have hereunto set their hands and seals on the day, month, and year first written above.',
        },
        {
          type: 'signature',
          items: [
            { label: 'OWNER', text: 'Signature: ____________________ [Owner]' },
            { label: 'BUILDER', text: 'Signature: ____________________ [Builder]' },
          ],
        },
        {
          type: 'witness',
          items: [
            { text: '1. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
            { text: '2. Witness Name: ____________________ Address: ____________________ Signature: ____________________' },
          ],
        },
      ],
    },
  ];
}

export default function TemplatePdfViewer({
  template,
  onUseTemplate,
  subCategoryName,
}: TemplatePdfViewerProps) {
  const pages = generateMultiPageSpecimen(template);
  const totalPages = pages.length;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(40); // Matches WritOnline's ~40% default view
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset page position when template changes
  useEffect(() => {
    setCurrentPage(1);
  }, [template.id]);

  // Jump to specific page
  const scrollToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    const targetElement = pageRefs.current[pageIndex - 1];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 100));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 30));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Browser Print handler
  const handlePrint = () => {
    window.print();
  };

  // Download plain text/specimen
  const handleDownload = () => {
    const docText = pages
      .map((p) => {
        const textParts = p.paragraphs
          .map((pr) => {
            if (pr.items) {
              return pr.items.map((it) => (it.label ? `${it.label}: ${it.text}` : it.text)).join('\n');
            }
            return pr.text || '';
          })
          .join('\n\n');
        return `[PAGE ${p.pageNumber} OF ${totalPages}]\n\n${textParts}`;
      })
      .join('\n\n------------------------------------------------------------\n\n');

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}_Specimen.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate scaled paper width based on zoom
  // Base A4 width at 100% zoom is approx 760px
  const paperWidthPx = Math.round((760 * zoomLevel) / 100);

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#323639] shadow-lg">
      {/* Print Specific CSS: Hides all toolbars and prints only the A4 sheets */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #template-pdf-printable-area, #template-pdf-printable-area * {
            visibility: visible !important;
          }
          #template-pdf-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .pdf-specimen-page-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* Top Header Breadcrumb & "Use this template ->" Action */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
        <div>
          <span className="font-mono text-[11px] text-[#64748B]">
            {template.category} {subCategoryName ? `/ ${subCategoryName}` : ''}
          </span>
          <h3 className="text-sm font-bold text-[#0B2242] leading-tight truncate max-w-md">
            {template.title}
          </h3>
        </div>

        {onUseTemplate && (
          <button
            type="button"
            onClick={onUseTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2242] px-4 py-2 text-xs font-bold text-white hover:bg-[#15345E] transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>Use this template</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        )}
      </div>

      {/* PDF.js Style Dark Header Bar (Exact Match with WritOnline Screenshots) */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#282c34] text-gray-300 text-xs select-none border-b border-[#1f2224]">
        {/* Left: Thumbnail Hamburger & Page Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded transition-colors ${showThumbnails ? 'bg-[#3e4451] text-white' : 'hover:bg-[#3e4451] text-gray-300'}`}
            title="Toggle Thumbnails Sidebar (≡)"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-xs text-gray-200">
            <span className="bg-[#1e2227] px-2 py-0.5 rounded text-white font-bold">{currentPage}</span>
            <span className="text-gray-400">/</span>
            <span>{totalPages}</span>
          </div>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => scrollToPage(currentPage - 1)}
              className="p-1 rounded hover:bg-[#3e4451] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => scrollToPage(currentPage + 1)}
              className="p-1 rounded hover:bg-[#3e4451] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Zoom Controls & Rotation */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 30}
            className="p-1 rounded hover:bg-[#3e4451] disabled:opacity-30"
            title="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </button>

          <span className="font-mono text-xs font-semibold px-1 text-gray-200 min-w-[36px] text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 100}
            className="p-1 rounded hover:bg-[#3e4451] disabled:opacity-30"
            title="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </button>

          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1 rounded hover:bg-[#3e4451]"
            title="Rotate Page"
          >
            <RotateCw className="size-3.5" />
          </button>
        </div>

        {/* Right: Download, Print & Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-[#3e4451] text-gray-300 hover:text-white"
            title="Download Specimen (.txt)"
          >
            <Download className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded hover:bg-[#3e4451] text-gray-300 hover:text-white"
            title="Print Multi-Page Specimen"
          >
            <Printer className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Split Viewer: Thumbnail Panel (Left) + Document Canvas (Right) */}
      <div className="flex h-[520px] overflow-hidden bg-[#323639]">
        {/* Left Thumbnail Strip */}
        {showThumbnails && (
          <div className="w-28 sm:w-32 shrink-0 bg-[#202124] border-r border-[#1a1c1e] p-3 overflow-y-auto space-y-4">
            {pages.map((p, idx) => {
              const isActive = currentPage === p.pageNumber;
              return (
                <div
                  key={idx}
                  onClick={() => scrollToPage(p.pageNumber)}
                  className="cursor-pointer group flex flex-col items-center"
                >
                  <div
                    className={`w-full aspect-[210/297] rounded bg-white p-1.5 transition-all shadow-md overflow-hidden text-[4px] leading-[6px] text-gray-400 select-none ${
                      isActive
                        ? 'ring-2 ring-[#1a73e8] border border-[#1a73e8]'
                        : 'opacity-70 group-hover:opacity-100 border border-gray-400'
                    }`}
                  >
                    <div className="font-bold text-[5px] text-gray-700 text-center truncate mb-1 border-b border-gray-200 pb-0.5">
                      {p.headerTitle}
                    </div>
                    <div className="space-y-0.5">
                      <div className="h-0.5 bg-gray-300 rounded w-full" />
                      <div className="h-0.5 bg-gray-200 rounded w-4/5" />
                      <div className="h-0.5 bg-gray-200 rounded w-full" />
                      <div className="h-0.5 bg-gray-300 rounded w-3/4" />
                      <div className="h-0.5 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                  <span
                    className={`mt-1 font-mono text-[10px] font-bold ${
                      isActive ? 'text-[#8ab4f8]' : 'text-gray-400'
                    }`}
                  >
                    {p.pageNumber}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Right Document Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 flex flex-col items-center gap-6"
        >
          <div
            id="template-pdf-printable-area"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}
            className="flex flex-col items-center gap-6"
          >
            {pages.map((p, pageIdx) => (
              <div
                key={pageIdx}
                ref={(el) => {
                  pageRefs.current[pageIdx] = el;
                }}
                style={{ width: `${paperWidthPx}px` }}
                className="pdf-specimen-page-sheet aspect-[210/297] bg-white rounded-xs shadow-2xl p-6 sm:p-10 font-serif text-[#1e293b] text-[11px] leading-relaxed flex flex-col justify-between border border-gray-200 select-text"
              >
                {/* Page Content Body */}
                <div className="space-y-3.5">
                  {p.paragraphs.map((par, pIdx) => {
                    if (par.type === 'title') {
                      return (
                        <div key={pIdx} className="text-center pb-2.5 border-b border-gray-200 mb-2">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#0B2242] leading-snug">
                            {par.text}
                          </h4>
                        </div>
                      );
                    }

                    if (par.type === 'preamble') {
                      return (
                        <p key={pIdx} className="text-justify leading-relaxed">
                          {par.text}
                        </p>
                      );
                    }

                    if (par.type === 'parties' && par.items) {
                      return (
                        <div
                          key={pIdx}
                          className="space-y-1.5 text-justify bg-gray-50/70 p-2.5 rounded border border-gray-200/60 font-sans text-[10px]"
                        >
                          {par.items.map((it, itIdx) => (
                            <p key={itIdx}>
                              {it.label && <strong className="text-[#0B2242]">{it.label}: </strong>}
                              <span>{it.text}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }

                    if (par.type === 'recitals' && par.items) {
                      return (
                        <div key={pIdx} className="space-y-1 text-justify text-[10.5px]">
                          {par.items.map((it, itIdx) => (
                            <p key={itIdx}>{it.text}</p>
                          ))}
                        </div>
                      );
                    }

                    if (par.type === 'clause') {
                      return (
                        <p key={pIdx} className="text-justify text-[10.5px] leading-relaxed">
                          {par.text}
                        </p>
                      );
                    }

                    if (par.type === 'schedule') {
                      return (
                        <div key={pIdx} className="bg-gray-50 p-2.5 rounded border border-gray-200 font-mono text-[9.5px] whitespace-pre-line leading-relaxed">
                          {par.text}
                        </div>
                      );
                    }

                    if (par.type === 'signature' && par.items) {
                      return (
                        <div key={pIdx} className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between pt-1">
                            {par.items.map((it, itIdx) => (
                              <div key={itIdx} className="text-left font-sans text-[9.5px]">
                                <span className="font-bold text-[#0B2242]">{it.label}: </span>
                                <span>{it.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (par.type === 'witness' && par.items) {
                      return (
                        <div key={pIdx} className="pt-2 border-t border-gray-100 font-sans text-[9px] text-gray-500 space-y-1">
                          <p className="font-bold uppercase tracking-wider text-gray-400">WITNESSES:</p>
                          {par.items.map((it, itIdx) => (
                            <p key={itIdx}>{it.text}</p>
                          ))}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Page Footer Demarcation */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between font-mono text-[9px] text-gray-400">
                  <span>{template.category} Specimen</span>
                  <span>
                    Page {p.pageNumber} of {totalPages}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
