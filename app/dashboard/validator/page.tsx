'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  CheckCircle, 
  Clock, 
  Database, 
  ArrowRight, 
  Box, 
  ExternalLink,
  ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { fetchTransactions, approveTransaction } from '@/lib/api';

export default function ValidatorDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false); // State untuk Load More
  const [stats, setStats] = useState({
    totalBlocks: '0',
    confirmedTx: '0',
    pendingTx: '0'
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mengambil data (misal 20 data terbaru)
      const response = await fetchTransactions(1, 20); 
      const data = response.data;
      
      setTransactions(data);
      
      const pendingCount = data.filter((t: any) => t.status === 'pending').length;
      const successCount = response.meta.total - pendingCount;
      const latestBlock = data.find((t: any) => t.block_number)?.block_number || '0';

      setStats({
        totalBlocks: latestBlock.toLocaleString(),
        confirmedTx: successCount.toLocaleString(),
        pendingTx: pendingCount.toString()
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApprove = async (txId: string) => {
    if (!confirm("Konfirmasi anchor data ke blockchain?")) return;
    try {
      await approveTransaction(txId);
      alert("Transaksi berhasil di-anchor ke blockchain!");
      loadDashboardData();
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.detail || "Terjadi kesalahan"));
    }
  };

  // 1. Filter status success
  // 2. Urutkan dari block_number terbesar ke terkecil
  const confirmedTransactions = transactions
    .filter(tx => tx.status === 'success')
    .sort((a, b) => (b.block_number || 0) - (a.block_number || 0));

  // 3. Logika pemotongan list untuk Load More
  const displayedTransactions = showAll 
    ? confirmedTransactions 
    : confirmedTransactions.slice(0, 5);

  const statConfig = [
    { label: 'Network Height', value: stats.totalBlocks, icon: Box, href: '#', description: 'Latest block number' },
    { label: 'Confirmed Transactions', value: stats.confirmedTx, icon: CheckCircle, href: '#', description: 'Successfully anchored' },
    { label: 'Pending Validations', value: stats.pendingTx, icon: Clock, href: '#', description: 'Awaiting validation' }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">Loading validator dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs />
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Validator Overview</h1>
          <p className="text-muted-foreground mt-2">Monitor blockchain network health and validate incoming data anchors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="border-card p-6 cursor-pointer table-row-hover">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="border border-border rounded-md p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Blockchain Explorer</h2>
                <p className="text-sm text-muted-foreground">Latest confirmed blocks on-chain</p>
              </div>
              <Database size={20} className="text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {displayedTransactions.length > 0 ? (
                <>
                  {displayedTransactions.map((tx) => (
                    <div key={tx.id} className="border border-border rounded-md p-4 flex items-center justify-between table-row-hover">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-2 rounded-md">
                          <Box size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-foreground text-sm">Block #{tx.block_number}</p>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">SUCCESS</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            Hash: {tx.tx_hash}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tombol Load More */}
                  {!showAll && confirmedTransactions.length > 5 && (
                    <button 
                      onClick={() => setShowAll(true)}
                      className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      Load More Transactions ({confirmedTransactions.length - 5} remaining)
                      <ChevronDown size={16} />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">No confirmed blocks found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}