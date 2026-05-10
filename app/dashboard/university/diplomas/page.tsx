'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  Eye, 
  Trash2, 
  Plus, 
  Edit2, 
  Upload, 
  X, 
  Search, 
  FileKey,
  Loader2,
  Award,
  Hash,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  fetchDiplomasByUniversity,
  fetchDiplomaById,
  deleteDiploma,
  createDiploma,
  updateDiploma,
  fetchStudyByNim,
  fetchStudyById,
  fetchStudentById,
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function DiplomasPage() {
  const { universityId, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [selectedDiploma, setSelectedDiploma] = useState<any | null>(null);
  const [foundStudy, setFoundStudy] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingNim, setIsSearchingNim] = useState(false);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [univKeyFile, setUnivKeyFile] = useState<File | null>(null);
  const [searchNim, setSearchNim] = useState('');
  const [formData, setFormData] = useState({
    studies_id: '',
    diploma_number: '',
    graduationYear: new Date().getFullYear().toString(),
    status: 'pending' as 'pending' | 'valid' | 'revoked'
  });

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
      showToast('Failed to load diploma records');
    } finally {
      setLoading(false);
    }
  }, [universityId, page]);

  useEffect(() => {
    if (!authLoading && universityId) {
      loadDiplomas();
    }
  }, [authLoading, universityId, loadDiplomas]);

  const handleSearchStudy = async () => {
    if (!searchNim) return;
    setIsSearchingNim(true);
    setFoundStudy(null);
    try {
      const res = await fetchStudyByNim(searchNim);
      if (res.data) {
        setFoundStudy(res.data);
        setFormData(prev => ({ ...prev, studies_id: res.data.id }));
        showToast('Academic record found', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || 'Student ID not found';
      showToast(errorMsg);
    } finally {
      setIsSearchingNim(false);
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedFile(null);
    setUnivKeyFile(null);
    setFoundStudy(null);
    setSearchNim('');
    setFormData({ 
      studies_id: '', 
      diploma_number: '', 
      graduationYear: new Date().getFullYear().toString(),
      status: 'pending' 
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (diploma: any) => {
    if (diploma.status === 'valid') {
      showToast('Validated diplomas cannot be modified');
      return;
    }
    setIsEdit(true);
    setSelectedDiploma(diploma);
    setFormData({
      studies_id: diploma.studies_id,
      diploma_number: diploma.diploma_number,
      graduationYear: diploma.graduationYear,
      status: diploma.status
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!universityId) return;
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updateDiploma(selectedDiploma.id, {
            ...formData,
            document_hash: selectedDiploma.document_hash
        });
        showToast('Diploma updated successfully', 'success');
      } else {
        const data = new FormData();
        data.append('studies_id', formData.studies_id);
        data.append('diploma_number', formData.diploma_number);
        data.append('graduationYear', formData.graduationYear);
        if (selectedFile) data.append('file', selectedFile);
        if (univKeyFile) data.append('univ_key_file', univKeyFile);

        await createDiploma(data);
        showToast('Diploma issued successfully', 'success');
      }
      setIsFormModalOpen(false);
      loadDiplomas();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchDiplomaById(id);
      const diplomaData = res.data;
      const studyRes = await fetchStudyById(diplomaData.studies_id);
      const studyData = studyRes.data;
      const studentRes = await fetchStudentById(studyData.student_id);
      
      setSelectedDiploma({
        ...diplomaData,
        study: {
          ...studyData,
          student: studentRes.data
        }
      });
    } catch (err) {
      showToast('Failed to retrieve diploma details');
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
      showToast('Diploma record deleted', 'success');
    } catch (err) {
      showToast('Failed to delete diploma');
    }
  }

  if (authLoading) return <div className="p-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initializing Auth...</div>;

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Diplomas Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Issue and manage blockchain-secured academic credentials</p>
          </div>
          <button 
            onClick={handleAdd} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <Plus size={16} /> Issue New Diploma
          </button>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Diploma Number</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Retrieving Data</p>
                    </td>
                  </tr>
                ) : diplomas.length > 0 ? (
                  diplomas.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{d.diploma_number}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 border text-[10px] font-bold rounded uppercase tracking-wider ${
                          d.status === 'valid' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetail(d.id)} className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20"><Eye size={16} /></button>
                          <button 
                            onClick={() => handleEdit(d)} 
                            disabled={d.status === 'valid'}
                            className={`p-2 border border-border rounded-md transition-colors ${d.status === 'valid' ? 'opacity-30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedDeleteId(d.id); setIsDeleteModalOpen(true); }}
                            disabled={d.status === 'valid'}
                            className={`p-2 border rounded-md transition-colors ${d.status === 'valid' ? 'opacity-30 border-border cursor-not-allowed' : 'border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5'}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-xs uppercase font-bold tracking-widest text-muted-foreground">No diplomas found</td>
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
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
               <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update Diploma Record' : 'Issue New Diploma'}</h2>
              </div>

              <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
              
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                {!isEdit && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Search Student NIM</label>
                    <div className="flex gap-2">
                      <input
                        placeholder="Enter NIM..."
                        value={searchNim}
                        onChange={(e) => setSearchNim(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-border rounded-md bg-background text-sm focus:border-primary outline-none transition-all"
                      />
                      <button onClick={handleSearchStudy} disabled={isSearchingNim} className="px-3 bg-muted rounded-md hover:bg-muted/80 transition-all">
                        {isSearchingNim ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                      </button>
                    </div>
                  </div>
                )}

                {foundStudy && (
                  <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Selected Candidate</p>
                    <p className="text-sm font-bold mt-1 uppercase">{foundStudy.student?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{foundStudy.major} • {foundStudy.nim}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diploma Number</label>
                  <input
                    value={formData.diploma_number}
                    onChange={(e) => setFormData({ ...formData, diploma_number: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background font-mono text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                {!isEdit && (
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diploma Asset (PDF)</label>
                      <div onClick={() => fileInputRef.current?.click()} className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-all">
                        <Upload size={20} className="text-muted-foreground mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">{selectedFile ? selectedFile.name : 'Upload PDF'}</p>
                        <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">University Auth Key</label>
                      <div onClick={() => keyInputRef.current?.click()} className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-all">
                        <FileKey size={20} className="text-muted-foreground mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">{univKeyFile ? univKeyFile.name : 'Upload Key (.txt/.pem)'}</p>
                        <input type="file" ref={keyInputRef} accept=".txt,.pem" className="hidden" onChange={(e) => setUnivKeyFile(e.target.files?.[0] || null)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 flex gap-3 mt-2">
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || (!isEdit && (!selectedFile || !univKeyFile || !formData.studies_id))}
                  className="flex-1 bg-primary text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Issuance'}
                </button>
                <button onClick={() => setIsFormModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Credential Details</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)}><X size={16} /></button>
              </div>

              <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

              {detailLoading ? (
                <div className="p-16 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-8 overflow-y-auto max-h-[85vh] no-scrollbar">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Student NIM</p>
                      <p className="font-mono text-sm font-bold">{selectedDiploma?.study?.nim || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Degree Level</p>
                      <p className="text-xs font-bold text-primary uppercase">{selectedDiploma?.study?.level || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Major / Program</p>
                      <p className="font-medium">{selectedDiploma?.study?.major || '-'}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4">Diploma Information</p>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Serial Number</p>
                        <p className="font-mono text-xs">{selectedDiploma?.diploma_number}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Status</p>
                        <p className={`text-[10px] font-bold uppercase ${selectedDiploma?.status === 'valid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedDiploma?.status}
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md border border-border">
                       <div className="flex items-center gap-2 mb-2">
                          <Hash size={12} className="text-primary" />
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Blockchain TX Hash</p>
                       </div>
                       <p className="text-[10px] font-mono break-all text-foreground leading-relaxed">
                          {selectedDiploma?.tx_hash || 'Pending network confirmation...'}
                        </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border space-y-4">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Identity Profile</p>
                    <div className="space-y-4 bg-muted/5 p-4 rounded-md border border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Legal Name</p>
                        <p className="font-bold text-sm uppercase tracking-tight">{selectedDiploma?.study?.student?.name || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">National ID</p>
                          <p className="font-mono text-xs">{selectedDiploma?.study?.student?.ktp_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Email</p>
                          <p className="text-xs truncate">{selectedDiploma?.study?.student?.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full py-3 bg-muted hover:bg-muted/80 border border-border rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Close Record
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-sm p-8 text-center">
              <h2 className="text-lg font-bold tracking-tight">Delete Diploma?</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-8">This action is permanent and will remove the record from the management system.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 bg-primary text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-md border shadow-sm ${
              toast.type === 'error' ? 'bg-background border-primary text-primary' : 'bg-primary text-white border-primary'
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