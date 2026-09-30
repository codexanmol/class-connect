export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'student' | 'CR' | 'admin';
  section: string; // e.g., 'CSE-A'
  auraPoints: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string; // e.g., 'CS301'
  name: string; // e.g., 'Database Management Systems'
  instructor: string;
  section: string;
  color?: string;
}

export type ResourceType = 'PYQ' | 'Notes' | 'Assignment' | 'Syllabus' | 'Other';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  type: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedByUid: string;
  uploadedByName: string;
  uploadedByPhoto?: string;
  upvotes: number;
  upvotedBy: string[]; // UIDs of users who upvoted
  createdAt: string;
}

export interface ResourceRequest {
  id: string;
  title: string;
  subjectName: string;
  description: string;
  requestedByUid: string;
  requestedByName: string;
  status: 'pending' | 'fulfilled' | 'closed';
  fulfilledResourceId?: string;
  createdAt: string;
}