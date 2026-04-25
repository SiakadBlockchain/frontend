'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  fetchUniversities,
} from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    university_id: '',
  });

  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, univRes] = await Promise.all([
        fetchUsers(),
        fetchUniversities(1, 100),
      ]);
      setUsers(userRes.data);
      setUniversities(univRes.data);
    } catch (err) {
      showToast('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchUserById(id);
      setSelectedUser(res.data);
    } catch (err) {
      showToast('Gagal memuat detail pengguna');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setIsEdit(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      university_id: '',
    });
    setIsFormModalOpen(true);
  }

  function handleEdit(user: any) {
    setIsEdit(true);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      university_id: user.university_id || '',
    });
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (isEdit) {
        const { password, ...updateData } = formData;
        await updateUser(selectedUser.id, updateData);
        showToast('Pengguna berhasil diperbarui', 'success');
      } else {
        await createUser(formData);
        showToast('Pengguna berhasil ditambahkan', 'success');
      }
      setIsFormModalOpen(false);
      loadInitialData();
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
      await deleteUser(selectedDeleteId);
      setIsDeleteModalOpen(false);
      loadInitialData();
      showToast('Pengguna berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus pengguna');
    }
  }

  const getUniversityName = (id: string) => {
    const univ = universities.find((u) => u.id === id);
    return univ ? univ.name : 'Not Associated / Admin';
  };

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-2">Manage system administrators and university users</p>
          </div>
        </div>

        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center p-6 text-muted-foreground">Loading data...</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-border table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-muted border border-border uppercase">{u.role}</span>
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

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
              <div className="space-y-3">
                <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none" />
                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none" />
                {!isEdit && (
                  <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none" />
                )}
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none">
                  <option value="admin">Admin</option>
                  <option value="university">University User</option>
                </select>
                {formData.role === 'university' && (
                  <select value={formData.university_id} onChange={(e) => setFormData({ ...formData, university_id: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none">
                    <option value="">Select University</option>
                    {universities.map((univ) => <option key={univ.id} value={univ.id}>{univ.name}</option>)}
                  </select>
                )}
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
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">User Detail</h2>
                  <div className="space-y-4 text-sm">
                    <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Name</p><p className="font-medium">{selectedUser?.name}</p></div>
                    <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Email</p><p className="font-medium">{selectedUser?.email}</p></div>
                    <div><p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Role</p><p className="font-medium uppercase">{selectedUser?.role}</p></div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">University Name</p>
                      <p className="font-medium text-primary">{getUniversityName(selectedUser?.university_id)}</p>
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
              <h2 className="text-lg font-bold mb-2">Delete User</h2>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this user?</p>
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