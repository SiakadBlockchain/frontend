'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  CheckCircle, 
  Clock, 
  Database, 
  ArrowRight, 
  Box, 
  Eye,
  Activity,
  X,
  Loader2,
  Hash,
  Layers
} from 'lucide-react';
import { fetchTransactions, fetchTransactionById, approveTransaction } from '@/lib/api';

export default function ValidatorDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [stats, setStats] = useState({
    totalBlocks: '0',
    confirmedTx: '0',
    pendingTx: '0'
  });
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTransactions(1, 50); 
      const data = response.data || [];
      
      setTransactions(data);
      
      const pendingCount = data.filter((t: any) => t.status === 'pending').length;
      const successCount = data.filter((t: any) => t.status === 'success').length;
      const latestBlockTx = data.find((t: any) => t.status === 'success' && t.block_number);
      const latestBlock = latestBlockTx ? latestBlockTx.block_number : '0';

      setStats({
        totalBlocks: latestBlock.toString(),
        confirmedTx: successCount.toString(),
        pendingTx: pendingCount.toString()
      });
    } catch (err) {
      showToast('Failed to synchronize dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  async function handleViewBlockDetail(id: string) {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await fetchTransactionById(id);
      setSelectedBlock(res.data);
    } catch (err) {
      showToast('Failed to fetch block metadata');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleQuickApprove(id: string) {
    try {
      await approveTransaction(id);
      showToast('Transaction confirmed and anchored', 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Validation process failed');
    }
  }

  const confirmedTransactions = transactions.filter(t => t.status === 'success');
  const pendingTransactions = transactions.filter(t => t.status === 'pending').slice(0, 5);

  return (
    <>
      <Breadcrumbs />
      <div className="flex-1 p-8 bg-background max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Validator Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time blockchain node status and ledger synchronization</p>
        </div>

        {/* Stats Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Current Block Height', value: `#${stats.totalBlocks}`, icon: Database, color: 'text-primary' },
            { label: 'Confirmed Ledger', value: stats.confirmedTx, icon: CheckCircle, color: 'text-primary' },
            { label: 'Pending Validation', value: stats.pendingTx, icon: Clock, color: 'text-primary' }
          ].map((stat, i) => (
            <div key={i} className="p-6 border border-border rounded-md bg-background flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon size={24} className="text-muted-foreground/30" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Section: Validation Queue */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-widest">Incoming Requests</h2>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-muted-foreground" size={20} /></div>
              ) : pendingTransactions.length > 0 ? (
                pendingTransactions.map((tx) => (
                  <div key={tx.id} className="group p-4 border border-border rounded-md hover:bg-muted/5 transition-colors flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase">{tx.tx_type?.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">REF: {tx.reference_id?.slice(0, 12)}...</p>
                    </div>
                    <button 
                      onClick={() => handleQuickApprove(tx.id)}
                      className="p-2 border border-border rounded-md hover:bg-primary hover:text-white transition-all"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border border-dashed border-border rounded-md">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Queue Clear</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Block Explorer */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-widest">Recent Blocks</h2>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-muted-foreground" size={20} /></div>
              ) : confirmedTransactions.length > 0 ? (
                confirmedTransactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="p-4 border border-border rounded-md flex items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-background border border-border rounded flex items-center justify-center">
                        <Box size={14} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold">Block #{tx.block_number}</p>
                        <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{tx.tx_hash?.slice(0, 20)}...</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewBlockDetail(tx.id)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md hover:bg-background text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm"
                    >
                      <Eye size={12} /> Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border border-dashed border-border rounded-md">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Genesis Block Only</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Modal - Same design as transactions */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-md w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Block Metadata Explorer</h2>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)}><X size={16} /></button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
              ) : (
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Block Identifier</p>
                    <p className="text-foreground font-bold text-base tracking-tight">Block #{selectedBlock?.block_number || 'Pending'}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Full Hash Details</p>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Hash size={8}/> Transaction Hash</p>
                      <p className="font-mono text-[10px] text-primary break-all bg-muted/30 p-3 rounded border border-border leading-relaxed">
                        {selectedBlock?.tx_hash || 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-md border border-border space-y-3">
                    {[
                      { label: 'Network status', value: 'Confirmed', color: 'text-green-600' },
                      { label: 'Gas Consumption', value: selectedBlock?.gas_used?.toLocaleString() || '0' },
                      { label: 'Creation Time', value: selectedBlock?.created_at ? new Date(selectedBlock.created_at).toLocaleString('en-US') : '-' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.label}</p>
                        <p className={`text-[10px] font-bold ${item.color || 'text-foreground'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="w-full py-3 bg-muted hover:bg-muted/80 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest border border-border"
                  >
                    Close Explorer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toast System */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-md border shadow-sm ${
              toast.type === 'error' ? 'bg-background border-red-500 text-red-600' : 'bg-primary text-white'
            }`}>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">System Notification</p>
                <p className="text-xs font-medium mt-1.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}