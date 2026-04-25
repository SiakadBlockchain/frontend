'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Users, Eye, Download, X, Loader2, FileWarning, CheckCircle } from 'lucide-react';
import { AppNavbar } from '@/components/shared/app-navbar';
import { 
  fetchStudents, 
  fetchStudentById, 
  fetchUniversities, 
  verifyAndDownloadDiploma,
  fetchDiplomas 
} from '@/lib/api';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [diplomaList, setDiplomaList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [univRes, diplomaRes] = await Promise.all([
          fetchUniversities(),
          fetchDiplomas(1, 1000)
        ]);
        setUniversities(univRes.data);
        setDiplomaList(diplomaRes.data);
      } catch (err) {
        console.error("Failed to load reference data:", err);
      }
    };
    loadInitialData();
  }, []);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const checkDiplomaStatus = (studentId: string) => {
    return diplomaList.find((d: any) => d.student_id === studentId);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setLoading(true);
        try {
          const res = await fetchStudents(1, 50);
          const filtered = res.data.filter((s: any) => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.nim.includes(searchQuery)
          );
          setSearchResults(filtered);
        } catch (err) {
          showToast('Search failed');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchStudentById(id);
      const studentData = res.data;
      const linkedDiploma = checkDiplomaStatus(id);
      
      setSelectedStudent({
        ...studentData,
        diploma_id: linkedDiploma ? linkedDiploma.id : null,
        diploma_status: linkedDiploma ? linkedDiploma.status : 'not_found'
      });
    } catch (err) {
      showToast('Failed to retrieve student details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent?.diploma_id) return;

    setIsVerifying(true);
    try {
      const blob = await verifyAndDownloadDiploma(selectedStudent.diploma_id, file);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Diploma_${selectedStudent.nim}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      showToast('Verification successful! Downloading file...', 'success');
      setIsDetailModalOpen(false);
    } catch (err: any) {
      showToast('Error: Invalid key or corrupted file.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getUnivName = (id: string) => universities.find(u => u.id === id)?.name || 'University';

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Search Diploma</h1>
          <p className="text-muted-foreground mt-2">Blockchain-Based Academic Verification System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
          <p className="text-muted-foreground mt-2 text-center mb-4">Search for a student by name or NIM</p>
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Enter Student Name or NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-lg bg-background focus:border-primary outline-none transition-all text-lg"
            />
          </div>

          <div className="grid gap-3">
            {loading ? (
              <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : searchResults.map((student) => {
              const hasDiploma = checkDiplomaStatus(student.id);
              return (
                <div key={student.id} className="flex items-center justify-between p-5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group">
                  <div className="flex gap-4 items-center">
                    <div className={`p-3 rounded-full ${hasDiploma ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'}`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {student.name}
                        {hasDiploma && <CheckCircle size={14} className="text-primary" />}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono">{student.nim}</p>
                      <p className="text-[10px] text-primary uppercase font-bold mt-1 tracking-wider">{getUnivName(student.university_id)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleViewDetail(student.id)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-bold text-sm hover:bg-primary/90 shadow-sm transition-all">
                    <Eye size={16} /> View Details
                  </button>
                </div>
              );
            })}
            
            {searchQuery.length > 1 && searchResults.length === 0 && !loading && (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No students matched your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            {detailLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Synchronizing Data...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-xl font-bold">Academic Information</h2>
                  <button onClick={() => setIsDetailModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Student Name</label>
                      <p className="font-bold text-foreground leading-tight">{selectedStudent?.name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">NIM</label>
                      <p className="font-mono font-bold text-foreground">{selectedStudent?.nim}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Institution</label>
                    <p className="text-foreground font-semibold">{getUnivName(selectedStudent?.university_id)}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-foreground">Digital Diploma Status</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${selectedStudent?.diploma_id ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {selectedStudent?.diploma_id ? 'Available' : 'Not Registered'}
                      </span>
                    </div>

                    {selectedStudent?.diploma_id ? (
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept=".txt" 
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          disabled={isVerifying}
                        />
                        <div className={`p-8 border-2 border-dashed rounded-xl text-center transition-all ${isVerifying ? 'bg-muted border-muted' : 'border-primary/20 bg-primary/5 group-hover:border-primary group-hover:bg-primary/10'}`}>
                          {isVerifying ? (
                            <><Loader2 className="animate-spin mx-auto text-primary mb-2" /><p className="text-xs font-bold text-primary">Blockchain Verification...</p></>
                          ) : (
                            <><Download className="mx-auto text-primary mb-2" size={28} /><p className="text-xs font-black text-primary uppercase">Click to Upload Private Key</p><p className="text-[9px] text-muted-foreground mt-1 font-medium">Use the .txt file to download the PDF Diploma</p></>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-lg flex items-start gap-3">
                        <FileWarning size={20} className="text-destructive shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-destructive">Diploma Data Not Found</p>
                          <p className="text-[10px] text-destructive/80 leading-tight mt-0.5">This student has not yet uploaded or processed their diploma into the blockchain system.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer w-full mt-8 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-bold text-sm transition-colors uppercase tracking-widest">Close</button>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border-2 ${toast.type === 'error' ? 'bg-white border-primary text-primary' : 'bg-primary text-white border-primary'}`}>
            <div className="flex flex-col">
              <p className="text-sm font-black uppercase tracking-tight">{toast.type === 'error' ? 'Failed' : 'Success'}</p>
              <p className="text-xs font-medium opacity-90 leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors"><X size={18} /></button>
          </div>
        </div>
      )}
    </main>
  );
}