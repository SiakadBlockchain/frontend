import {
  User,
  University,
  Student,
  Diploma,
  AdminUser,
  BlockchainBlock,
  Transaction,
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'validator@siakadchain.com',
    name: 'Dr. Ahmad Validator',
    role: 'validator',
    walletAddress: '0x1234567890123456789012345678901234567890',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'admin@siakadchain.com',
    name: 'Admin System',
    role: 'admin',
    walletAddress: '0x0987654321098765432109876543210987654321',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'university@itb.ac.id',
    name: 'Dr. Bambang ITB',
    role: 'university',
    institution: 'Institut Teknologi Bandung',
    createdAt: new Date('2024-02-01'),
  },
];

// Mock Universities
export const mockUniversities: University[] = [
  {
    id: 'uni-001',
    name: 'Institut Teknologi Bandung',
    code: 'ITB',
    email: 'registrar@itb.ac.id',
    country: 'Indonesia',
    foundedYear: 1920,
    status: 'active',
    studentsCount: 18500,
    diplomasIssued: 2340,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'uni-002',
    name: 'Universitas Indonesia',
    code: 'UI',
    email: 'registrar@ui.ac.id',
    country: 'Indonesia',
    foundedYear: 1849,
    status: 'active',
    studentsCount: 32100,
    diplomasIssued: 4200,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'uni-003',
    name: 'Institut Pertanian Bogor',
    code: 'IPB',
    email: 'registrar@ipb.ac.id',
    country: 'Indonesia',
    foundedYear: 1960,
    status: 'active',
    studentsCount: 12800,
    diplomasIssued: 1620,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'uni-004',
    name: 'Universitas Airlangga',
    code: 'UNAIR',
    email: 'registrar@unair.ac.id',
    country: 'Indonesia',
    foundedYear: 1954,
    status: 'active',
    studentsCount: 28400,
    diplomasIssued: 3100,
    createdAt: new Date('2024-02-01'),
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'std-001',
    universityId: 'uni-001',
    studentId: '13522001',
    name: 'Arga Setiawan',
    email: 'arga@itb.ac.id',
    program: 'Bachelor of Computer Science',
    enrollmentDate: new Date('2022-09-01'),
    expectedGraduation: new Date('2026-06-15'),
    status: 'enrolled',
    gpa: 3.85,
  },
  {
    id: 'std-002',
    universityId: 'uni-001',
    studentId: '13522002',
    name: 'Sinta Kusuma',
    email: 'sinta@itb.ac.id',
    program: 'Master of Engineering',
    enrollmentDate: new Date('2023-09-01'),
    expectedGraduation: new Date('2025-08-15'),
    status: 'enrolled',
    gpa: 3.92,
  },
  {
    id: 'std-003',
    universityId: 'uni-001',
    studentId: '13522003',
    name: 'Rudi Hermawan',
    email: 'rudi@itb.ac.id',
    program: 'Bachelor of Computer Science',
    enrollmentDate: new Date('2021-09-01'),
    expectedGraduation: new Date('2025-06-15'),
    status: 'enrolled',
    gpa: 3.65,
  },
  {
    id: 'std-004',
    universityId: 'uni-002',
    studentId: '2024001',
    name: 'Maya Angelina',
    email: 'maya@ui.ac.id',
    program: 'Bachelor of Law',
    enrollmentDate: new Date('2022-08-01'),
    expectedGraduation: new Date('2026-07-15'),
    status: 'enrolled',
    gpa: 3.78,
  },
  {
    id: 'std-005',
    universityId: 'uni-002',
    studentId: '2024002',
    name: 'Budi Santoso',
    email: 'budi@ui.ac.id',
    program: 'Bachelor of Economics',
    enrollmentDate: new Date('2021-09-01'),
    expectedGraduation: new Date('2025-07-15'),
    status: 'graduated',
    gpa: 3.71,
  },
];

// Mock Diplomas
export const mockDiplomas: Diploma[] = [
  {
    id: 'dip-001',
    blockHash: 'hash_0x1234567890abcdef1234567890abcdef1234567890',
    studentId: 'std-005',
    universityId: 'uni-002',
    studentName: 'Budi Santoso',
    program: 'Bachelor of Economics',
    graduationDate: new Date('2025-07-15'),
    issuanceDate: new Date('2025-08-01'),
    status: 'verified',
    ipfsHash: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    verificationCount: 45,
    metadata: {
      honors: 'Cum Laude',
      gpa: 3.71,
    },
  },
  {
    id: 'dip-002',
    blockHash: 'hash_0xabcdef1234567890abcdef1234567890abcdef12',
    studentId: 'std-004',
    universityId: 'uni-002',
    studentName: 'Maya Angelina',
    program: 'Bachelor of Law',
    graduationDate: new Date('2026-07-15'),
    issuanceDate: new Date('2026-08-01'),
    status: 'issued',
    ipfsHash: 'QmYyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    verificationCount: 12,
    metadata: {
      gpa: 3.78,
    },
  },
  {
    id: 'dip-003',
    blockHash: 'hash_0xf1234567890abcdef1234567890abcdef1234567',
    studentId: 'std-001',
    universityId: 'uni-001',
    studentName: 'Arga Setiawan',
    program: 'Bachelor of Computer Science',
    graduationDate: new Date('2026-06-15'),
    issuanceDate: new Date('2026-07-01'),
    status: 'issued',
    ipfsHash: 'QmZzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    verificationCount: 5,
    metadata: {
      gpa: 3.85,
    },
  },
];

