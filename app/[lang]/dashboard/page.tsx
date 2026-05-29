"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoRefreshOutline } from "react-icons/io5";

type Payment = {
  id: string;
  user_id: string;
  amount: number;
  screenshot_url: string;
  status: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { localizeHref } = useLanguage();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    // Fetch pending payments with user details
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayments(data as Payment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== 'omarrmdn2024@gmail.com') {
        router.replace(localizeHref('/'));
      } else {
        fetchPayments();
      }
    }
  }, [user, authLoading]);

  const handleVerify = async (payment: Payment) => {
    setActionLoading(payment.id);
    try {
      // 1. Update payment status
      await supabase
        .from('payments')
        .update({ status: 'verified' })
        .eq('id', payment.id);

      // 2. Mark user's unpaid events as paid
      await supabase
        .from('events')
        .update({ fee_paid: true })
        .eq('organizer_id', payment.user_id)
        .gt('price', 0)
        .is('fee_paid', false);

      // 3. Unban user if banned
      await supabase
        .from('users')
        .update({ banned: false })
        .eq('id', payment.user_id);

      // Remove from list
      setPayments(payments.filter(p => p.id !== payment.id));
    } catch (err) {
      console.error("Error verifying payment:", err);
      alert("Failed to verify payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);

      setPayments(payments.filter(p => p.id !== paymentId));
    } catch (err) {
      console.error("Error rejecting payment:", err);
      alert("Failed to reject payment");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
      <TopBar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>Admin Dashboard</h1>
          <button 
            onClick={fetchPayments} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '8px 16px', backgroundColor: '#1e1e1e', 
              color: '#fff', border: '1px solid #333', 
              borderRadius: '8px', cursor: 'pointer' 
            }}
          >
            <IoRefreshOutline size={20} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner-small" style={{ margin: '0 auto', borderTopColor: '#007aff' }}></div>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#aaa' }}>No pending payments</h3>
            <p style={{ margin: 0, color: '#666' }}>All good! No users are waiting for verification.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {payments.map(payment => (
              <div key={payment.id} style={{ 
                backgroundColor: '#1e1e1e', 
                borderRadius: '12px', 
                border: '1px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{payment.users?.name || 'Unknown User'}</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#888', fontSize: '14px' }}>{payment.users?.email}</p>
                    <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#2c2c2c', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', color: '#007aff' }}>
                      {payment.amount} EGP
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(payment.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>Payment Screenshot</p>
                    <a href={payment.screenshot_url} target="_blank" rel="noreferrer">
                      <img 
                        src={payment.screenshot_url} 
                        alt="Payment Screenshot" 
                        style={{ 
                          width: '100%', 
                          maxHeight: '400px', 
                          objectFit: 'contain', 
                          backgroundColor: '#121212',
                          borderRadius: '8px',
                          border: '1px solid #333'
                        }} 
                      />
                    </a>
                  </div>
                  
                  <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleVerify(payment)}
                      disabled={actionLoading === payment.id}
                      style={{
                        padding: '14px',
                        backgroundColor: '#34c759',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: actionLoading === payment.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 'bold',
                        opacity: actionLoading === payment.id ? 0.7 : 1
                      }}
                    >
                      <IoCheckmarkCircleOutline size={20} />
                      {actionLoading === payment.id ? 'Verifying...' : 'Accept'}
                    </button>
                    
                    <button
                      onClick={() => handleReject(payment.id)}
                      disabled={actionLoading === payment.id}
                      style={{
                        padding: '14px',
                        backgroundColor: 'transparent',
                        color: '#ff453a',
                        border: '1px solid #ff453a',
                        borderRadius: '8px',
                        cursor: actionLoading === payment.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 'bold',
                        opacity: actionLoading === payment.id ? 0.7 : 1
                      }}
                    >
                      <IoCloseCircleOutline size={20} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
