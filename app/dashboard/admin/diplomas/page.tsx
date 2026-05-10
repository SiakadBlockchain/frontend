'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Eye, X, Loader2, Award, Hash, Info, FileText } from 'lucide-react';
import {
  fetchDiplomas,
  fetchDiplomaById,
  fetchUniversities,
} from '@/lib/api';

export default function DiplomasPage() {
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedDiploma, setSelectedDiploma] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadUniversitiesList = async () => {
    try {
      const res = await fetchUniversities(1, 100); 
      setUniversities(res.data);
    } catch (err) {
      showToast('Failed to load university list');
    }
  };

  const loadDiplomas = useCallback(async () => {
    try {
      const res = await fetchDiplomas(page, limit);
      setDiplomas(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      showToast('Failed to retrieve diploma records');
    }
  }, [page, limit]);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([loadDiplomas(), loadUniversitiesList()]);
      setLoading(false);
    };
    initLoad();
  }, [loadDiplomas]);

  const getUniversityName = (id: string) => {
    const univ = universities.find((u) => u.id === id);
    return univ ? univ.name : 'Unknown University';
  };

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchDiplomaById(id);
      setSelectedDiploma(res.data);
    } catch (err) {
      showToast('Failed to fetch diploma details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Diplomas Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor verified academic credentials on Blockchain</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Diploma Number</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">University</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Verification Status</th>
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
                ) : diplomas.length > 0 ? (
                  diplomas.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{d.diploma_number}</td>
                      <td className="px-6 py-4">{getUniversityName(d.university_id)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 border text-[10px] font-bold rounded uppercase ${
                          d.status === 'valid' 
                            ? 'border-green-500/20 bg-green-500/5 text-green-600' 
                            : 'border-destructive/20 bg-destructive/5 text-destructive'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewDetail(d.id)} 
                          className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-muted-foreground text-xs uppercase font-bold tracking-widest">No diploma records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
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

        {/* DETAIL MODAL */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Diploma Credential Details</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Diploma Serial Number</p>
                      <p className="font-mono text-base font-bold text-primary">{selectedDiploma?.diploma_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Student ID</p>
                      <p className="font-mono text-sm">{selectedDiploma?.student_id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Integrity Status</p>
                      <p className="text-xs font-bold uppercase text-green-600 tracking-wider">Verified</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border space-y-5">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-primary" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Metadata Information</h3>
                    </div>
                    
                    <div className="space-y-4 bg-muted/20 p-4 rounded-md border border-border/50">
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 leading-none">University Provider</p>
                        <p className="font-bold text-xs uppercase">{getUniversityName(selectedDiploma?.university_id)}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <FileText size={10} className="text-muted-foreground" />
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">IPFS Content Identifier</p>
                        </div>
                        <p className="font-mono text-[10px] break-all bg-background p-2 border border-border rounded text-primary">
                          {selectedDiploma?.ipfs_cid || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Hash size={10} className="text-muted-foreground" />
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Blockchain Transaction Hash</p>
                        </div>
                        <p className="font-mono text-[10px] break-all bg-background p-2 border border-border rounded text-muted-foreground">
                          {selectedDiploma?.tx_hash || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOAST SYSTEM */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-md border shadow-sm ${
              toast.type === 'error' ? 'bg-background border-destructive text-destructive' : 'bg-primary text-white border-primary'
            }`}>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{toast.type}</p>
                <p className="text-xs font-medium mt-1.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}