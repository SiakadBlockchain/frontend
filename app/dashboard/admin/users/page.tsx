'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Plus, Trash2, Eye, X, Loader2, Users, ShieldCheck, Info } from 'lucide-react';
import {
  fetchUsers,
  fetchUserById,
  createUser,
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
      showToast('Failed to load user data');
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
      showToast('Failed to load user details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAdd() {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      university_id: '',
    });
    setIsFormModalOpen(true);
  }

  async function handleSubmit() {
    try {
      await createUser(formData);
      showToast('User successfully created', 'success');
      setIsFormModalOpen(false);
      loadInitialData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "An error occurred";
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
      showToast('User successfully deleted', 'success');
    } catch (err) {
      showToast('Failed to delete user');
    }
  }

  const getUniversityName = (id: string) => {
    const univ = universities.find((u) => u.id === id);
    return univ ? univ.name : 'System Administrator';
  };

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage system access for administrators and university representatives</p>
          </div>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Full Name</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Email Address</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">System Role</th>
                  <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Retrieving Data</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 border border-border bg-muted/50 text-[10px] font-mono font-bold rounded uppercase tracking-tighter">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetail(u.id)} className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20 cursor-pointer"><Eye size={16} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-border rounded-md hover:bg-destructive/5 cursor-pointer"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-xs uppercase font-bold tracking-widest text-muted-foreground">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Register New User</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                  <input type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                  <input type="password" placeholder="Create secure password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all" />
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Role</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all appearance-none">
                      <option value="admin">Admin</option>
                      <option value="university">University User</option>
                    </select>
                  </div>
                  {formData.role === 'university' && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Affiliated University</label>
                      <select value={formData.university_id} onChange={(e) => setFormData({ ...formData, university_id: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:border-primary outline-none text-sm transition-all appearance-none">
                        <option value="">Select University</option>
                        {universities.map((univ) => <option key={univ.id} value={univ.id}>{univ.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer">Save User</button>
                <button onClick={() => setIsFormModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Identity Details</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer"><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Full Name</p>
                      <p className="font-bold text-lg">{selectedUser?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Address</p>
                      <p className="font-medium text-sm">{selectedUser?.email}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border space-y-5">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-primary" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Permission Info</h3>
                    </div>
                    <div className="space-y-4 bg-muted/20 p-4 rounded-md border border-border/50">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Assigned Role</p>
                        <p className="font-mono text-xs font-bold uppercase text-primary mt-1">{selectedUser?.role}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Organization</p>
                        <p className="text-xs font-medium">{getUniversityName(selectedUser?.university_id)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setIsDetailModalOpen(false)} className="w-full py-3 bg-muted hover:bg-muted/80 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest border border-border cursor-pointer">Close Preview</button>
                </div>
              )}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-sm p-8 text-center">
              <h2 className="text-lg font-bold tracking-tight">Revoke Access?</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-8">This action is permanent. The user will lose all administrative privileges immediately.</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 bg-destructive text-white py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer">Confirm Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 border border-border py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all cursor-pointer">Cancel</button>
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
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}