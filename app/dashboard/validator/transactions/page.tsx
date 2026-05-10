'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  CheckCircle, 
  Clock, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  Hash, 
  Loader2, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { fetchTransactions, fetchTransactionById, approveTransaction } from '@/lib/api';

export default function ValidatorTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions(page, limit);
      setTransactions(Array.isArray(res?.data) ? res.data : []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      showToast('Failed to load transaction data');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleViewDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchTransactionById(id);
      setSelectedTx(res.data);
    } catch (err) {
      showToast('Failed to fetch transaction details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await approveTransaction(id);
      showToast('Transaction successfully anchored to blockchain', 'success');
      loadTransactions();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail?.message || "Validation failed";
      showToast(errorMsg);
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor and validate blockchain ledger activities</p>
          </div>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Transaction Type</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Reference ID</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Date Created</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Retrieving Ledger</p>
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground uppercase text-[11px] tracking-tight">
                            {tx.tx_type?.replace(/_/g, ' ') || 'UNKNOWN'}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono">ID: {tx.id?.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border w-fit">
                          <Hash size={10} />
                          {tx.reference_id?.slice(0, 12)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === 'success' ? 'text-green-600' : 
                            tx.status === 'pending' ? 'text-orange-500' : 'text-red-600'
                        }`}>
                            {tx.status === 'success' ? <CheckCircle size={14} /> : 
                             tx.status === 'pending' ? <Clock size={14} /> : <AlertCircle size={14} />}
                            {tx.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => handleViewDetail(tx.id)} 
                            className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border rounded-md hover:bg-muted/20"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {tx.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(tx.id)} 
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md hover:opacity-90 font-bold text-[10px] uppercase tracking-widest transition-all"
                            >
                              Approve <ArrowRight size={14} />
                            </button>
                          )}
                          
                          {tx.status === 'success' && (
                            <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold rounded uppercase tracking-tighter">
                              On Chain
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">No transactions recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <button 
            disabled={page === 1 || loading} 
            onClick={() => setPage((p) => p - 1)} 
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted transition-all disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <button 
            disabled={page === totalPages || totalPages === 0 || loading} 
            onClick={() => setPage((p) => p + 1)} 
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border rounded-md hover:bg-muted transition-all disabled:opacity-30"
          >
            Next
          </button>
        </div>

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Blockchain Metadata</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)}><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Transaction Type</p>
                    <p className="text-foreground font-bold text-base uppercase tracking-tight">
                      {selectedTx?.tx_type?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">On-Chain Data</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Blockchain Hash</p>
                        <p className="font-mono text-[10px] text-primary break-all bg-muted/30 p-3 rounded border border-border leading-relaxed">
                          {selectedTx?.tx_hash || 'Awaiting validation...'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Block Number</p>
                          <p className="font-mono text-xs font-bold">#{selectedTx?.block_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Gas Used</p>
                          <p className="font-mono text-xs font-bold">{selectedTx?.gas_used?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-md border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Reference ID</p>
                      <p className="text-[10px] font-mono">{selectedTx?.reference_id?.slice(0, 16)}...</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Timestamp</p>
                      <p className="text-[10px] font-medium">
                        {selectedTx?.created_at ? new Date(selectedTx.created_at).toLocaleString('en-US') : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full py-3 bg-muted hover:bg-muted/80 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest border border-border"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-md border shadow-sm ${
              toast.type === 'error' ? 'bg-background border-red-500 text-red-600' : 'bg-primary text-white border-primary'
            }`}>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{toast.type === 'error' ? 'System Error' : 'Ledger Update'}</p>
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