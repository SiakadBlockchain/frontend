'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import {
  fetchStudents,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchUniversities,
} from '@/lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    university_id: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStudents(page, limit);
      setStudents(res.data);
      setTotal(res.meta?.total || res.data.length);
    } catch (err) {
      showToast('Gagal memuat data mahasiswa');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const loadUniversities = useCallback(async () => {
    try {
      const res = await fetchUniversities(1, 100);
      setUniversities(res.data);
    } catch (err) {
      showToast('Gagal memuat daftar universitas');
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadUniversities();
  }, [loadStudents, loadUniversities]);

  const getUniversityName = (univId: string) => {
    return universities.find((u) => u.id === univId)?.name || 'Unknown';
  };

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchStudentById(id);
      setSelectedStudent(res.data);
    } catch (err) {
      showToast('Gagal memuat detail mahasiswa');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({ name: '', nim: '', university_id: '' });
    setIsFormModalOpen(true);
  }

  function handleEdit(student: any) {
    setIsEdit(true);
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      nim: student.nim,
      university_id: student.university_id,
    });
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (isEdit) {
        await updateStudent(selectedStudent.id, formData);
        showToast('Data mahasiswa berhasil diperbarui', 'success');
      } else {
        await createStudent(formData);
        showToast('Mahasiswa berhasil ditambahkan', 'success');
      }
      setIsFormModalOpen(false);
      loadStudents();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "Terjadi kesalahan";
      showToast(errorMsg);
    }
  }

  function handleDelete(id: string) {
    setSelectedDeleteId(id);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedDeleteId) return;
    try {
      await deleteStudent(selectedDeleteId);
      setIsDeleteModalOpen(false);
      loadStudents();
      showToast('Mahasiswa berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus mahasiswa');
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
            <p className="text-muted-foreground mt-2">Manage student records and enrollment status</p>
          </div>
        </div>

        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">NIM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">University</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-muted-foreground">Loading data...</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-border table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                      <td className="px-6 py-4 text-sm font-mono">{student.nim}</td>
                      <td className="px-6 py-4 text-sm">{getUniversityName(student.university_id)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetail(student.id)} className="p-2 rounded-md border border-border hover:bg-muted cursor-pointer">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEdit(student)} className="p-2 rounded-md border border-border hover:bg-muted cursor-pointer">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(student.id)} className="p-2 rounded-md border border-destructive text-destructive hover:bg-destructive/10 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                />
                <input
                  placeholder="NIM"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background font-mono focus:ring-1 focus:ring-primary outline-none"
                />
                <select
                  value={formData.university_id}
                  onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium cursor-pointer">Save</button>
                <button onClick={() => setIsFormModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
              {detailLoading ? (
                <p className="text-muted-foreground text-center">Loading...</p>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">{selectedStudent?.name}</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">NIM</p>
                      <p className="text-foreground font-mono">{selectedStudent?.nim}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">University</p>
                      <p className="text-foreground">{getUniversityName(selectedStudent?.university_id)}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailModalOpen(false)} className="w-full mt-8 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors font-medium cursor-pointer">Close</button>
                </>
              )}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-sm p-6">
              <h2 className="text-lg font-bold mb-2">Delete Student</h2>
              <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-primary text-white rounded-md font-medium cursor-pointer">Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-5 duration-300">
            <div className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-2xl border-2 ${
              toast.type === 'error' 
              ? 'bg-white border-primary text-primary'
              : 'bg-primary text-white border-primary'
            }`}>
              <div className="flex flex-col">
                <p className="text-sm font-bold leading-none">{toast.type === 'error' ? 'Error' : 'Success'}</p>
                <p className="text-xs opacity-90 mt-1">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="cursor-pointer ml-4 p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}