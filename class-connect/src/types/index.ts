export type UserRole = 'student' | 'section_admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  sectionId: string;
  photoURL?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  auraPoints: number;
  createdAt: string;
}

export interface Section {
  id: string;
  name: string; // e.g., "CSE-Section-A"
  department: string;
  batch: string; // e.g., "2023-2027"
  adminUserIds: string[];
  inviteCode?: string;
}

export interface Subject {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  description?: string;
  unitCount: number;
}

export type ResourceType = 
  | 'notes' 
  | 'pyq' 
  | 'important_questions' 
  | 'assignment' 
  | 'ppt' 
  | 'lab' 
  | 'question_bank' 
  | 'reference' 
  | 'other';

export interface Resource {
  id: string;
  sectionId: string;
  subjectId: string;
  unit: number;
  topic: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  fileUrl: string;
  uploadedByUserId: string;
  uploadedByName: string;
  isTeacherProvided?: boolean;
  helpfulCount: number;
  createdAt: string;
}

export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'closed';

export interface ResourceRequest {
  id: string;
  sectionId: string;
  subjectId: string;
  requestedByUserId: string;
  requestedByName: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
}