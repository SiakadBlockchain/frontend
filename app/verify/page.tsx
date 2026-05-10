'use client';

import { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Loader2, 
  X,
  ShieldCheck,
  Search,
  FileCheck,
  Hash,
  Calendar,
  Award
} from 'lucide-react';
import { AppNavbar } from '@/components/shared/app-navbar';
import { fetchStudentByKTP, fetchStudyByStudentId } from '@/lib/api'; 

export default function VerifyPage() {
  const [nik, setNik] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    student?: any;
    study?: any;
    diploma?: any;
  } | null>(null);

  const calculateHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile || !nik) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const studentRes = await fetchStudentByKTP(nik);
      const studentData = studentRes.data;

      const studyRes = await fetchStudyByStudentId(studentData.id);
      const studies = studyRes.data;

      if (!studies || studies.length === 0) {
        throw new Error('Student found, but no registered academic records available.');
      }

      const uploadedFileHash = await calculateHash(selectedFile);

      let foundDiploma = null;
      const matchedStudy = studies.find((s: any) => 
        s.diplomas.some((d: any) => {
          if (d.document_hash === uploadedFileHash) {
            foundDiploma = d;
            return true;
          }
          return false;
        })
      );

      if (matchedStudy && foundDiploma) {
        setVerificationResult({
          success: true,
          message: 'Verification Successful! The document integrity is verified by blockchain.',
          student: studentData,
          study: matchedStudy,
          diploma: foundDiploma
        });
      } else {
        setVerificationResult({
          success: false,
          message: 'Verification Failed. Document content mismatch.',
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail?.message || error.message || 'System error occurred.';
      setVerificationResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setNik('');
    setVerificationResult(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />

      <section className="border-b border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Document Authenticator</h1>
          <p className="text-muted-foreground">Verify diploma integrity using National ID and blockchain hash</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tambahkan items-stretch untuk memastikan kolom memiliki tinggi yang sama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Kolom Kiri: Verification Form */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-md bg-background overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Verification Form</h2>
              </div>
              
              {/* flex-grow memastikan area form mengisi sisa tinggi kartu */}
              <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      National ID Number (NIK)
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        placeholder="Enter 16-digit NIK"
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!selectedFile ? (
                      <label className="block cursor-pointer">
                        <div className="border border-dashed border-border rounded-md p-10 text-center hover:bg-muted/10 transition-all">
                          <Upload size={24} className="mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm font-semibold">Upload Digital Diploma</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF format only</p>
                        </div>
                        <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf" />
                      </label>
                    ) : (
                      <div className="border border-border rounded-md p-4 flex justify-between items-center bg-muted/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText size={20} className="text-primary flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-red-500 ml-2">
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    {isVerifying && (
                      <div className="flex items-center justify-center gap-3 py-4 border border-border rounded-md bg-muted/5">
                        <Loader2 className="animate-spin text-primary" size={18} />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Validating Hash...</p>
                      </div>
                    )}

                    {verificationResult && (
                      <div className={`p-4 rounded-md border flex gap-3 ${
                        verificationResult.success 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        {verificationResult.success ? <CheckCircle2 size={18} className="flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
                        <p className="text-xs font-medium leading-relaxed">{verificationResult.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  {!isVerifying && !verificationResult && (
                    <button
                      onClick={handleVerify}
                      disabled={!nik || !selectedFile}
                      className="flex-1 bg-primary text-white py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      Verify Now
                    </button>
                  )}
                  {(selectedFile || verificationResult) && (
                    <button 
                      onClick={handleReset} 
                      className="flex-1 border border-border py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all"
                    >
                      {verificationResult ? 'Verify Another' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Valid Academic Record */}
          <div className="lg:col-span-2">
            {verificationResult?.success ? (
              <div className="border border-border rounded-md bg-background overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCheck size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Valid Academic Record</h3>
                  </div>
                  <div className="px-2 py-1 bg-white/20 rounded text-[9px] font-bold uppercase">Verified</div>
                </div>

                <div className="p-8 flex-grow space-y-8 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Student Info */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <User size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                          <p className="font-bold text-base mt-1">{verificationResult.student.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student ID (NIM)</p>
                          <p className="font-mono text-sm mt-1">{verificationResult.study.nim}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Award size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Program of Study</p>
                          <p className="font-medium text-sm mt-1">{verificationResult.study.major}</p>
                        </div>
                      </div>
                    </div>

                    {/* Diploma Info */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <FileText size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diploma Number</p>
                          <p className="font-mono text-sm mt-1">{verificationResult.diploma.diploma_number}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Graduation Year</p>
                          <p className="font-medium text-sm mt-1">{verificationResult.diploma.graduationYear}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-green-600 mt-1" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                          <p className="text-green-600 font-bold text-xs uppercase tracking-wider mt-1">Authenticated</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div className="pt-8 border-t border-border mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash size={14} className="text-primary" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Blockchain Metadata</h4>
                    </div>
                    <div className="bg-muted/30 border border-border rounded-md p-4 space-y-4">
                      <div className="grid grid-cols-1 gap-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Hash</p>
                        <p className="font-mono text-[10px] break-all bg-background p-2 border border-border rounded text-muted-foreground">
                          {verificationResult.diploma.tx_hash}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state juga harus h-full agar grid tetap seimbang
              <div className="border border-border border-dashed rounded-md p-12 text-center h-full flex flex-col items-center justify-center bg-muted/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Awaiting Verification</p>
                <p className="text-xs text-muted-foreground mt-3 max-w-xs leading-relaxed">
                  The verified academic credentials and blockchain transaction details will appear here after successful document validation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}