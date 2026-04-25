'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { CheckCircle, Clock, X, AlertCircle, ArrowRight, Eye } from 'lucide-react';
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
      setTransactions(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      showToast('Gagal memuat data transaksi');
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
      showToast('Gagal mengambil detail transaksi');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await approveTransaction(id);
      showToast('Transaksi berhasil di-anchor ke blockchain', 'success');
      loadTransactions();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Gagal melakukan validasi";
      showToast(errorMsg);
    }
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions Management</h1>
            <p className="text-muted-foreground mt-2">Monitor and validate blockchain ledger activities</p>
          </div>
        </div>

        <div className="border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Transaction Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Wallet Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center p-6 text-muted-foreground">Loading transactions...</td></tr>
                ) : transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border table-row-hover">
                    <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col">
                            <span>{tx.tx_type.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {tx.id.slice(0, 8)}...</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{tx.wallet_address.slice(0, 16)}...</td>
                    <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-xs font-medium ${
                            tx.status === 'success' ? 'text-green-600' : 
                            tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                            {tx.status === 'success' ? <CheckCircle size={14} /> : 
                             tx.status === 'pending' ? <Clock size={14} /> : <AlertCircle size={14} />}
                            <span className="capitalize">{tx.status}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-start text-sm">
                        <button onClick={() => handleViewDetail(tx.id)} className="cursor-pointer p-2 rounded-md border border-border hover:bg-muted" title="View Detail">
                            <Eye size={16} />
                        </button>
                        {tx.status === 'success' ? (
                          <button 
                              disabled
                              className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground border border-border rounded-md font-medium text-xs cursor-not-allowed opacity-70"
                          >
                              Approve <CheckCircle size={14} />
                          </button>
                      ) : tx.status === 'pending' ? (
                          <button 
                              onClick={() => handleApprove(tx.id)} 
                              className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium text-xs transition-all cursor-pointer"
                          >
                              Approve <ArrowRight size={14} />
                          </button>
                      ) : (
                          <span className="text-xs text-muted-foreground italic">No Action</span>
                      )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-4 py-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 shadow-xl">
              {detailLoading ? <p className="text-center p-4">Loading details...</p> : (
                <>
                  <h2 className="text-lg font-bold mb-4 border-b pb-2">Transaction Details</h2>
                  <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</p>
                        <p className="text-foreground font-medium">{selectedTx?.tx_type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transaction Hash</p>
                        <p className="font-mono text-xs text-primary break-all bg-muted p-2 rounded mt-1 border border-border">
                            {selectedTx?.tx_hash || 'Not anchored yet'}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Block Number</p>
                            <p className="text-foreground font-mono">{selectedTx?.block_number || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gas Used</p>
                            <p className="text-foreground font-mono">{selectedTx?.gas_used?.toLocaleString() || '-'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reference ID (Diploma/Uni)</p>
                        <p className="text-xs font-mono text-muted-foreground">{selectedTx?.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailModalOpen(false)} className="cursor-pointer w-full mt-8 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors font-medium">Close</button>
                </>
              )}
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