// Mock Admin Users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    email: 'superadmin@siakadchain.com',
    name: 'Super Administrator',
    role: 'super_admin',
    permissions: ['all'],
    lastLogin: new Date(),
    status: 'active',
  },
  {
    id: 'admin-002',
    email: 'moderator@siakadchain.com',
    name: 'Content Moderator',
    role: 'moderator',
    permissions: ['view_diplomas', 'verify_diplomas', 'manage_reports'],
    lastLogin: new Date(Date.now() - 86400000),
    status: 'active',
  },
];

// Mock Blockchain Blocks
export const mockBlocks: BlockchainBlock[] = [
  {
    blockHash: 'hash_0x1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 1025,
    timestamp: new Date('2024-03-20T14:30:00Z'),
    transactions: 45,
    previousHash: 'hash_0xabcdef1234567890abcdef1234567890abcdef12',
    miner: '0x1234567890123456789012345678901234567890',
  },
  {
    blockHash: 'hash_0xabcdef1234567890abcdef1234567890abcdef12',
    blockNumber: 1024,
    timestamp: new Date('2024-03-20T13:15:00Z'),
    transactions: 38,
    previousHash: 'hash_0xf1234567890abcdef1234567890abcdef1234567',
    miner: '0x0987654321098765432109876543210987654321',
  },
  {
    blockHash: 'hash_0xf1234567890abcdef1234567890abcdef1234567',
    blockNumber: 1023,
    timestamp: new Date('2024-03-20T12:00:00Z'),
    transactions: 52,
    previousHash: 'hash_0x7654321098765432109876543210987654321098',
    miner: '0x1111111111111111111111111111111111111111',
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    from: '0x1234567890123456789012345678901234567890',
    to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    type: 'diploma_issued',
    status: 'confirmed',
    timestamp: new Date('2024-03-20T14:35:22Z'),
    blockNumber: 1025,
    details: {
      studentId: 'std-001',
      studentName: 'Arga Setiawan',
      program: 'Bachelor of Computer Science',
      universityId: 'uni-001',
    },
  },
  {
    id: 'tx-002',
    from: '0x0987654321098765432109876543210987654321',
    to: '0x1111111111111111111111111111111111111111',
    type: 'student_registered',
    status: 'confirmed',
    timestamp: new Date('2024-03-20T13:20:15Z'),
    blockNumber: 1024,
    details: {
      studentId: 'std-004',
      studentName: 'Maya Angelina',
      universityId: 'uni-002',
    },
  },
  {
    id: 'tx-003',
    from: '0x1234567890123456789012345678901234567890',
    to: '0x2222222222222222222222222222222222222222',
    type: 'diploma_issued',
    status: 'confirmed',
    timestamp: new Date('2024-03-20T12:05:10Z'),
    blockNumber: 1023,
    details: {
      studentId: 'std-005',
      studentName: 'Budi Santoso',
      program: 'Bachelor of Economics',
      universityId: 'uni-002',
    },
  },
  {
    id: 'tx-004',
    from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    to: '0x1234567890123456789012345678901234567890',
    type: 'admin_action',
    status: 'pending',
    timestamp: new Date(),
    details: {
      action: 'university_verification',
      universityId: 'uni-003',
    },
  },
];

// Helper functions to get filtered data
export function getUniversityStudents(universityId: string): Student[] {
  return mockStudents.filter((s) => s.universityId === universityId);
}

export function getStudentDiplomas(studentId: string): Diploma[] {
  return mockDiplomas.filter((d) => d.studentId === studentId);
}

export function getUniversityDiplomas(universityId: string): Diploma[] {
  return mockDiplomas.filter((d) => d.universityId === universityId);
}

export function getTransactionsByType(type: Transaction['type']): Transaction[] {
  return mockTransactions.filter((t) => t.type === type);
}

// Combined mock data export
export const mockData = {
  users: mockUsers,
  universities: mockUniversities,
  students: mockStudents,
  diplomas: mockDiplomas,
  blocks: mockBlocks,
  transactions: mockTransactions,
};
