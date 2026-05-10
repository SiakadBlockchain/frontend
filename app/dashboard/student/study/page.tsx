'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  GraduationCap, 
  Download, 
  Eye, 
  Loader2, 
  FileCheck, 
  X,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Hash,
  Award,
  Calendar
} from 'lucide-react';
import { 
  fetchStudyByStudentId, 
  fetchStudentById,
  otpRequest,
  verifyOtpAndActivate,
  verifyAndDownloadDiploma 
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StudentStudiesPage() {
  const { user, loading: authLoading } = useAuth();

  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return; 

    setLoading(true);
    try {
      const [studiesRes, studentRes] = await Promise.all([
        fetchStudyByStudentId(user.id),
        fetchStudentById(user.id)
      ]);

      const rawData = studiesRes.data || studiesRes;
      setStudies(Array.isArray(rawData) ? rawData : []);
      setStudentProfile(studentRes.data || studentRes);
    } catch (err) {
      console.error('Failed to load studies:', err);
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadData();
    }
  }, [authLoading, user?.id, loadData]);

  const handleOpenOtpModal = (study: any) => {
    setSelectedStudy(study);
    setOtpArray(new Array(6).fill(""));
    setOtpMessage(null);
    setIsOtpRequested(false);
    setIsOtpModalOpen(true);
  };

  const handleRequestOtp = async () => {
    if (!user?.id) return;
    setIsProcessing(true);
    setOtpMessage(null);
    try {
      await otpRequest({ student_id: user.id });
      setIsOtpRequested(true);
      setOtpMessage({ type: 'success', text: 'OTP code has been sent to your device.' });
    } catch (error: any) {
      setOtpMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAndDownload = async () => {
    const otpCode = otpArray.join("");
    if (!user?.id || otpCode.length < 6 || !selectedStudy) return;

    setIsProcessing(true);
    setOtpMessage(null);
    try {
      const verifyRes = await verifyOtpAndActivate({ 
        student_id: user.id, 
        otp_code: otpCode 
      });

      if (verifyRes.status === 'success') {
        const diplomaId = selectedStudy.diplomas[0].id;
        const blob = await verifyAndDownloadDiploma(diplomaId);

        if (blob.size < 100) {
          const text = await blob.text();
          const errorData = JSON.parse(text);
          setOtpMessage({ type: 'error', text: errorData.detail || 'Download failed.' });
          setIsProcessing(false);
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Diploma_${selectedStudy.nim}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setOtpMessage({ type: 'success', text: 'Verification successful! Downloading...' });
        setTimeout(() => setIsOtpModalOpen(false), 2000);
      }
    } catch (error: any) {
      setOtpMessage({ type: 'error', text: 'Invalid or expired OTP code.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-2" size={32} />
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading Academic Records...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Breadcrumbs />
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Study History</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Welcome, <span className="text-foreground font-semibold">{studentProfile?.name}</span>. Manage your academic enrollments and digital credentials.
          </p>
        </div>

        {studies.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-md bg-muted/5">
            <GraduationCap className="mx-auto text-muted-foreground/20 mb-4" size={48} />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No study records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <div key={study.id} className="group bg-background border border-border rounded-md overflow-hidden transition-colors hover:border-primary/50">
                <div className="p-5 border-b border-border bg-muted/10 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider leading-tight">{study.major}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-tighter">{study.level} Program</p>
                  </div>
                  {study.diplomas?.length > 0 && (
                    <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded border border-primary/20 tracking-widest">GRADUATED</span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileCheck size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Student ID (NIM)</p>
                      <p className="font-mono text-xs font-medium">{study.nim}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button 
                    onClick={() => { setSelectedStudy(study); setIsDetailModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    <Eye size={14} /> Details
                  </button>

                  {study.diplomas?.some((d: any) => d.status === 'valid') && (
                    <button 
                      onClick={() => handleOpenOtpModal(study)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      <Download size={14} /> Diploma
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isDetailModalOpen && selectedStudy && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                <h2 className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Academic Profile Information
                </h2>
                <button onClick={() => setIsDetailModalOpen(false)} className="hover:text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>

              <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

              <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Program of Study</p>
                    <p className="text-sm font-semibold">{selectedStudy.major}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Degree Level</p>
                    <p className="text-sm font-semibold">{selectedStudy.level}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Student ID</p>
                    <p className="text-sm font-mono font-medium">{selectedStudy.nim}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">University</p>
                    <p className="text-sm font-semibold">{selectedStudy.university?.name || '-'}</p>
                  </div>
                </div>

                {selectedStudy.diplomas?.[0] ? (
                  <div className="space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Digital Diploma Metadata</p>
                    </div>
                    
                    <div className="bg-muted/10 p-5 rounded-md space-y-6 border border-border">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Diploma Number</p>
                            <p className="text-xs font-mono font-bold mt-1">{selectedStudy.diplomas?.[0]?.diploma_number || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">{selectedStudy.diplomas?.[0]?.status || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Issued Date</p>
                            <p className="text-xs font-medium mt-1">
                            {selectedStudy.diplomas[0].issued_at 
                                ? new Date(selectedStudy.diplomas[0].issued_at).toLocaleDateString('en-US', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })
                                : '-'}
                            </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Hash size={10} /> Blockchain Transaction Hash
                        </p>
                        <p className="text-[9px] font-mono break-all bg-background p-3 border border-border rounded leading-relaxed text-muted-foreground">
                          {selectedStudy.diplomas[0].tx_hash}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/10 border border-dashed border-border p-6 rounded-md flex items-center gap-4">
                    <Calendar size={20} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Study is currently active. Digital diploma will be available upon completion and university validation.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/10 border-t border-border flex gap-3">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-background transition-colors"
                >
                  Close
                </button>
                {selectedStudy.diplomas?.[0] && (
                  <button 
                    onClick={() => { setIsDetailModalOpen(false); handleOpenOtpModal(selectedStudy); }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {isOtpModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-[70] p-4">
            <div className="w-full max-w-sm">
              <div className="text-center space-y-2 mb-10">
                <h2 className="text-xl font-bold tracking-tight">Security Verification</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Identity Validation Required</p>
              </div>

              <div className="bg-background border border-border p-8 rounded-md">
                {!isOtpRequested ? (
                  <div className="space-y-6">
                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      We will send a verification code to your registered mobile number via WhatsApp.
                    </p>
                    <button 
                      onClick={handleRequestOtp} 
                      disabled={isProcessing} 
                      className="w-full bg-primary text-white py-3 rounded-md font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Smartphone size={16} />}
                      Request OTP Code
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      {otpMessage && (
                        <div className={`p-3 rounded border text-[10px] font-bold flex items-center gap-2 justify-center ${otpMessage.type === 'success' ? 'bg-green-50/50 text-green-700 border-green-100' : 'bg-red-50/50 text-red-700 border-red-100'}`}>
                          {otpMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {otpMessage.text}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      {otpArray.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          ref={(el) => { inputRefs.current[index] = el; }}
                          value={data}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          className="w-10 h-12 bg-background border border-border rounded-md text-center text-lg font-mono font-bold focus:border-primary outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={handleVerifyAndDownload} 
                        disabled={isProcessing || otpArray.join("").length < 6} 
                        className="w-full bg-primary text-white py-3 rounded-md font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        Verify & Download
                      </button>
                      <button 
                        onClick={handleRequestOtp} 
                        className="w-full text-[9px] text-muted-foreground hover:text-primary font-bold uppercase tracking-widest transition-colors"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsOtpModalOpen(false)}
                className="w-full mt-6 text-[10px] text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest transition-colors"
              >
                Cancel Process
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}