export interface Judge {
  id: string;
  name: string;
  prefix?: string | null;
  gender?: string | null;
  dob?: string | null;
  nationality: string;
  photoUrl?: string | null;
  designation: string;
  court: string;
  courtType: string;
  benchLocation?: string | null;
  state?: string | null;
  appointmentDate?: string | null;
  appointmentType?: string | null;
  isServing: boolean;
  retirementDate?: string | null;
  departureReason?: string | null;
  seniorityNumber?: number | null;
  officialEmail?: string | null;
  officialPhone?: string | null;
  officialAddress?: string | null;
  educationalQualifications?: string | null;
  barEnrollment?: string | null;
  yearsOfPractice?: number | null;
  priorJudicialPositions?: string | null;
  specialization?: string[] | null;
  notableJudgments?: string | null;
  books?: string | null;
  awards?: string | null;
  postRetirementRoles?: string | null;
  biography?: string | null;
  status: 'draft' | 'published';
  dataSource?: { label: string; url: string } | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJudgeRequest {
  name: string;
  prefix?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  photo?: File; // For upload
  designation: string;
  court: string;
  courtType: string;
  benchLocation?: string;
  state?: string;
  appointmentDate?: string;
  appointmentType?: string;
  isServing?: boolean;
  retirementDate?: string;
  departureReason?: string;
  seniorityNumber?: number;
  officialEmail?: string;
  officialPhone?: string;
  officialAddress?: string;
  educationalQualifications?: string;
  barEnrollment?: string;
  yearsOfPractice?: number;
  priorJudicialPositions?: string;
  specialization?: string[];
  notableJudgments?: string;
  books?: string;
  awards?: string;
  postRetirementRoles?: string;
  biography?: string;
  status?: 'draft' | 'published';
  dataSource?: string; // JSON string for multipart
  isVerified?: boolean;
}

export type UpdateJudgeRequest = Partial<CreateJudgeRequest>;

export type JudgeCategory = 'chief-justice' | 'senior-judges' | 'judges' | 'retired';

