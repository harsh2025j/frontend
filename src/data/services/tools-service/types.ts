export interface Precedent {
  id: string | number;
  slug?: string;
  caseTitle: string;
  title?: string;
  citation: string;
  citations?: { neutral?: string; scr?: string };
  court: string;
  bench?: string;
  year: number;
  case_type?: string;
  provisions?: string[];
  principles?: string[];
  ratio?: string;
  factualContext?: string;
  relevanceKeywords?: string[];
  argumentTemplate?: string;
  relevanceScore: number;
  snippet?: string;
  has_pdf?: boolean;
  ocr_suspected?: boolean;
  official_portal?: string;
  official_url?: string;
}

export interface PrecedentSearchResponse {
  query: string;
  totalResults: number;
  precedents: Precedent[];
  source: string;
}

export interface JudgmentDetails {
  id: string | number;
  slug?: string;
  title: string;
  petitioner?: string;
  respondent?: string;
  case_number?: string;
  case_type?: string;
  court?: string;
  judgment_date?: string;
  judgment_year?: number;
  bench?: string[] | string;
  citations?: {
    neutral?: string;
    scr?: string;
  };
  has_pdf?: boolean;
  total_paragraphs?: number;
  summary_llm?: string;
  summary?: string;
  snippet?: string;
  ratio?: string;
  holdings?: string[];
  headnotes?: string[];
  provisions?: string[];
  official_url?: string;
  disposition?: string;
}

export interface DraftRequest {
  matterType: string;
  court: string;
  petitioner: string;
  respondent: string;
  jurisdictionArticle?: string;
  facts: string;
  legalIssues?: string;
  reliefSought: string;
}

export interface DraftResponse {
  matterType: string;
  court: string;
  parties: { petitioner: string; respondent: string };
  synopsisDates: { date: string; event: string }[];
  questionsOfLaw: string[];
  grounds: { title: string; content: string }[];
  prayer: string;
  interimRelief?: string;
  fullDraft: string;
  id?: string;
  draftId?: string;
}

export interface SavedDraftItem {
  id: string;
  title: string;
  matterType: string;
  court: string;
  createdAt: string;
  formData: DraftRequest;
  result: DraftResponse;
  activeStep?: number;
  status?: 'DRAFT READY' | 'STARTED';
  fullDraft?: string;
  docCategory?: string;
  advocateDetails?: {
    name?: string;
    enrolmentNo?: string;
    officeAddress?: string;
    email?: string;
    mobile?: string;
  };
  petitioners?: Array<{ name: string; relationName?: string; age?: string; address?: string }>;
  respondents?: Array<{ name: string; department?: string; designation?: string }>;
  datesEvents?: Array<{ date: string; event: string }>;
  pinnedCitations?: Array<{ title: string; citation: string; ratio?: string }>;
}

export interface PaymentTranche {
  tranche: string;
  amount: string;
  dueDate: string;
  paymentMode?: string;
}

export interface PendingLitigation {
  courtName?: string;
  caseNumber?: string;
  caseType?: string;
}

export interface SettlementRequest {
  disputeType: string;
  partyA: string;
  partyB: string;
  claimAmount: string;
  settlementAmount: string;
  disputeSummary: string;
  liabilityAllocation?: string;
  paymentTranches?: PaymentTranche[];
  pendingLitigation?: PendingLitigation;
}

export interface SettlementSection {
  index: string;
  heading: string;
  badge?: string;
  content: string;
}

export interface SettlementResponse {
  title: string;
  governingLaw: string;
  parties: { partyA: string; partyB: string };
  claimValue: string;
  agreedSettlementValue: string;
  pendingLitigation?: PendingLitigation;
  sections: SettlementSection[];
  courtApplication?: string;
  executionBlock?: string;
  defaultMechanism?: string;
}

export interface HealthCheckFinding {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  layer?: string;
  category: string;
  clauseReference?: string;
  flaggedSnippet?: string;
  issue: string;
  implication: string;
  recommendation: string;
  correctedClause?: string;
}

export interface StatutoryCheckItem {
  statute: string;
  compliance: 'COMPLIANT' | 'NON_COMPLIANT' | 'ATTENTION_NEEDED';
  notes: string;
}

export interface DocumentMetrics {
  estimatedPages?: number;
  wordCount?: number;
  characterCount?: number;
  coverage?: string;
  isLargeDoc?: boolean;
}

export interface HealthCheckReport {
  documentTitle: string;
  documentSummary?: string;
  healthScore: number;
  riskLevel: 'HIGH RISK' | 'MODERATE RISK' | 'HEALTHY';
  layerScores?: {
    layer1Score: number;
    layer2Score: number;
    layer3Score: number;
  };
  totalFindings: number;
  findingsBreakdown: { high: number; medium: number; low: number };
  findings: HealthCheckFinding[];
  statutoryChecklist?: StatutoryCheckItem[];
  revisionChecklist: string[];
  extractedText?: string;
  documentMetrics?: DocumentMetrics;
}

export interface TranslationResponse {
  detectedLanguage: string;
  targetLanguage?: string;
  originalTextLength?: number;
  extractedVernacularText?: string;
  translatedText: string;
  preservedEntities: { type: string; value: string }[];
  counselReviewNote: string;
  sourceType?: 'image' | 'text';
}

export interface LegalDocCategory {
  id: string;
  name: string;
  templateCount: number;
  subcategoriesCount?: number;
  description?: string;
}

export interface LegalDocTemplate {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  pageCount: number;
  description?: string;
}

export interface ExtractedEntityItem {
  key: string;
  label: string;
  value: string;
}

export interface StillNeededItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface LegalDocDraft {
  id: string;
  title: string;
  category: string;
  situation: string;
  extractedData: Record<string, string>;
  content: string;
  step?: number;
  status?: 'DRAFT READY' | 'STARTED';
  createdAt: string;
  updatedAt: string;
}

