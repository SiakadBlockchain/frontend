'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search as SearchIcon, 
  Users, 
  Eye, 
  Download, 
  X, 
  Loader2, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { AppNavbar } from '@/components/shared/app-navbar';
import { 
  fetchStudents, 
  fetchUniversities, 
  verifyAndDownloadDiploma,
  fetchStudyByStudentId,
  otpRequest,
  verifyOtpAndActivate
} from '@/lib/api';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStudyDetailModalOpen, setIsStudyDetailModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentStudies, setStudentStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  
  const [inputPhoneNumber, setInputPhoneNumber] = useState('');
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const univRes = await fetchUniversities();
        setUniversities(univRes.data);
      } catch (err) {
        console.error("Failed to load universities:", err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setLoading(true);
        try {
          const res = await fetchStudents(1, 50);
          const filtered = res.data.filter((s: any) => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.ktp_number?.includes(searchQuery)
          );
          setSearchResults(filtered);
        } catch (err) {
          console.error('Search failed');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleViewStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
    try {
      const res = await fetchStudyByStudentId(student.id);
      setStudentStudies(Array.isArray(res.data) ? res.data : res);
    } catch (err) {
      setStudentStudies([]);
    }
  };

  const handleOpenStudyDetail = (study: any) => {
    setSelectedStudy(study);
    setIsStudyDetailModalOpen(true);
  };

  const handleStartDownloadFlow = () => {
    setOtpMessage(null);
    setIsOtpRequested(false);
    setInputPhoneNumber('');
    setOtpArray(new Array(6).fill(""));
    setIsOtpModalOpen(true);
  };

  const handleVerifyPhoneAndSendOtp = async () => {
    if (inputPhoneNumber !== selectedStudent?.phone_number) {
      setOtpMessage({ type: 'error', text: 'Phone number does not match registered data.' });
      return;
    }

    setIsProcessing(true);
    setOtpMessage(null);
    try {
      await otpRequest({ student_id: selectedStudent.id });
      setIsOtpRequested(true);
      setOtpMessage({ type: 'success', text: 'OTP code has been sent to your WhatsApp.' });
    } catch (error) {
      setOtpMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const val = value.substring(value.length - 1);
    if (isNaN(Number(val))) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;
    setOtpArray(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFinalVerifyAndDownload = async () => {
    const otpCode = otpArray.join("");
    setIsProcessing(true);
    try {
      const verifyRes = await verifyOtpAndActivate({ 
        student_id: selectedStudent.id, 
        otp_code: otpCode 
      });

      if (verifyRes.status === 'success') {
        const diplomaId = selectedStudy.diplomas[0].id;
        const blob = await verifyAndDownloadDiploma(diplomaId);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Diploma_${selectedStudy.nim}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setOtpMessage({ type: 'success', text: 'Verification successful! Downloading...' });
        setTimeout(() => {
          setIsOtpModalOpen(false);
          setIsStudyDetailModalOpen(false);
        }, 2000);
      }
    } catch (error) {
      setOtpMessage({ type: 'error', text: 'Invalid or expired OTP.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getUnivName = (id: string) => universities.find(u => u.id === id)?.name || 'University';

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />

      <section className="border-b border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Diploma Search</h1>
          <p className="text-muted-foreground">Find and verify academic credentials instantly</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="relative mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search by student name or NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-medium uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">National ID</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                  </td>
                </tr>
              ) : searchResults.length > 0 ? (
                searchResults.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-primary" />
                        <span className="font-semibold">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-muted-foreground">
                      {student.ktp_number || '-'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleViewStudentDetails(student)}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        View Profile <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    {searchQuery.length > 1 ? "No records found." : "Search by name to see results."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-md w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Academic Profile</h2>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
            </div>

            <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="p-8 overflow-y-auto space-y-10 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                  <p className="font-medium text-lg">{selectedStudent.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                  <p className="">{selectedStudent.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Place and Date of Birth</p>
                  <p className="">{selectedStudent.place_and_date_of_birth}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Study History</h3>
                <div className="divide-y divide-border">
                  {studentStudies.length > 0 ? studentStudies.map((study) => {
                    const hasDiploma = study.diplomas && study.diplomas.length > 0;
                    
                    return (
                      <div key={study.id} className="py-6 flex justify-between items-center group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground">{study.major}</p>
                            {/* Status Badge Minimalis */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              hasDiploma 
                                ? 'text-green-600 border-green-200 bg-green-50/50' 
                                : 'text-blue-600 border-blue-200 bg-blue-50/50'
                            }`}>
                              {hasDiploma ? 'Graduated' : 'On Going'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getUnivName(study.university_id)} • NIM: {study.nim}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleOpenStudyDetail(study)}
                          className="px-4 py-2 border border-border rounded-md text-xs font-bold uppercase tracking-tighter hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    );
                  }) : (
                    <p className="py-8 text-center text-sm text-muted-foreground italic">No study records found.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}

      {isStudyDetailModalOpen && selectedStudy && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/10">
              <h2 className="text-xs font-bold uppercase tracking-widest">Information</h2>
              <button onClick={() => setIsStudyDetailModalOpen(false)}><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Degree Level</span>
                  <span className="font-medium">{selectedStudy.level}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium">{selectedStudy.major}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Student ID</span>
                  <span className="font-mono">{selectedStudy.nim}</span>
                </div>
              </div>

              {selectedStudy.diplomas?.[0] ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 border border-border rounded-md space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider">
                        Blockchain Status
                      </p>
                      <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
                        <CheckCircle2 size={14} /> Verified Valid
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 tracking-wider">
                        Transaction Hash
                      </p>
                      <p className="text-[10px] font-mono break-all text-muted-foreground bg-background/50 p-2 rounded border border-border/40">
                        {selectedStudy.diplomas[0].tx_hash}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleStartDownloadFlow}
                    className="w-full py-4 bg-primary text-white rounded-md font-bold text-sm hover:opacity-90 transition-all uppercase tracking-widest"
                  >
                    Download Diploma
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-muted/10 border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Diploma not yet available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-[70] p-4">
          <div className="w-full max-w-sm">
            <div className="text-center space-y-2 mb-8">
              <Smartphone size={32} className="mx-auto text-primary" />
              <h2 className="text-xl font-bold">Verification Required</h2>
              <p className="text-sm text-muted-foreground">Protecting your digital credentials</p>
            </div>

            <div className="bg-background border border-border p-8 rounded-md">
              {!isOtpRequested ? (
                <div className="space-y-4">
                  <p className="text-xs text-center text-muted-foreground mb-4">Enter phone number registered to {selectedStudent?.name}</p>
                  <input 
                    type="text"
                    placeholder="e.g. 0812..."
                    value={inputPhoneNumber}
                    onChange={(e) => setInputPhoneNumber(e.target.value)}
                    className="w-full p-3 border border-border rounded-md text-center font-mono focus:border-primary outline-none"
                  />
                  {otpMessage && <p className="text-[10px] text-center text-red-500 font-bold">{otpMessage.text}</p>}
                  <button 
                    onClick={handleVerifyPhoneAndSendOtp}
                    disabled={isProcessing}
                    className="w-full bg-primary text-white py-3 rounded-md font-bold text-xs uppercase tracking-widest"
                  >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Request OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otpArray.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        ref={(el) => { inputRefs.current[index] = el; }}
                        value={data}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        className="w-full h-12 border border-border rounded-md text-center text-xl font-bold focus:border-primary outline-none"
                      />
                    ))}
                  </div>
                  {otpMessage && <p className="text-[10px] text-center text-green-600 font-bold uppercase">{otpMessage.text}</p>}
                  <button 
                    onClick={handleFinalVerifyAndDownload} 
                    disabled={isProcessing || otpArray.join("").length < 6} 
                    className="w-full bg-primary text-white py-3 rounded-md font-bold text-xs uppercase tracking-widest"
                  >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Verify & Download"}
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsOtpModalOpen(false)}
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground font-medium uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}