// Authentication & User Types
export type UserRole = 'validator' | 'admin' | 'university';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  walletAddress?: string;
  university_id?: string;
  institution?: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  walletConnected: boolean;
}

// Blockchain Types
export interface BlockchainBlock {
  blockHash: string;
  blockNumber: number;
  timestamp: Date;
  transactions: number;
  previousHash: string;
  miner: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  type: 'diploma_issued' | 'diploma_revoked' | 'student_registered' | 'admin_action';
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: Date;
  blockNumber?: number;
  details: Record<string, any>;
}

// University Types
export interface University {
  id: string;
  name: string;
  code: string;
  email: string;
  country: string;
  foundedYear: number;
  status: 'active' | 'inactive' | 'suspended';
  studentsCount: number;
  diplomasIssued: number;
  createdAt: Date;
}

// Student Types
export interface Student {
  id: string;
  universityId: string;
  studentId: string;
  name: string;
  email: string;
  program: string;
  enrollmentDate: Date;
  expectedGraduation: Date;
  status: 'enrolled' | 'graduated' | 'suspended' | 'withdrawn';
  gpa?: number;
  public_key: string;
}

// Diploma Types
export interface Diploma {
  id: string;
  blockHash: string;
  studentId: string;
  universityId: string;
  studentName: string;
  program: string;
  graduationDate: Date;
  issuanceDate: Date;
  status: 'issued' | 'verified' | 'revoked';
  ipfsHash?: string;
  verificationCount: number;
  metadata: {
    honors?: string;
    gpa?: number;
    additionalInfo?: string;
  };
}

// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'moderator';
  permissions: string[];
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended';
}

// Modal & UI Types
export interface ModalState {
  isOpen: boolean;
  data?: any;
  type?: 'view' | 'edit' | 'delete' | 'create';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
