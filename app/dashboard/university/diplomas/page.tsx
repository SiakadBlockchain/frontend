'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Eye, Trash2, Plus, Edit2, Upload, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import {
  fetchDiplomasByUniversity,
  fetchDiplomaById,
  deleteDiploma,
  createDiploma,
  updateDiploma,
  fetchStudentsByUniversity,
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function DiplomasPage() {
  const { universityId, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Data
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDiploma, setSelectedDiploma] = useState<any | null>(null);

  // State Loading
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  // Form State
  const [isEdit, setIsEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    diploma_number: '',
    status: 'pending'
  });

  // State Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadDiplomas = useCallback(async () => {
    if (!universityId) return;
    setLoading(true);
    try {
      const res = await fetchDiplomasByUniversity(universityId, page, limit);
      setDiplomas(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      showToast('Gagal memuat data diploma');
    } finally {
      setLoading(false);
    }
  }, [universityId, page]);

  const loadStudents = useCallback(async () => {
    if (!universityId) return;
    try {
      const res = await fetchStudentsByUniversity(universityId, 1, 100);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  }, [universityId]);

  useEffect(() => {
    if (!authLoading && universityId) {
      loadDiplomas();
      loadStudents();
    }
  }, [authLoading, universityId, loadDiplomas, loadStudents]);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      showToast("Harap unggah file PDF yang valid");
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedFile(null);
    setFormData({ student_id: '', diploma_number: '', status: 'pending' });
    setIsFormModalOpen(true);
  };

  const handleEdit = (diploma: any) => {
    if (diploma.status === 'valid') {
      showToast('Diploma yang sudah valid tidak dapat diubah');
      return;
    }
    setIsEdit(true);
    setSelectedDiploma(diploma);
    setFormData({
      student_id: diploma.student_id,
      diploma_number: diploma.diploma_number,
      status: diploma.status
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!universityId) return;
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updateDiploma(selectedDiploma.id, { // Mengikuti pola updateStudent di ref
            ...formData,
            university_id: universityId
        });
        showToast('Diploma berhasil diperbarui', 'success');
      } else {
        const data = new FormData();
        data.append('student_id', formData.student_id);
        data.append('university_id', universityId);
        data.append('diploma_number', formData.diploma_number);
        if (selectedFile) data.append('file', selectedFile);

        await createDiploma(data);
        showToast('Diploma berhasil diterbitkan', 'success');
      }
      setIsFormModalOpen(false);
      loadDiplomas();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Terjadi kesalahan";
      showToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchDiplomaById(id);
      setSelectedDiploma(res.data);
    } catch (err) {
      showToast('Gagal mengambil detail diploma');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function confirmDelete() {
    if (!selectedDeleteId) return;
    try {
      await deleteDiploma(selectedDeleteId);
      setIsDeleteModalOpen(false);
      setSelectedDeleteId(null);
      loadDiplomas();
      showToast('Diploma berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus diploma');
    }
  }

  if (authLoading) return <div className="p-6 text-center">Loading authentication...</div>;
  if (!universityId) return <div className="p-6 text-red-500 text-center">Unauthorized</div>;

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diplomas Management</h1>
            <p className="text-muted-foreground mt-2">Issue and manage blockchain-secured academic credentials</p>
          </div>

          <button onClick={handleAdd} className="cursor-pointer border px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 font-medium transition-all">
            <Plus size={18} /> Issue New Diploma
          </button>
        </div>

        {/* Table */}
        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Diploma Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center p-12 text-muted-foreground">Loading...</td></tr>
                ) : diplomas.length === 0 ? (
                  <tr><td colSpan={3} className="text-center p-12 text-muted-foreground">No diplomas issued yet.</td></tr>
                ) : (
                  diplomas.map((d) => (
                    <tr key={d.id} className="border-b border-border table-row-hover">
                      <td className="px-6 py-4 text-sm font-mono">{d.diploma_number}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          d.status === 'valid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          d.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {d.status === 'valid' ? <CheckCircle size={10}/> : <AlertCircle size={10}/>}
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleViewDetail(d.id)} className="cursor-pointer p-2 rounded-md border border-border hover:bg-muted" title="View Detail"><Eye size={16} /></button>
                          
                          {/* Disable Edit & Delete if status is valid */}
                          <button 
                            onClick={() => handleEdit(d)} 
                            disabled={d.status === 'valid'}
                            className={`p-2 rounded-md border border-border transition-colors ${d.status === 'valid' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'}`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedDeleteId(d.id); setIsDeleteModalOpen(true); }}
                            disabled={d.status === 'valid'}
                            className={`p-2 rounded-md border transition-colors ${d.status === 'valid' ? 'opacity-30 cursor-not-allowed border-border' : 'cursor-pointer border-destructive text-destructive hover:bg-destructive/10'}`}
                            title="Delete"
                          >
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <span className="text-sm text-muted-foreground font-medium">Page {page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>

        {/* MODAL FORM (ADD/EDIT) */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 shadow-2xl">
              <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Diploma Record' : 'Issue New Diploma'}</h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</label>
                  <select 
                    value={formData.student_id}
                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none text-sm"
                    disabled={isEdit}
                  >
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nim})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Diploma Number</label>
                  <input
                    placeholder="e.g. 001/FTI/2026"
                    value={formData.diploma_number}
                    onChange={(e) => setFormData({ ...formData, diploma_number: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                  />
                </div>

                {!isEdit && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Diploma PDF File</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Upload size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-medium">{selectedFile ? selectedFile.name : 'Click to upload PDF'}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Maximum size 5MB</p>
                      </div>
                      <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || (!isEdit && (!selectedFile || !formData.student_id))}
                  className="cursor-pointer flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Save'}
                </button>
                <button onClick={() => setIsFormModalOpen(false)} className="cursor-pointer flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted font-medium transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAIL (Disesuaikan dengan desain Students) */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 shadow-xl">
              {detailLoading ? <p className="text-center p-4">Loading details...</p> : (
                <>
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">Diploma Details</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Diploma Number</p>
                      <p className="font-mono text-foreground">{selectedDiploma?.diploma_number}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Student ID</p>
                      <p className="text-foreground">{selectedDiploma?.student_id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                            <p className={`text-sm font-bold uppercase ${selectedDiploma?.status === 'valid' ? 'text-green-500' : 'text-yellow-500'}`}>{selectedDiploma?.status}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Block Number</p>
                            <p className="text-foreground font-mono">{selectedDiploma?.block_number || '-'}</p>
                        </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Blockchain Proof</p>
                      <div className="bg-muted/50 p-3 rounded-md border border-border overflow-hidden">
                        <p className="text-[10px] font-mono break-all text-muted-foreground">IPFS: {selectedDiploma?.ipfs_cid}</p>
                        <p className="text-[10px] font-mono break-all text-muted-foreground mt-1 text-primary">TX: {selectedDiploma?.tx_hash || 'Pending on chain...'}</p>
                      </div>
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
              <h2 className="text-lg font-bold mb-2">Delete Diploma</h2>
              <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="cursor-pointer flex-1 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors">Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="cursor-pointer flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION SYSTEM */}
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
              <button onClick={() => setToast(null)} className="cursor-pointer ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}