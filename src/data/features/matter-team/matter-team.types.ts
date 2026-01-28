export enum RoleInMatter {
  LEAD = 'lead',
  SENIOR = 'senior',
  ASSOCIATE = 'associate',
  PARALEGAL = 'paralegal',
  CONSULTANT = 'consultant',
}

export enum AccessLevel {
  FULL = 'full',
  READ = 'read',
  CONTRIBUTE = 'contribute',
}

export interface MatterTeamMember {
  id: string;
  matterId: string;
  userId: string;
  roleInMatter: RoleInMatter;
  accessLevel: AccessLevel;
  assignedBy: string;
  assignedAt: string;
  updatedAt: string;
  isDeleted: boolean;
  // Populated user data
  user?: {
    _id: string;
    name: string;
    email: string;
    office?: { name: string; code: string };
  };
  // Populated assignedBy user data
  assignedByUser?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface MatterTeamState {
  teamMembers: MatterTeamMember[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface CreateMatterTeamDto {
  matterId: string;
  userId: string;
  roleInMatter: RoleInMatter;
  accessLevel: AccessLevel;
}

export interface UpdateMatterTeamDto {
  roleInMatter?: RoleInMatter;
  accessLevel?: AccessLevel;
}

export interface CheckAccessResponse {
  hasAccess: boolean;
  teamMember?: MatterTeamMember;
  accessLevel?: AccessLevel;
  roleInMatter?: RoleInMatter;
}
