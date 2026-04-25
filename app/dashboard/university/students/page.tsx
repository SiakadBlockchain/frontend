'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, Download, X, AlertCircle } from 'lucide-react';
import {
  fetchStudentsByUniversity,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StudentsPage() {
  const { universityId, loading: authLoading } = useAuth();

  // State Data
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // State Loading & Pagination
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  // State Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  
  // State Key Data
  const [generatedKey, setGeneratedKey] = useState<{name: string, key: string} | null>(null);

  // State Form
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: '', nim: '' });

  // State Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadStudents = useCallback(async () => {
    if (!universityId) return;
    setLoading(true);
    try {
      const res = await fetchStudentsByUniversity(universityId, page, limit);
      setStudents(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      showToast('Gagal memuat data mahasiswa');
    } finally {
      setLoading(false);
    }
  }, [universityId, page]);

  useEffect(() => {
    if (!authLoading && universityId) {
      loadStudents();
    }
  }, [authLoading, universityId, loadStudents]);

  // Fungsi Download File (Universal)
  const downloadKeyFile = (name: string, key: string, type: 'private' | 'public') => {
    const element = document.createElement("a");
    const file = new Blob([key], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${name.replace(/\s+/g, '_').toLowerCase()}_${type}_key.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  async function handleSubmit() {
    if (!universityId) return;
    try {
      const payload = { ...formData, university_id: universityId };

      if (isEdit) {
        await updateStudent(selectedStudent.id, payload);
        setIsFormModalOpen(false);
        showToast('Data mahasiswa berhasil diperbarui', 'success');
      } else {
        const response = await createStudent(payload);
        const privateKey = response.data.cryptography.private_key;
        const studentName = response.data.student_info.name;

        setGeneratedKey({ name: studentName, key: privateKey });
        setIsFormModalOpen(false);
        setIsSuccessModalOpen(true);
      }
      loadStudents();
    } catch (err: any) {
      // Menangkap error detail dari backend (misal: NIM already registered)
      const errorMsg = err.response?.data?.detail?.message || err.message || "Terjadi kesalahan";
      showToast(errorMsg);
    }
  }

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchStudentById(id);
      setSelectedStudent(res.data);
    } catch (err) {
      showToast('Gagal mengambil detail mahasiswa');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({ name: '', nim: '' });
    setIsFormModalOpen(true);
  }

  function handleEdit(student: any) {
    setIsEdit(true);
    setSelectedStudent(student);
    setFormData({ name: student.name, nim: student.nim });
    setIsFormModalOpen(true);
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
      setSelectedDeleteId(null);
      loadStudents();
      showToast('Mahasiswa berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus mahasiswa');
    }
  }

  if (authLoading) return <div className="p-6">Loading authentication...</div>;
  if (!universityId) return <div className="p-6 text-red-500">Unauthorized</div>;

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
            <p className="text-muted-foreground mt-2">Manage student records and enrollment status</p>
          </div>
          <button onClick={handleAdd} className="cursor-pointer border px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 font-medium">
            <Plus size={18} /> Add Student
          </button>
        </div>

        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">NIM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center p-6 text-muted-foreground">Loading...</td></tr>
                ) : students.map((student) => (
                  <tr key={student.id} className="border-b border-border table-row-hover">
                    <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm font-mono">{student.nim}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleViewDetail(student.id)} className="cursor-pointer p-2 rounded-md border border-border hover:bg-muted"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(student)} className="cursor-pointer p-2 rounded-md border border-border hover:bg-muted"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(student.id)} className="cursor-pointer p-2 rounded-md border border-destructive text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>

        {/* MODAL FORM */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Student Name</label>
                  <input 
                    placeholder="e.g. John Doe"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">NIM</label>
                  <input 
                    placeholder="e.g. 211011526..."
                    value={formData.nim} 
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })} 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background font-mono focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="cursor-pointer flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">Save</button>
                <button onClick={() => setIsFormModalOpen(false)} className="cursor-pointer flex-1 px-4 py-2 border border-border rounded-md">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL SUCCESS & DOWNLOAD PRIVATE KEY */}
        {isSuccessModalOpen && generatedKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-8 text-center shadow-2xl">
              <h2 className="text-2xl font-bold mb-2">Student Created!</h2>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-md mb-6 text-blue-600 dark:text-blue-400 text-xs text-left">
                <strong>PENTING:</strong> Simpan private key ini dengan aman. Kunci ini hanya ditampilkan sekali.
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => downloadKeyFile(generatedKey.name, generatedKey.key, 'private')}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-colors"
                >
                  <Download size={20} /> Download Private Key (.txt)
                </button>
                <button onClick={() => setIsSuccessModalOpen(false)} className="cursor-pointer w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Selesai & Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAIL + DOWNLOAD PUBLIC KEY */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 shadow-xl">
              {detailLoading ? <p className="text-center p-4">Loading details...</p> : (
                <>
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">Student Details</h2>
                  <div className="space-y-4">
                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</p><p className="text-foreground">{selectedStudent?.name}</p></div>
                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NIM</p><p className="font-mono text-foreground">{selectedStudent?.nim}</p></div>
                    <div className="pt-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cryptography</p>
                      <button 
                        onClick={() => {
                          if (selectedStudent && selectedStudent.public_key) {
                            downloadKeyFile(selectedStudent.name, selectedStudent.public_key, 'public');
                          } else {
                            showToast('Public key tidak ditemukan pada data mahasiswa ini');
                          }
                        }}
                        className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary border-2 border-primary rounded-md text-sm font-bold hover:bg-primary/5 transition-all"
                      >
                        <Download size={16} /> Download Public Key (.txt)
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer w-full mt-8 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors font-medium">Close</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MODAL DELETE */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-sm p-6">
              <h2 className="text-lg font-bold mb-2">Delete Student</h2>
              <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="cursor-pointer flex-1 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90">Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="cursor-pointer flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION SYSTEM*/}
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