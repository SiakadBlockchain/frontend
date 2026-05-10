'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, X, Loader2, BookOpen, GraduationCap, Info } from 'lucide-react';
import {
  fetchStudiesByUniversity,
  fetchStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  fetchStudentByKTP,
  fetchStudentById,
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StudiesPage() {
  const { universityId, loading: authLoading } = useAuth();

  const [studies, setStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);

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

  const [formData, setFormData] = useState({
    nik: '',
    major: '',
    level: 'S1',
    nim: ''
  });

  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadStudies = useCallback(async () => {
    if (!universityId) return;
    setLoading(true);
    try {
      const res = await fetchStudiesByUniversity(universityId, page, limit);
      setStudies(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      showToast('Failed to load study data');
    } finally {
      setLoading(false);
    }
  }, [universityId, page, limit]);

  useEffect(() => {
    if (!authLoading && universityId) {
      loadStudies();
    }
  }, [authLoading, universityId, loadStudies]);

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const studyRes = await fetchStudyById(id);
      const studyData = studyRes.data;
      const studentRes = await fetchStudentById(studyData.student_id);
      
      setSelectedStudy({
        ...studyData,
        student_profile: studentRes.data
      });
    } catch (err) {
      showToast('Failed to fetch complete details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({ nik: '', major: '', level: 'S1', nim: '' });
    setIsFormModalOpen(true);
  }

  function handleEdit(study: any) {
    setIsEdit(true);
    setSelectedStudy(study);
    setFormData({
      nik: 'KTP_HIDDEN',
      major: study.major,
      level: study.level,
      nim: study.nim
    });
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    if (!universityId) return;
    try {
      let studentId = '';
      if (!isEdit) {
        try {
          const studentRes = await fetchStudentByKTP(formData.nik);
          studentId = studentRes.data.id;
        } catch (err: any) {
          showToast(err.response?.data?.detail?.message || 'Student with that ID number was not found');
          return;
        }
      } else {
        studentId = selectedStudy.student_id;
      }

      const payload = {
        student_id: studentId,
        university_id: universityId,
        major: formData.major,
        level: formData.level,
        nim: formData.nim,
      };

      if (isEdit) {
        await updateStudy(selectedStudy.id, payload);
        showToast('Study record successfully updated', 'success');
      } else {
        await createStudy(payload);
        showToast('Study record successfully added', 'success');
      }
      setIsFormModalOpen(false);
      loadStudies();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "A system error occurred";
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
      await deleteStudy(selectedDeleteId);
      setIsDeleteModalOpen(false);
      setSelectedDeleteId(null);
      loadStudies();
      showToast('Study record successfully deleted', 'success');
    } catch (err) {
      showToast('Failed to delete study record');
    }
  }

  if (authLoading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Initializing...</div>;

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Studies Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Registry of student enrollments and academic programs</p>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <Plus size={16} /> Add New Record
          </button>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Student ID (NIM)</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Study Program</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Degree</th>
                  <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Retrieving Records</p>
                    </td>
                  </tr>
                ) : studies.length > 0 ? (
                  studies.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{s.nim}</td>
                      <td className="px-6 py-4">{s.major}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase">
                          {s.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetail(s.id)} className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(s)} className="p-2 text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-muted/20"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-border rounded-md hover:bg-destructive/5"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-muted-foreground text-xs uppercase font-bold tracking-widest">No studies found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <button 
            disabled={page === 1} 
            onClick={() => setPage((p) => p - 1)} 
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted transition-all disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <button 
            disabled={page === totalPages || totalPages === 0} 
            onClick={() => setPage((p) => p + 1)} 
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted transition-all disabled:opacity-30"
          >
            Next
          </button>
        </div>

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update Study Record' : 'Create New Record'}</h2>
              </div>
              <div className="p-6 space-y-5">
                {!isEdit && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">National ID (NIK)</label>
                    <input
                      placeholder="16-digit number"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student NIM</label>
                    <input
                      placeholder="NIM"
                      value={formData.nim}
                      onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Degree Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all appearance-none"
                    >
                      {['D3', 'D4', 'S1', 'S2', 'S3'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Major / Study Program</label>
                  <input
                    placeholder="e.g. Information Technology"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Confirm</button>
                <button onClick={() => setIsFormModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Academic Details</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)}><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">NIM</p>
                      <p className="font-mono text-sm font-bold">{selectedStudy?.nim}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xs font-bold uppercase text-primary tracking-wider">{selectedStudy?.level} Program</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Program of Study</p>
                      <p className="font-medium">{selectedStudy?.major}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border space-y-5">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-primary" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Student Identity</h3>
                    </div>
                    <div className="space-y-4 bg-muted/20 p-4 rounded-md border border-border/50">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Full Name</p>
                        <p className="font-bold text-sm uppercase">{selectedStudy?.student_profile?.name || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">National ID</p>
                          <p className="font-mono text-xs">{selectedStudy?.student_profile?.ktp_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Contact</p>
                          <p className="text-xs">{selectedStudy?.student_profile?.phone_number || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Registered Email</p>
                        <p className="text-xs">{selectedStudy?.student_profile?.email || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full py-3 bg-muted hover:bg-muted/80 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest border border-border"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-sm p-8 text-center">
              <h2 className="text-lg font-bold tracking-tight">Delete Record?</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-8">This action is permanent and will remove the student enrollment from this university.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 bg-destructive text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-md border shadow-sm ${
              toast.type === 'error' ? 'bg-background border-destructive text-destructive' : 'bg-primary text-white border-primary'
            }`}>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{toast.type}</p>
                <p className="text-xs font-medium mt-1.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}