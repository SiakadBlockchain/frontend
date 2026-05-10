'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, X, Loader2, Building2, Info } from 'lucide-react';
import {
  fetchUniversities,
  fetchUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '@/lib/api';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<any | null>(null);
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
    name: '',
    accreditation: '',
  });

  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUniversities(page, limit);
      setUniversities(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      showToast('Failed to load university data');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchUniversityById(id);
      setSelectedUniv(res.data);
    } catch (err) {
      showToast('Failed to retrieve university details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({ name: '', accreditation: '' });
    setIsFormModalOpen(true);
  }

  function handleEdit(univ: any) {
    setIsEdit(true);
    setSelectedUniv(univ);
    setFormData({
      name: univ.name,
      accreditation: univ.accreditation,
    });
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (isEdit) {
        await updateUniversity(selectedUniv.id, formData);
        showToast('University successfully updated', 'success');
      } else {
        await createUniversity(formData);
        showToast('University successfully added', 'success');
      }
      setIsFormModalOpen(false);
      loadUniversities();
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
      await deleteUniversity(selectedDeleteId);
      setIsDeleteModalOpen(false);
      setSelectedDeleteId(null);
      loadUniversities();
      showToast('University successfully deleted', 'success');
    } catch (err) {
      showToast('Failed to delete university');
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Universities Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor registered academic institutions</p>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <Plus size={16} /> Add University
          </button>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">University Name</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Accreditation</th>
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
                ) : universities.length > 0 ? (
                  universities.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase">
                          Rank {u.accreditation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetail(u.id)} className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(u)} className="p-2 text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-muted/20"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-border rounded-md hover:bg-destructive/5"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-muted-foreground text-xs uppercase font-bold tracking-widest">No universities found</td>
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
                <Building2 size={16} className="text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update University' : 'Add New University'}</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Institution Name</label>
                  <input
                    placeholder="Enter full university name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accreditation Rank</label>
                  <select
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all appearance-none"
                  >
                    <option value="">Select Rank</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B">B (Very Good)</option>
                    <option value="C">C (Good)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Save Changes</button>
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
                  <Building2 size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Institution Profile</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)}><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Official Name</p>
                      <p className="text-lg font-bold text-foreground leading-tight">{selectedUniv?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Accreditation Status</p>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                        Grade {selectedUniv?.accreditation}
                      </span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border flex items-start gap-3 bg-muted/10 p-4 rounded-md">
                    <Info size={16} className="text-primary mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                      This institution is registered in the blockchain network for academic credential verification.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full py-3 bg-muted hover:bg-muted/80 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest border border-border"
                  >
                    Close Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-sm p-8 text-center">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Remove University?</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-8 leading-relaxed">
                This action will permanently remove the institution from the registry. This cannot be undone.
              </p>
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