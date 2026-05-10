import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/siakadBlockchain/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================
// USERS
// =========================

export const fetchUsers = async (page = 1, limit = 10) => {
  const res = await api.get('/users', { params: { page, limit } });
  return res.data;
};

export const fetchUserById = async (id: string) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await api.post('/users', data);
  return res.data;
};

export const updateUser = async (id: string, data: any) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};


// =========================
// STUDENTS
// =========================

export const fetchStudents = async (page = 1, limit = 10) => {
  const res = await api.get('/students', { params: { page, limit } });
  return res.data;
};

export const fetchStudentById = async (id: string) => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

export const fetchStudentByKTP = async (ktp: string) => {
  const res = await api.get(`/students/ktp/${ktp}`);
  return res.data;
};

export const createStudent = async (data: any) => {
  const res = await api.post('/students', data);
  return res.data;
};

export const updateStudent = async (id: string, data: any) => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};

export const deleteStudent = async (id: string) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

export const fetchStudentsByUniversity = async (
  universityId: string,
  page = 1,
  limit = 10
) => {
  const res = await api.get(`/students/university/${universityId}`, {
    params: { page, limit }
  });
  return res.data;
};


// =========================
// DIPLOMAS
// =========================

export const fetchDiplomas = async (page = 1, limit = 10) => {
  const res = await api.get('/diplomas', { params: { page, limit } });
  return res.data;
};

export const fetchDiplomaById = async (id: string) => {
  const res = await api.get(`/diplomas/${id}`);
  return res.data;
};

export const fetchDiplomasByUniversity = async (
  universityId: string,
  page = 1,
  limit = 10
) => {
  const res = await api.get(`/diplomas/university/${universityId}`, {
    params: { page, limit }
  });
  return res.data;
};

export const createDiploma = async (formData: FormData) => {
  const res = await api.post('/diplomas/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateDiploma = async (id: string, data: {
  diploma_number: string;
  graduationYear: string;
  studies_id: string;
  document_hash: string;
  status: 'valid' | 'revoked' | 'pending';
  ipfs_cid?: string;
  tx_hash?: string;
  block_number?: number;
}) => {
  const res = await api.put(`/diplomas/${id}`, data);
  return res.data;
};

export const deleteDiploma = async (id: string) => {
  const res = await api.delete(`/diplomas/${id}`);
  return res.data;
};

export const verifyDiplomaOnChain = async (docHash: string) => {
  const res = await api.get(`/diplomas/verify-on-chain/${docHash}`);
  return res.data;
};

export const verifyAndDownloadDiploma = async (diplomaId: string) => {
  const res = await api.post(`/diplomas/${diplomaId}/verify-and-download`, {}, {
    responseType: 'blob', 
  });

  return res.data;
};

// =========================
// UNIVERSITIES
// =========================

export const fetchUniversities = async (page = 1, limit = 10) => {
  const res = await api.get('/universities', { params: { page, limit } });
  return res.data;
};

export const fetchUniversityById = async (id: string) => {
  const res = await api.get(`/universities/${id}`);
  return res.data;
};

export const createUniversity = async (data: any) => {
  const res = await api.post('/universities', data);
  return res.data;
};

export const updateUniversity = async (id: string, data: any) => {
  const res = await api.put(`/universities/${id}`, data);
  return res.data;
};

export const deleteUniversity = async (id: string) => {
  const res = await api.delete(`/universities/${id}`);
  return res.data;
};

// =========================
// TRANSACTIONS
// =========================

export const fetchTransactions = async (page = 1, limit = 10) => {
  const res = await api.get('/transactions', { 
    params: { page, limit } 
  });
  return res.data;
};

export const fetchTransactionById = async (id: string) => {
  const res = await api.get(`/transactions/${id}`);
  return res.data;
};

export const approveTransaction = async (transactionId: string) => {
  try {
    const res = await api.post(`/transactions/${transactionId}/approve`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// =========================
// WALLET
// =========================

export interface OTPVerificationPayload {
  student_id: string;
  otp_code: string;
}

export interface ConnectionUpdatePayload {
  is_connected: boolean;
}

export const verifyOtpAndActivate = async (data: OTPVerificationPayload) => {
  const res = await api.post('/wallets/verify-otp', data);
  return res.data;
};

export const otpRequest = async (data: Omit<OTPVerificationPayload, 'otp_code'>) => {
  const res = await api.post('/wallets/otp-request', data);
  return res.data;
};


export const deleteWallet = async (studentId: string) => {
  const res = await api.delete(`/wallets/remove/${studentId}`);
  return res.data;
};

// =========================
// STUDIES
// =========================

export interface StudyPayload {
  student_id: string;
  university_id: string;
  major: string;
  level: string;
  nim: string;
}

export const fetchStudies = async (page = 1, limit = 10) => {
  const res = await api.get('/studies', { params: { page, limit } });
  return res.data;
};

export const fetchStudyById = async (id: string) => {
  const res = await api.get(`/studies/${id}`);
  return res.data;
};

export const fetchStudyByNim = async (nim: string) => {
  const res = await api.get(`/studies/nim/${nim}`);
  return res.data;
};

export const fetchStudyByStudentId = async (studentId: string) => {
  const res = await api.get(`/studies/student/${studentId}`);
  return res.data;
};

export const createStudy = async (data: StudyPayload) => {
  const res = await api.post('/studies', data);
  return res.data;
};

export const updateStudy = async (id: string, data: StudyPayload) => {
  const res = await api.put(`/studies/${id}`, data);
  return res.data;
};

export const deleteStudy = async (id: string) => {
  const res = await api.delete(`/studies/${id}`);
  return res.data;
};

export const fetchStudiesByUniversity = async (
  universityId: string,
  page = 1,
  limit = 10
) => {
  const res = await api.get(`/studies/university/${universityId}`, {
    params: { page, limit }
  });
  return res.data;
};