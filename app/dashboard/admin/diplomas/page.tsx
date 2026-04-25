'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Eye, Trash2, Plus, X } from 'lucide-react';
import {
  fetchDiplomas,
  fetchDiplomaById,
  deleteDiploma,
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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    student_id: '',
    university_id: '',
    diploma_number: '',
    document_hash: '',
  });

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
      console.error("Gagal memuat daftar universitas:", err);
      showToast('Gagal memuat daftar universitas');
    }
  };

  const loadDiplomas = useCallback(async () => {
    try {
      const res = await fetchDiplomas(page, limit);
      setDiplomas(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data diploma');
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
    return univ ? univ.name : 'Nama Universitas Tidak Tersedia';
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

  function handleAdd() {
    setFormData({
      student_id: '',
      university_id: '',
      diploma_number: '',
      document_hash: '',
    });
    setIsFormModalOpen(true);
  }

  function handleDelete(id: string) {
    setSelectedDeleteId(id);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedDeleteId) return;
    try {
      await deleteDiploma(selectedDeleteId);
      setIsDeleteModalOpen(false);
      setSelectedDeleteId(null);
      loadDiplomas();
      showToast('Data diploma berhasil dihapus', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "Gagal menghapus diploma";
      showToast(errorMsg);
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diplomas Management</h1>
            <p className="text-muted-foreground mt-2">Manage and verify issued diplomas via Blockchain</p>
          </div>
        </div>

        {/* Table */}
        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Diploma No.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">University</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-muted-foreground">Loading data...</td>
                  </tr>
                ) : (
                  diplomas.map((d) => (
                    <tr key={d.id} className="border-b border-border table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium">{d.diploma_number}</td>
                      <td className="px-6 py-4 text-sm">{getUniversityName(d.university_id)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          d.status === 'valid' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetail(d.id)} className="p-2 rounded-md border border-border hover:bg-muted cursor-pointer">
                            <Eye size={16} />
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
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50">
            Next
          </button>
        </div>

        {/* DETAIL MODAL */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-lg p-6 shadow-xl">
              {detailLoading ? (
                <div className="text-center py-10">Memuat data...</div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-foreground">Detail Diploma</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedDiploma?.status === 'valid' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {selectedDiploma?.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="col-span-2 p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Nomor Diploma</p>
                      <p className="font-mono text-lg font-bold text-primary">{selectedDiploma?.diploma_number}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">ID Mahasiswa</p>
                      <p className="font-medium text-foreground">{selectedDiploma?.student_id}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Universitas</p>
                      <p className="font-medium text-foreground">{getUniversityName(selectedDiploma?.university_id)}</p>
                    </div>

                    <div className="col-span-2 border-t border-border pt-4">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">IPFS CID</p>
                      <p className="font-mono text-[11px] break-all text-blue-500 bg-blue-500/5 p-2 rounded mt-1 border border-blue-500/10">
                        {selectedDiploma?.ipfs_cid || '-'}
                      </p>
                    </div>

                    <div className="col-span-2 border-t border-border pt-4">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Transaction Hash (Blockchain)</p>
                      <p className="font-mono text-[11px] break-all text-muted-foreground bg-muted p-2 rounded mt-1">
                        {selectedDiploma?.tx_hash || '-'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full mt-8 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-semibold"
                  >
                    Tutup
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- TOAST NOTIFICATION SYSTEM --- */}
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