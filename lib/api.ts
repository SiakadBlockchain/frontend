import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export const createDiploma = async (formData: FormData) => {
  const res = await api.post('/diplomas/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateDiploma = async (id: string, data: any) => {
  const res = await api.put(`/diplomas/${id}`, data);
  return res.data;
};

export const deleteDiploma = async (id: string) => {
  const res = await api.delete(`/diplomas/${id}`);
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

export const verifyDiplomaOnChain = async (docHash: string) => {
  const res = await api.get(`/diplomas/verify-on-chain/${docHash}`);
  return res.data;
};

export const verifyAndDownloadDiploma = async (diplomaId: string, keyFile: File) => {
  const formData = new FormData();
  formData.append('key_file', keyFile);

  const res = await api.post(`/diplomas/${diplomaId}/verify-and-download`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
  const res = await api.post(`/transactions/${transactionId}/approve`);
  return res.data;
};