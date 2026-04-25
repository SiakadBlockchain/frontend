'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
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
    wallet_address: '',
    is_active: true,
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
      showToast('Gagal memuat data universitas');
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
      showToast('Gagal mengambil detail universitas');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({
      name: '',
      accreditation: '',
      wallet_address: '',
      is_active: true,
    });
    setIsFormModalOpen(true);
  }

  function handleEdit(univ: any) {
    setIsEdit(true);
    setSelectedUniv(univ);
    setFormData(univ);
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (isEdit) {
        await updateUniversity(selectedUniv.id, formData);
        showToast('Universitas berhasil diperbarui', 'success');
      } else {
        await createUniversity(formData);
        showToast('Universitas berhasil ditambahkan', 'success');
      }
      setIsFormModalOpen(false);
      loadUniversities();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "Terjadi kesalahan sistem";
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
      showToast('Universitas berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus universitas');
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Universities Management</h1>
            <p className="text-muted-foreground mt-2">Manage and monitor registered universities</p>
          </div>

          <button
            onClick={handleAdd}
            className="hover:border-primary border cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-accent hover:text-primary transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={18} /> Add University
          </button>
        </div>

        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Accreditation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-muted-foreground">Loading data...</td>
                  </tr>
                ) : (
                  universities.map((u) => (
                    <tr key={u.id} className="border-b border-border table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-sm">{u.accreditation}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`badge-status ${u.is_active ? 'border-foreground' : 'border-border'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetail(u.id)} className="p-2 rounded-md border border-border hover:bg-muted cursor-pointer"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(u)} className="p-2 rounded-md border border-border hover:bg-muted cursor-pointer"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 rounded-md border border-destructive text-destructive hover:bg-destructive/10 cursor-pointer"><Trash2 size={16} /></button>
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
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50">Next</button>
        </div>

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit University' : 'Add University'}</h2>
              <div className="space-y-3">
                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                />
                <select
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Select Accreditation</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <input
                  placeholder="Wallet Address"
                  value={formData.wallet_address}
                  onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none"
                />
                <select
                  value={formData.is_active ? 'Active' : 'Inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'Active' })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">{selectedUniv?.name}</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Accreditation</p>
                      <p className="font-medium text-foreground">{selectedUniv?.accreditation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Wallet Address</p>
                      <p className="font-medium break-all text-foreground font-mono">{selectedUniv?.wallet_address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</p>
                      <span className={`badge-status ${selectedUniv?.is_active ? 'border-foreground' : 'border-border'}`}>
                        {selectedUniv?.is_active ? 'Active' : 'Inactive'}
                      </span>
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
              <h2 className="text-lg font-bold mb-2">Delete University</h2>
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
              toast.type === 'error' ? 'bg-white border-primary text-primary' : 'bg-primary text-white border-primary'
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